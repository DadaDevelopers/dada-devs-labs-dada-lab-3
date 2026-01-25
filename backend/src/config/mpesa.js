// backend/src/services/mpesa.js
import axios from "axios";
import config from "../config/config.js";

const mpesaService = {
  stkPush: async ({ phone, amount }) => {
    // generate access token first
    const tokenResponse = await axios.get("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
      auth: {
        username: config.MPESA_CONSUMER_KEY,
        password: config.MPESA_CONSUMER_SECRET
      }
    });

    const accessToken = tokenResponse.data.access_token;

    const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
    const password = Buffer.from(`${config.MPESA_SHORTCODE}${config.MPESA_PASSKEY}${timestamp}`).toString("base64");

    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: config.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phone,
        PartyB: config.MPESA_SHORTCODE,
        PhoneNumber: phone,
        CallBackURL: "https://your-callback-url.com/mpesa",
        AccountReference: "DirectAidDonation",
        TransactionDesc: "Donation"
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    return response.data;
  }
};

export default mpesaService;
