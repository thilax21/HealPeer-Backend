// // src/routes/streamRoutes.js
// import express from "express";
// import { protect } from "../middlewares/authMiddleware.js";
// import { getStreamToken } from "../controllers/streamController.js";

// const router = express.Router();

// router.get("/token", protect, getStreamToken);

// export default router;

import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { getStreamTokenForBooking } from "../controllers/streamController.js";

const router = express.Router();

router.get("/token/:bookingId", protect, getStreamTokenForBooking);

export default router;