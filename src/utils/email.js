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
  sessionType = "video",
  currency = "LKR",
  paidAmount = null
}) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const subject = prePayment
    ? `🔄 Booking Created - Payment Pending - HealPeer`
    : `✅ Booking Confirmed - Payment Received - HealPeer`;

  const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  
  const sessionTypeText = sessionType === "chat" ? "Chat Session" : "Video Call Session";
  const amount = paidAmount || booking.amount;
  
  let clientText = prePayment
    ? `🙏 Hello ${clientName},

Thank you for choosing HealPeer!

Your ${sessionTypeText} with ${counselorName} has been scheduled:

📅 Date: ${booking.date}
⏰ Time: ${booking.time}
⏱️ Duration: ${booking.durationMin} minutes
💰 Amount: ${amount} ${currency}

📍 Status: Payment Pending

${sessionType === "chat" ? `💬 Chat Room: ${baseUrl}/chat/${chatRoom}` : `📹 Meet Link: ${meetLink}`}

Once your payment is completed, you'll receive a confirmation email with full access to your session.

🙏 Thank you for trusting HealPeer with your mental wellness journey.

Best regards,
The HealPeer Team`

    : `🎉 Hello ${clientName},

Great news! Your payment has been successfully processed and your booking is now CONFIRMED.

✅ SESSION DETAILS:
📅 Date: ${booking.date}
⏰ Time: ${booking.time}
⏱️ Duration: ${booking.durationMin} minutes
👨‍⚕️ Counselor: ${counselorName}
💰 Amount Paid: ${amount} ${currency}
💳 Payment Status: Completed

🔗 SESSION ACCESS:
${sessionType === "chat" ? `💬 Join Chat: ${baseUrl}/chat/${chatRoom}` : `📹 Join Video Call: ${meetLink}`}

📝 Notes: ${booking.notes || 'No additional notes'}

Your counselor has been notified and will be ready for your session. Please join 5 minutes before your scheduled time.

🙏 Thank you for choosing HealPeer for your mental wellness journey.

Best regards,
The HealPeer Team`;

  let counselorText = prePayment
    ? `📋 Hello ${counselorName},

You have a new booking request from ${clientName}:

📅 Date: ${booking.date}
⏰ Time: ${booking.time}
⏱️ Duration: ${booking.durationMin} minutes
💰 Amount: ${amount} ${currency}

📍 Status: Awaiting Payment

${sessionType === "chat" ? `💬 Chat Room: ${baseUrl}/chat/${chatRoom}` : `📹 Meet Link: ${meetLink}`}

Please note: This session will be confirmed once client completes payment. You'll receive a notification when payment is processed.

Best regards,
The HealPeer Team`

    : `✅ Hello ${counselorName},

Great news! A booking with ${clientName} has been confirmed and paid for.

✅ SESSION DETAILS:
📅 Date: ${booking.date}
⏰ Time: ${booking.time}
⏱️ Duration: ${booking.durationMin} minutes
👤 Client: ${clientName}
💰 Amount Received: ${amount} ${currency}
💳 Payment Status: Completed

🔗 SESSION ACCESS:
${sessionType === "chat" ? `💬 Chat Room: ${baseUrl}/chat/${chatRoom}` : `📹 Meet Link: ${meetLink}`}

📝 Notes: ${booking.notes || 'No additional notes'}

Please be available 5 minutes before session time. The client has been notified and will join at the scheduled time.

💰 This amount will be reflected in your monthly payout.

Best regards,
The HealPeer Team`;

  // Send separate emails for client and counselor with personalized content
  const clientEmailContent = {
    from: `"HealPeer" <${process.env.EMAIL_USER}>`,
    to: clientEmail,
    subject,
    html: clientText.replace(/\n/g, '<br>')
  };

  const counselorEmailContent = {
    from: `"HealPeer" <${process.env.EMAIL_USER}>`,
    to: counselorEmail,
    subject,
    html: counselorText.replace(/\n/g, '<br>')
  };

  await transporter.sendMail(clientEmailContent);
  await transporter.sendMail(counselorEmailContent);

  console.log(`✅ Booking emails sent to client & counselor for booking: ${booking._id}`);
};

// Send payout confirmation email to counselor
export const sendPayoutEmail = async ({
  counselorEmail,
  counselorName,
  amount,
  month,
  paidBy
}) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const subject = `💰 Payout Processed - HealPeer`;

  const emailText = `🎉 Hello ${counselorName},

Great news! Your payout has been processed successfully.

💰 PAYOUT DETAILS:
💵 Amount: ${amount} LKR
📅 Period: ${month}
👤 Processed by: ${paidBy}
💳 Status: Paid

The amount has been transferred to your registered account. Please allow 2-3 business days for the funds to reflect in your bank account.

📊 You can view your complete earnings history in your counselor dashboard.

🙏 Thank you for your dedication to helping others through HealPeer.

Best regards,
The HealPeer Team`;

  const emailContent = {
    from: `"HealPeer" <${process.env.EMAIL_USER}>`,
    to: counselorEmail,
    subject,
    html: emailText.replace(/\n/g, '<br>')
  };

  await transporter.sendMail(emailContent);
  console.log(`✅ Payout email sent to counselor: ${counselorName}`);
};
