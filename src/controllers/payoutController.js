import User from "../models/User.js";
import Booking from "../models/Booking.js";
import PaymentHistory from "../models/PaymentHistory.js";
import { sendPayoutEmail } from "../utils/email.js";


// GET COUNSELOR EARNINGS
export const getCounselorEarnings = async (req, res) => {
  try {
    const { month } = req.query; // Optional: "November 2025"
    
    const counselors = await User.find({ role: "counselor" }).select("_id name email");

    const counselorsWithEarnings = await Promise.all(
      counselors.map(async (counselor) => {
        // Filter by month if provided
        const bookingFilter = {
          counselorId: counselor._id,
          status: "paid",
          paymentStatus: "completed",
        };

        if (month) {
          const start = new Date(`${month} 1`);
          const end = new Date(start);
          end.setMonth(end.getMonth() + 1);
          bookingFilter.paidAt = { $gte: start, $lt: end };
        }

        const paidBookings = await Booking.find(bookingFilter);

        const totalEarnings = paidBookings.reduce(
          (sum, booking) => sum + (booking.paidAmount || booking.amount || 0),
          0
        );

        const completedSessions = paidBookings.length;

        return {
          _id: counselor._id,
          name: counselor.name,
          email: counselor.email,
          totalEarnings,
          completedSessions,
          currency: "LKR",
        };
      })
    );

    res.json({ success: true, counselors: counselorsWithEarnings });
  } catch (err) {
    console.error("Error fetching counselor earnings:", err);
    res.status(500).json({ success: false, message: "Failed to fetch earnings" });
  }
};




// PROCESS PAYOUT TO COUNSELOR
export const processPayout = async (req, res) => {
  try {
    const { counselorId } = req.params;
    const { amount, month } = req.body;
    const adminId = req.user.id;

    if (!amount || !month) {
      return res.status(400).json({ success: false, message: "Amount and month are required" });
    }
    if (amount <= 0) {
      return res.status(400).json({ success: false, message: "Amount must be greater than 0" });
    }

    // Check counselor exists
    const counselor = await User.findById(counselorId);
    if (!counselor) return res.status(404).json({ success: false, message: "Counselor not found" });

    // Check admin exists
    const admin = await User.findById(adminId);
    if (!admin) return res.status(404).json({ success: false, message: "Admin not found" });

    // Prevent duplicate payout for same month
    const existingPayout = await PaymentHistory.findOne({ counselor: counselorId, month });
    if (existingPayout) {
      return res.status(400).json({ success: false, message: `Payout for ${month} already processed` });
    }

    // Create payout
    const paymentHistory = new PaymentHistory({
      counselor: counselorId,
      amount: parseFloat(amount),
      month,
      paidBy: adminId,
      status: "Paid",
      currency: "LKR",
    });

    await paymentHistory.save();

    // Send email (optional)
    try {
      await sendPayoutEmail({
        counselorEmail: counselor.email,
        counselorName: counselor.name,
        amount: parseFloat(amount),
        month,
        paidBy: admin.name,
      });
    } catch (emailErr) {
      console.error("Email error:", emailErr);
    }

    res.json({
      success: true,
      message: "Payout processed successfully",
      payout: {
        counselorId,
        amount: parseFloat(amount),
        month,
        paidBy: admin.name,
        currency: "LKR",
        processedAt: new Date(),
      },
    });
  } catch (err) {
    console.error("Error processing payout:", err);
    res.status(500).json({ success: false, message: "Failed to process payout" });
  }
};


// GET PAYOUT HISTORY
export const getPayoutHistory = async (req, res) => {
  try {
    const payments = await PaymentHistory.find()
      .populate("counselor", "name email")
      .populate("paidBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      payments: payments.map(payment => ({
        ...payment.toObject(),
        currency: payment.currency || "LKR"
      }))
    });
  } catch (err) {
    console.error("Error fetching payout history:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payout history"
    });
  }
};




// GET COUNSELOR PAYOUT SUMMARY
export const getCounselorPayoutSummary = async (req, res) => {
  try {
    const { counselorId } = req.params;

    // Fetch all completed paid bookings for the counselor
    const paidBookings = await Booking.find({
      counselorId,
      status: "paid",
      paymentStatus: "completed",
    }).sort({ paidAt: -1 });

    // Total earnings
    const totalEarnings = paidBookings.reduce(
      (sum, booking) => sum + (booking.paidAmount || booking.amount || 0),
      0
    );

    // Fetch payout history
    const payoutHistory = await PaymentHistory.find({
      counselor: counselorId,
    }).populate("paidBy", "name").sort({ createdAt: -1 });

    // Total amount already paid
    const totalPaidOut = payoutHistory.reduce((sum, payment) => sum + (payment.amount || 0), 0);

    // Pending balance
    const pendingBalance = totalEarnings - totalPaidOut;

    // Monthly breakdown (earnings and payouts)
    const monthlySummary = {}; // { "November 2025": { earnings: 5000, paid: 2000, pending: 3000 } }

    paidBookings.forEach((booking) => {
      if (!booking.paidAt) return;
      const monthKey = new Date(booking.paidAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      });

      if (!monthlySummary[monthKey]) {
        monthlySummary[monthKey] = { earnings: 0, paid: 0, pending: 0 };
      }
      monthlySummary[monthKey].earnings += (booking.paidAmount || booking.amount || 0);
    });

    payoutHistory.forEach((payment) => {
      const monthKey = payment.month;
      if (!monthlySummary[monthKey]) {
        monthlySummary[monthKey] = { earnings: 0, paid: 0, pending: 0 };
      }
      monthlySummary[monthKey].paid += payment.amount;
      monthlySummary[monthKey].pending = monthlySummary[monthKey].earnings - monthlySummary[monthKey].paid;
    });

    res.json({
      success: true,
      summary: {
        counselorId,
        totalEarnings,
        totalPaidOut,
        pendingBalance,
        completedSessions: paidBookings.length,
        currency: "LKR",
        monthlySummary,
        recentBookings: paidBookings.slice(0, 10),
        payoutHistory,
      },
    });
  } catch (err) {
    console.error("Error fetching counselor payout summary:", err);
    res.status(500).json({ success: false, message: "Failed to fetch payout summary" });
  }
};


export const getAdminDashboardStats = async (req, res) => {
  try {
    // Total bookings
    const totalBookings = await Booking.countDocuments();
    const paidBookings = await Booking.countDocuments({ status: "paid", paymentStatus: "completed" });

    // Total revenue
    const revenueResult = await Booking.aggregate([
      { $match: { status: "paid", paymentStatus: "completed" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$paidAmount" },
        },
      },
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    // Active counselors
    const activeCounselors = await User.countDocuments({ role: "counselor" });

    // Total payouts
    const totalPayoutsResult = await PaymentHistory.aggregate([
      { $match: { status: "Paid" } },
      { $group: { _id: null, totalPayouts: { $sum: "$amount" } } },
    ]);
    const totalPayouts = totalPayoutsResult[0]?.totalPayouts || 0;

    const platformRevenue = totalRevenue - totalPayouts;

    // -----------------------------
    // Monthly breakdown
    // -----------------------------
    const monthlyRevenueAgg = await Booking.aggregate([
      { $match: { status: "paid", paymentStatus: "completed" } },
      {
        $group: {
          _id: { year: { $year: "$paidAt" }, month: { $month: "$paidAt" } },
          revenue: { $sum: "$paidAmount" },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
    ]);

    const monthlyPayoutsAgg = await PaymentHistory.aggregate([
      { $match: { status: "Paid" } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          payouts: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
    ]);

    // Format monthly summary
    const monthlySummary = {};
    monthlyRevenueAgg.forEach((r) => {
      const monthName = new Date(r._id.year, r._id.month - 1).toLocaleString("en-US", { month: "long", year: "numeric" });
      monthlySummary[monthName] = { revenue: r.revenue, payouts: 0, platformRevenue: r.revenue };
    });
    monthlyPayoutsAgg.forEach((p) => {
      const monthName = new Date(p._id.year, p._id.month - 1).toLocaleString("en-US", { month: "long", year: "numeric" });
      if (!monthlySummary[monthName]) monthlySummary[monthName] = { revenue: 0, payouts: 0, platformRevenue: 0 };
      monthlySummary[monthName].payouts = p.payouts;
      monthlySummary[monthName].platformRevenue = monthlySummary[monthName].revenue - p.payouts;
    });

    res.json({
      success: true,
      stats: {
        totalBookings,
        paidBookings,
        totalRevenue,
        totalPayouts,
        platformRevenue,
        activeCounselors,
        currency: "LKR",
        monthlySummary, // New monthly breakdown
      },
    });
  } catch (err) {
    console.error("Error fetching admin dashboard stats:", err);
    res.status(500).json({ success: false, message: "Failed to fetch dashboard stats" });
  }
};
