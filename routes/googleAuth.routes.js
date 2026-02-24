const express = require("express");
const router = express.Router();
const googleCtrl = require("../controllers/google.controller");
const reviewCtrl = require("../controllers/review.controller");

router.get("/auth/google/callback", googleCtrl.googleCallback);
router.get("/google/reviews", reviewCtrl.getReviews);

module.exports = router;