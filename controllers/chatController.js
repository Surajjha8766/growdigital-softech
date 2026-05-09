const axios = require("axios");

const chatWithAI = async (req, res) => {
  try {
    // Get user message
    const { message } = req.body;

    // Validation
    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // AI Prompt
    const prompt = `
You are Grow Digital Softech AI Assistant.

About Company:
- We build professional websites
- We provide SEO services
- We create ecommerce websites
- We do digital marketing
- We provide UI/UX design

Pricing:
- Basic Website: ₹8999
- Business Website: ₹15000

Rules:
- Reply in Hindi + English
- Keep replies short
- Talk professionally
- Try to convert visitors into customers
- Ask questions to understand customer needs

User Message:
${message}
`;

    // Gemini API Call
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Extract AI reply
    const reply =
      response?.data?.candidates?.[0]?.content?.parts?.[0]
        ?.text || "No response from AI";

    // Send response
    return res.status(200).json({
      success: true,
      reply,
    });
  } catch (error) {
    console.log(
      "AI ERROR:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.response?.data || error.message,
    });
  }
};

module.exports = {
  chatWithAI,
};
