import { streamClient } from "../config/streamVideo.js";
import Booking from "../models/Booking.js";

const PRE_JOIN_MINUTES = 10;

export const getStreamTokenForBooking = async (req, res) => {
  try {
    if (!streamClient) {
      throw new Error("Stream client not configured on server");
    }

    const userId = req.user?._id?.toString();
    const { bookingId } = req.params;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
    }

    if (!bookingId) {
      return res
        .status(400)
        .json({ success: false, message: "bookingId is required" });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    // ----- DEBUG LOGS -----
    console.log("getStreamTokenForBooking");
    console.log("  userId            =", userId);
    console.log("  booking._id       =", booking._id?.toString());
    console.log("  booking.clientId  =", booking.clientId?.toString());
    console.log("  booking.counselorId =", booking.counselorId?.toString());

    // ----- Access check -----
    const isClient =
      booking.clientId && booking.clientId.toString() === userId;
    const isCounselor =
      booking.counselorId && booking.counselorId.toString() === userId;

    if (!isClient && !isCounselor) {
      return res
        .status(403)
        .json({ success: false, message: "Not allowed for this booking" });
    }

    // ----- Time window check -----
    let start = null;
    let end = null;

    // Prefer startDateTime / endDateTime if they exist
    if (booking.startDateTime && booking.endDateTime) {
      start = new Date(booking.startDateTime);
      end = new Date(booking.endDateTime);
    } else if (booking.date && booking.time) {
      // Build from date + time + durationMin
      const [year, month, day] = booking.date.split("-");
      const [hour, minute] = booking.time.split(":");
      start = new Date(year, month - 1, day, hour, minute);

      const duration = booking.durationMin || 60;
      end = new Date(start.getTime() + duration * 60 * 1000);
    } else {
      // If no date/time info, skip time restrictions (optional)
      console.warn(
        "Booking has no date/time info, skipping time window check for",
        booking._id.toString()
      );
      const token = streamClient.createToken(userId);
      return res.json({
        success: true,
        apiKey: process.env.STREAM_API_KEY,
        userId,
        token,
      });
    }

    const now = new Date();
    const joinOpensAt = new Date(
      start.getTime() - PRE_JOIN_MINUTES * 60 * 1000
    );

    console.log("  now         =", now.toISOString());
    console.log("  start       =", start.toISOString());
    console.log("  joinOpensAt =", joinOpensAt.toISOString());
    console.log("  end         =", end.toISOString());

    if (now < joinOpensAt) {
      return res.status(403).json({
        success: false,
        reason: "too_early",
        message: `Call not open yet. You can join ${PRE_JOIN_MINUTES} minutes before start.`,
      });
    }

    if (now > end) {
      return res.status(403).json({
        success: false,
        reason: "too_late",
        message: "This call has already finished.",
      });
    }

    // ----- Generate Stream token -----
    const token = streamClient.createToken(userId);

    return res.json({
      success: true,
      apiKey: process.env.STREAM_API_KEY,
      userId,
      token,
    });
  } catch (err) {
    console.error("Error generating Stream token:", err);
    // For now, send detailed error to help debugging
    res.status(500).json({
      success: false,
      message: err.message,
      // remove stack in production
      stack: err.stack,
    });
  }
};