const axios = require("axios");
const fs = require("fs");
require("dotenv").config();

const saveEnv = (key, value) => {
  const env = fs.readFileSync(".env", "utf8");
  if (env.includes(key)) return;
  fs.appendFileSync(".env", `\n${key}=${value}`);
};

// STEP 1: GOOGLE CALLBACK
exports.googleCallback = async (req, res) => {
  try {
    const code = req.query.code;
    if (!code) return res.send("No code received");

    // Exchange code → token
    const tokenRes = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
        code,
      }
    );

    const { access_token, refresh_token } = tokenRes.data;

    if (refresh_token) {
      saveEnv("GOOGLE_REFRESH_TOKEN", refresh_token);
    }

    // STEP 2: FETCH LOCATION ID
    const accountsRes = await axios.get(
      "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    const accountName = accountsRes.data.accounts[0].name;

    const locationsRes = await axios.get(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    const locationId = locationsRes.data.locations[0].name;
    saveEnv("GOOGLE_LOCATION_ID", locationId);

    res.send("Google connected successfully. You can close this page.");
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send("OAuth Failed");
  }
};