// Download the helper library from https://www.twilio.com/docs/node/install
import twilio from "twilio";
import { WebSocket, WebSocketServer } from "ws";
import { createServer, Server } from "http";
import { IncomingMessage } from "http";
import dotenv from "dotenv";

dotenv.config();


const ENDPOINTING_DELAY = 4000
const SYSTEM_MESSAGE_CONTENT = "SYSTEM_MESSAGE_CONTENT"
const conversation = [{'role':'system', 'content': SYSTEM_MESSAGE_CONTENT}]

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
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;
    const toNumber = process.env.TO_PHONE_NUMBER;
    
    if (!fromNumber || !toNumber) {
      console.error("❌ Error: Phone numbers not configured!");
      return;
    }
    
    const call = await client.calls.create({
      from: fromNumber,
      to: toNumber,
      url: "http://demo.twilio.com/docs/voice.xml",
    });

  } catch (error) {
    console.error("❌ Error creating call:", error);
  }
}


const openDeepGramWS = (request: any) => {
  const key = process.env.CONSOLE_API_KEY;
  
  if (!key) {
    console.error("❌ Error: Deepgram API key not found!");
    return null;
  }

  const headers = {
    'Authorization': `Token ${key}`,
  };

  const params = {
    "endpointing": ENDPOINTING_DELAY,
  };

  // Create WebSocket connection to Deepgram
  const ws = new WebSocket('wss://api.deepgram.com/v1/listen?encoding=mulaw&sample_rate=8000', {
    headers: headers
  });

  // Set up WebSocket event handlers
  ws.on('open', () => {
    console.log('Connected to Deepgram WebSocket');
  });

  ws.on('message', (data) => {
    console.log('Received from Deepgram:', data.toString());
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });

  return ws;
};

const callChatGPT = async (message: string, content: any) => {
  // Implementation for ChatGPT API call
  console.log('Calling ChatGPT with:', message);
  // Add your ChatGPT API implementation here
};

// WebSocket server setup (if you need to handle incoming connections)
const setupWebSocketServer = (server: Server) => {
  const wss = new WebSocketServer({ server });
  
  wss.on('connection', (ws: WebSocket, request: IncomingMessage) => {
    console.log('New WebSocket connection established');
    
    ws.on('message', (data) => {
      console.log('Received message:', data.toString());
      // Handle incoming messages here
    });
    
    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });
  
  return wss;
};

createCall();