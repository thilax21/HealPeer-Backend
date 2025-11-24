import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, text, attachmentPath= null) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"HealPeer" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  };
  
  if (attachmentPath) {
    options.attachments = [
      {
        filename: "invoice.pdf",
        path: attachmentPath,
      },
    ];
  }

  await transporter.sendMail(mailOptions);
};
