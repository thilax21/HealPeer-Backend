import Availability from "../models/Availability.js";
import Booking from "../models/Booking.js";

/**
 * counselor sets/updates weekly availability
 * body: { days: [{ day: "Monday", slots: [{start:"09:00", end:"10:00"}] }, ...] }
 */
export const setAvailability = async (req, res) => {
  try {
    const counselorId = req.user._id;
    const { days } = req.body;

    let availability = await Availability.findOne({ counselor: counselorId });
    if (!availability) {
      availability = new Availability({ counselor: counselorId, days });
    } else {
      availability.days = days;
    }
    await availability.save();
    res.status(200).json({ success:true, data: availability });
  } catch (err) {
    res.status(500).json({ success:false, message: err.message });
  }
};

export const getAvailability = async (req, res) => {
  try {
    const { counselorId } = req.params;
    const availability = await Availability.findOne({ counselor: counselorId });
    if (!availability) return res.status(404).json({ success:false, message: "No availability" });
    res.json({ success:true, data:availability });
  } catch (err) {
    res.status(500).json({ success:false, message: err.message });
  }
};

/**
 * Query: /api/availability/slots/check?counselorId=...&date=2025-11-25
 * returns free slots (slots defined in availability minus bookings for that date)
 */
export const getFreeSlots = async (req, res) => {
  try {
    const { counselorId, date } = req.query; // date YYYY-MM-DD
    if (!counselorId || !date) return res.status(400).json({ success:false, message: "counselorId and date required" });

    const availability = await Availability.findOne({ counselor: counselorId });
    if (!availability) return res.json({ success:true, slots: [] });

    const dayName = new Date(date).toLocaleDateString("en-US", { weekday: "long" });
    const dayAvailability = availability.days.find(d => d.day === dayName);
    if (!dayAvailability) return res.json({ success:true, slots: [] });

    // Fetch bookings for that counselor on that date
    const from = new Date(`${date}T00:00:00`);
    const to = new Date(`${date}T23:59:59`);
    const booked = await Booking.find({ counselor: counselorId, dateTime: { $gte: from, $lte: to } });

    const bookedTimes = booked.map(b => {
      const iso = b.dateTime.toISOString();
      return iso.substring(11, 16); // "HH:MM"
    });

    // Filter out slots whose start time exists in bookedTimes
    const freeSlots = dayAvailability.slots.filter(s => !bookedTimes.includes(s.start));
    res.json({ success:true, slots: freeSlots });
  } catch (err) {
    res.status(500).json({ success:false, message: err.message });
  }
};
