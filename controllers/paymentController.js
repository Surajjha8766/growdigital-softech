const { Cashfree, CFEnvironment } = require("cashfree-pg");

Cashfree.XClientId = process.env.CASHFREE_APP_ID;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;

Cashfree.XEnvironment = CFEnvironment.SANDBOX;

// Production:
// Cashfree.XEnvironment = CFEnvironment.PRODUCTION;

exports.createOrder = async (req, res) => {
  try {
    const { price } = req.body;

    const amount = Number(price.replace(/[₹,]/g, ""));

    const request = {
      order_amount: amount,
      order_currency: "INR",
      order_id: `ORDER_${Date.now()}`,

      customer_details: {
        customer_id: `CUS_${Date.now()}`,
        customer_name: "Suraj",
        customer_email: "test@gmail.com",
        customer_phone: "8766297212",
      },

      order_meta: {
        return_url:
          "http://localhost:5173/payment-success?order_id={order_id}",
      },
    };

    const response = await Cashfree.PGCreateOrder(
      "2023-08-01",
      request
    );

    res.status(200).json({
      success: true,
      payment_session_id: response.data.payment_session_id,
    });
  } catch (error) {
    console.log(
      "CASHFREE ERROR:",
      error.response?.data || error.message
    );

    res.status(500).json({
      success: false,
      error: error.response?.data || error.message,
    });
  }
};