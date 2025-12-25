import cron from "node-cron";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";

export const startReminderCron = () => {
  console.log("⏰ Reminder CRON started");

  // Every 1 minute check upcoming sessions
  cron.schedule("* * * * *", async () => {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    const bookings = await Booking.find({
      paymentStatus: "paid",
      reminderSent: false,
      slot: { $lte: oneHourLater, $gte: now }
    });

    for (const booking of bookings) {
      const client = await User.findById(booking.client);
      const counselor = await User.findById(booking.counselor);

      await sendEmail(
        client.email,
        "Reminder: Your Session Starts in 1 Hour",
        `
          Hi ${client.name},<br/>
          Your HealPeer session starts in 1 hour.<br/>
          <b>Join Link:</b> <a href="${booking.meetingLink}">${booking.meetingLink}</a>
        `
      );

      await sendEmail(
        counselor.email,
        "You Have a Session in 1 Hour",
        `
          Hi ${counselor.name},<br/>
          Your counseling session begins in 1 hour.<br/>
          <b>Start Link:</b> <a href="${booking.meetingLink}">${booking.meetingLink}</a>
        `
      );

      booking.reminderSent = true;
      await booking.save();
    }
  });
};
