// Download the helper library from https://www.twilio.com/docs/node/install
const twilio = require("twilio"); // Or, for ESM: import twilio from "twilio";
require('dotenv').config();

// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

// Check if credentials are available
if (!accountSid || !authToken) {
  console.error("❌ Error: Twilio credentials not found!");
  process.exit(1);
}

const client = twilio(accountSid, authToken);

async function createCall() {
  try {
    const fromNumber = process.env.TWILIO_PHONE_NUMBER
    const toNumber = process.env.TO_PHONE_NUMBER 
    
    const call = await client.calls.create({
      from: fromNumber,
      to: toNumber,
      url: "http://demo.twilio.com/docs/voice.xml",
    });

  } catch (error) {
    console.error("❌ Error creating call:", error);
  }
}

createCall();