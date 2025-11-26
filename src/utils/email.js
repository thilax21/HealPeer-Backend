import nodemailer from "nodemailer";

export const sendBookingEmails = async ({
  clientEmail,
  clientName,
  counselorEmail,
  counselorName,
  meetLink,
  booking,
  prePayment = false,
  chatRoom = null,
  sessionType = "video"
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

  const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  
  const sessionTypeText = sessionType === "chat" ? "Chat Session" : "Video Call Session";
  
  let clientText = prePayment
    ? `Hello ${clientName},\n\nYour ${sessionTypeText} with ${counselorName} on ${booking.date} at ${booking.time} is created.\nPayment is pending.\n\n${sessionType === "chat" ? "Chat Room" : "Meet Link"} (tentative): ${sessionType === "chat" ? `${baseUrl}/chat/${chatRoom}` : meetLink}\n\nOnce payment is completed, you'll be able to access your session.`
    : `Hello ${clientName},\n\nYour ${sessionTypeText} with ${counselorName} on ${booking.date} at ${booking.time} is confirmed.\nPayment received successfully!\n\n${sessionType === "chat" ? "💬 Chat Room" : "📹 Video Call"}: ${sessionType === "chat" ? `${baseUrl}/chat/${chatRoom}` : meetLink}\n\nYou can now start your ${sessionType === "chat" ? "chat session" : "video call"} with your counselor.`;

  let counselorText = prePayment
    ? `Hello ${counselorName},\n\nYou have a new ${sessionTypeText} with ${clientName} on ${booking.date} at ${booking.time}.\nPayment is pending.\n\n${sessionType === "chat" ? "Chat Room" : "Meet Link"} (tentative): ${sessionType === "chat" ? `${baseUrl}/chat/${chatRoom}` : meetLink}\n\nYou'll be notified once payment is completed.`
    : `Hello ${counselorName},\n\nYour ${sessionTypeText} with ${clientName} on ${booking.date} at ${booking.time} is confirmed.\nPayment received successfully!\n\n${sessionType === "chat" ? "💬 Chat Room" : "📹 Video Call"}: ${sessionType === "chat" ? `${baseUrl}/chat/${chatRoom}` : meetLink}\n\nYou can now start your ${sessionType === "chat" ? "chat session" : "video call"} with your client.`;

  // Send separate emails for client and counselor with personalized content
  const clientEmailContent = {
    from: `"HealPeer" <${process.env.EMAIL_USER}>`,
    to: clientEmail,
    subject,
    text: clientText
  };

  const counselorEmailContent = {
    from: `"HealPeer" <${process.env.EMAIL_USER}>`,
    to: counselorEmail,
    subject,
    text: counselorText
  };

  await transporter.sendMail(clientEmailContent);
  await transporter.sendMail(counselorEmailContent);

  console.log("Booking emails sent to client & counselor");
};
