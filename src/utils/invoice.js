import PDFDocument from "pdfkit";
import fs from "fs";

export const generateInvoicePDF = async ({ user, amount, booking }) => {
  const filePath = `./invoices/invoice-${booking._id}.pdf`;
  const doc = new PDFDocument();

  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(20).text("HealPeer Payment Invoice");
  doc.fontSize(12).text(`User: ${user.name}`);
  doc.text(`Email: ${user.email}`);
  doc.text(`Amount Paid: $${amount}`);
  doc.text(`Session Type: ${booking.sessionType}`);
  doc.text(`Date: ${booking.date}`);
  doc.text(`Time: ${booking.time}`);

  doc.end();

  return filePath;
};
