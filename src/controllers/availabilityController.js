// src/controllers/availabilityController.js
import CounselorAvailability from "../models/CounselorAvailability.js";
import Booking from "../models/Booking.js";

// Helper: combine "YYYY-MM-DD" + "HH:MM" => Date object
const parseTimeOnDate = (dateStr, timeStr) => {
  const [year, month, day] = dateStr.split("-");
  const [hour, minute] = timeStr.split(":");
  return new Date(year, month - 1, day, hour, minute);
};

const formatHHMM = (date) => date.toTimeString().slice(0, 5);

// Counselor: create or update their weekly availability
export const upsertAvailability = async (req, res) => {
  try {
    const counselorId = req.user?._id;
    if (!counselorId) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    const { slots } = req.body; // [{dayOfWeek, startTime, endTime, durationMin}, ...]

    if (!Array.isArray(slots)) {
      return res
        .status(400)
        .json({ success: false, message: "slots array required" });
    }

    const doc = await CounselorAvailability.findOneAndUpdate(
      { counselorId },
      { slots },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, data: doc });
  } catch (err) {
    console.error("upsertAvailability error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to save availability" });
  }
};

// Get weekly availability config (for counselor / public)
export const getWeeklyAvailability = async (req, res) => {
  try {
    const { counselorId } = req.params;
    const doc = await CounselorAvailability.findOne({ counselorId });
    res.json({ success: true, data: doc || { counselorId, slots: [] } });
  } catch (err) {
    console.error("getWeeklyAvailability error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to load availability" });
  }
};

// Get actual free time slots for a specific date (removing booked ones)
export const getAvailableSlotsForDate = async (req, res) => {
  try {
    const { counselorId, date } = req.params; // date: "YYYY-MM-DD"
    const requestedDuration =
      Number(req.query.durationMin) || Number(req.query.duration) || null;

    if (!counselorId || !date) {
      return res
        .status(400)
        .json({ success: false, message: "counselorId and date required" });
    }

    const target = new Date(date);
    if (Number.isNaN(target.getTime())) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid date format" });
    }

    const dayOfWeek = target.getDay(); // 0-6
    const availability = await CounselorAvailability.findOne({ counselorId });

    if (!availability || !availability.slots.length) {
      return res.json({ success: true, slots: [] });
    }

    const daySlots = availability.slots.filter(
      (s) => s.dayOfWeek === dayOfWeek
    );

    if (!daySlots.length) {
      return res.json({ success: true, slots: [] });
    }

    // all bookings that day
    const bookings = await Booking.find({
      counselorId,
      date,
      status: { $ne: "cancelled" },
    });

    const freeSlots = [];

    for (const slot of daySlots) {
      // use client-chosen duration if provided, else slot.durationMin, else 60
      const duration = requestedDuration || slot.durationMin || 60;

      let currentStart = parseTimeOnDate(date, slot.startTime);
      const slotEnd = parseTimeOnDate(date, slot.endTime);

      while (currentStart.getTime() + duration * 60 * 1000 <= slotEnd.getTime()) {
        const currentEnd = new Date(
          currentStart.getTime() + duration * 60 * 1000
        );

        const overlaps = bookings.some((b) => {
          let bStart = b.startDateTime
            ? new Date(b.startDateTime)
            : parseTimeOnDate(b.date, b.time);
          let bEnd =
            b.endDateTime ||
            new Date(
              bStart.getTime() + (b.durationMin || 60) * 60 * 1000
            );

          return (
            currentStart < bEnd &&
            currentEnd > bStart &&
            b.status !== "cancelled"
          );
        });

        if (!overlaps) {
          freeSlots.push({
            startDateTime: currentStart,
            endDateTime: currentEnd,
            startTime: formatHHMM(currentStart),
            endTime: formatHHMM(currentEnd),
            durationMin: duration,
          });
        }

        // move to next possible start (same step as duration so slots don't overlap)
        currentStart = new Date(
          currentStart.getTime() + duration * 60 * 1000
        );
      }
    }

    res.json({ success: true, slots: freeSlots });
  } catch (err) {
    console.error("getAvailableSlotsForDate error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to load available slots" });
  }
};