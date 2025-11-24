import nodemailer from "nodemailer";

export const sendBookingEmails = async ({
  clientEmail,
  clientName,
  counselorEmail,
  counselorName,
  meetLink,
  booking,
  prePayment = false
}) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const subject = prePayment
    ? `Booking Created - Payment Pending`
    : `Booking Confirmed - Payment Received`;

  const text = prePayment
    ? `Hello ${clientName},\n\nYour booking with ${counselorName} on ${booking.date} at ${booking.time} is created.\nPayment is pending.\nMeet link (tentative): ${meetLink}`
    : `Hello ${clientName},\n\nYour booking with ${counselorName} on ${booking.date} at ${booking.time} is confirmed.\nPayment received successfully!\nJoin via: ${meetLink}`;

  await transporter.sendMail({
    from: `"HealPeer" <${process.env.EMAIL_USER}>`,
    to: `${clientEmail}, ${counselorEmail}`,
    subject,
    text,
  });

  console.log("Booking emails sent to client & counselor");
};
