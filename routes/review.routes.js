const express = require("express");
const router = express.Router();
const reviewCtrl = require("../controllers/review.controller");

router.get("/google/reviews", reviewCtrl.getReviews);

module.exports = router;