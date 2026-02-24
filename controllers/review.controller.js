const axios = require("axios");
require("dotenv").config();

exports.getReviews = async (req, res) => {
  try {
    const { GOOGLE_API_KEY, GOOGLE_PLACE_ID } = process.env;

    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${GOOGLE_PLACE_ID}&fields=name,rating,reviews&key=${GOOGLE_API_KEY}`
    );

    if (!response.data.result) {
      return res.status(404).json({ success: false, reviews: [], message: "No reviews found" });
    }

    const reviews = (response.data.result.reviews || []).map(r => ({
      name: r.author_name,
      rating: r.rating,
      text: r.text,
      initials: r.author_name
        .split(" ")
        .map(w => w[0])
        .join("")
        .toUpperCase()
    }));

    res.json({ success: true, reviews });
  } catch (error) {
    console.error("Google Reviews fetch error:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: "Failed to fetch Google reviews" });
  }
};