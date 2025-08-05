import { WebSocket } from "ws";
import dotenv from "dotenv";
import Fastify from "fastify";
import fastifyFormBody from "@fastify/formbody";
import fastifyWs from "@fastify/websocket";

// Load environment variables
dotenv.config();

const SYSTEM_MESSAGE_CONTENT = "You are an AI assistant whose primary role is to make phone calls and handle queries on behalf of the person you are assisting. Listen carefully to their requests, communicate clearly and politely during calls, and always act in their best interest. Confirm details, ask clarifying questions if needed, and provide accurate information in a natural, human-like manner.";
const VOICE = "alloy";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PORT = 5050;

async function main() {
  // Create Fastify instance
  const fastify = Fastify({
    logger: true
  });

  // Register plugins
  await fastify.register(fastifyFormBody);
  await fastify.register(fastifyWs);

  // Route for handling incoming calls
  fastify.all('/incoming-call', async (request, reply) => {
    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
              <Response>
                  <Connect>
                  <Stream url="wss://${request.headers.host}/media-stream" />
                  </Connect>
              </Response>`;
    reply.type('text/xml').send(twimlResponse);
  });

  fastify.register(async (fastify) => {
    fastify.get("/session", { websocket: true }, async (connection, req) => {
      // Create OpenAI session
      const sessionResponse = await fetch("https://api.openai.com/v1/realtime/sessions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-realtime-preview-2025-06-03",
          voice: VOICE,
        }),
      });
      
      if (!sessionResponse.ok) {
        console.error("Failed to create OpenAI session:", await sessionResponse.text());
        connection.socket.close();
        return;
      }

      const sessionData = await sessionResponse.json() as { id: string };
      const sessionId = sessionData.id;
      
      // Create WebSocket connection to OpenAI
      const ws = new WebSocket(`wss://api.openai.com/v1/realtime/sessions/${sessionId}/stream`);
      
      let streamSid: string | null = null;

      const sendSessionUpdate = () => {
        const sessionUpdate = {
          type: "session.update",
          session: {
            turn_detection: { type: "server_vad" },
            input_audio_format: "g711_ulaw",
            output_audio_format: "g711_ulaw",
            voice: VOICE,
            instructions: SYSTEM_MESSAGE_CONTENT,
            modalities: ["text", "audio"],
            temperature: 0.7,
          },
        };

        console.log("Sending session update", JSON.stringify(sessionUpdate));
        ws.send(JSON.stringify(sessionUpdate));
      };

      ws.on("open", () => {
        console.log("Connected to OpenAI WebSocket");
        setTimeout(sendSessionUpdate, 1000);
      });

      ws.on("message", (data) => {
        try {
          const response = JSON.parse(typeof data === "string" ? data : data.toString());

          if (response.type === "session.updated") {
            console.log("Session updated", response.session);
          }

          if (response.type === "response.audio_delta" && response.delta) {
            const audioDelta = {
              event: "media",
              streamSid: streamSid,
              media: {
                payload: Buffer.from(response.delta, "base64").toString("base64")
              }
            };
            connection.socket.send(JSON.stringify(audioDelta));
          }
        } catch (error) {
          console.error("Error parsing message:", error, "Raw data:", data);
        }
      });

      connection.socket.on("message", (message: Buffer) => {
        try {
          const data = JSON.parse(message.toString());

          switch(data.event) {
            case "start":
              streamSid = data.start.streamSid;
              console.log("Incoming stream has started", streamSid);
              break;
            case "media":
              if (ws.readyState === WebSocket.OPEN) {
                const audioAppend = {
                  type: "input_audio_buffer.append",
                  audio: data.media.payload,
                };

                ws.send(JSON.stringify(audioAppend));
              }
              break;
            default:
              console.log("Unknown event:", data.event);
          }
        } catch (error) {
          console.error("Error parsing message:", error, "Raw data:", message);
        }
      });

      connection.socket.on("close", () => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
        console.log("Client disconnected");
      });

      ws.on("close", () => {
        console.log("OpenAI WebSocket closed");
      });

      ws.on("error", (error) => {
        console.error("OpenAI WebSocket error:", error);
      });
    });
  });

  fastify.listen({ port: Number(PORT), host: "0.0.0.0" }, (err, address) => {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
    fastify.log.info(`Server is running on ${address}`);
  });
}

// Call the main function
main().catch((error) => {
  console.error("Error starting server:", error);
  process.exit(1);
});






