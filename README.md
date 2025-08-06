# AI Call System

A Node.js application that enables AI-powered phone calls using Twilio and OpenAI's Realtime API.

## Features

- 🤖 AI-powered phone calls with natural conversation
- 📞 Real-time voice interaction using OpenAI's Realtime API
- 🔄 Interruption handling for natural conversation flow
- 📊 Call status tracking and logging
- 🚀 Easy-to-use functions and CLI interface

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Create a `.env` file with your credentials:**

   ```env
   # Twilio credentials
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   TO_PHONE_NUMBER=number_to_call

   # OpenAI credentials
   OPENAI_API_KEY=your_openai_api_key

   # Server configuration (optional)
   PORT=5050
   ```

3. **Make sure your Twilio phone number is configured for voice calls and webhooks.**

## Usage

### Method 1: Using the Functions Directly

```typescript
import { makeAICall, startAIServer } from "./src/make_call";

// Start the server
await startAIServer();

// Make an AI call
const callResult = await makeAICall();
console.log("Call SID:", callResult.sid);
```

### Method 2: Using the CLI

**Start the server:**

```bash
npx tsx src/cli.ts server
```

**Make a call:**

```bash
npx tsx src/cli.ts call
```

**Make a call to a specific number:**

```bash
npx tsx src/cli.ts call +1234567890
```

### Method 3: Using the Example

```bash
npx tsx src/example.ts
```

## API Functions

### `makeAICall(toNumber?, fromNumber?, serverUrl?)`

Initiates an AI call using Twilio.

**Parameters:**

- `toNumber` (optional): Phone number to call (defaults to `TO_PHONE_NUMBER` from env)
- `fromNumber` (optional): Twilio phone number to call from (defaults to `TWILIO_PHONE_NUMBER` from env)
- `serverUrl` (optional): URL of your server (defaults to `http://localhost:5050`)

**Returns:** Promise with call details including SID, status, etc.

### `startAIServer(port?)`

Starts the server that handles AI calls and webhooks.

**Parameters:**

- `port` (optional): Port to run the server on (defaults to 5050)

## How It Works

1. **Call Initiation:** The `makeAICall` function creates a Twilio call to the specified number
2. **Webhook Handling:** When the call connects, Twilio sends a webhook to `/incoming-call`
3. **Media Stream:** The call connects to a WebSocket stream for real-time audio
4. **AI Processing:** Audio is sent to OpenAI's Realtime API for processing
5. **Response:** AI responses are converted to speech and sent back through the call

## Environment Variables

| Variable              | Description                 | Required |
| --------------------- | --------------------------- | -------- |
| `TWILIO_ACCOUNT_SID`  | Your Twilio Account SID     | Yes      |
| `TWILIO_AUTH_TOKEN`   | Your Twilio Auth Token      | Yes      |
| `TWILIO_PHONE_NUMBER` | Your Twilio phone number    | Yes      |
| `TO_PHONE_NUMBER`     | Default number to call      | Yes      |
| `OPENAI_API_KEY`      | Your OpenAI API key         | Yes      |
| `PORT`                | Server port (default: 5050) | No       |

## Development

**Type checking:**

```bash
npm run type-check
```

**Formatting:**

```bash
npm run format
```

**Linting:**

```bash
npm run lint:fix
```

## Troubleshooting

1. **"Missing Twilio credentials"**: Make sure all required environment variables are set in your `.env` file
2. **"Call failed"**: Check that your Twilio phone number is configured for voice calls
3. **"Server not accessible"**: Ensure your server is publicly accessible for Twilio webhooks (use ngrok for local development)

## Local Development with ngrok

For local development, you'll need to expose your local server to the internet:

```bash
# Install ngrok
npm install -g ngrok

# Start your server
npx ts-node src/cli.ts server

# In another terminal, expose your server
ngrok http 5050

# Use the ngrok URL in your .env file or when calling makeAICall
```
