


// import { StreamChat } from "stream-chat";

// const apiKey = process.env.STREAM_API_KEY;
// const apiSecret = process.env.STREAM_API_SECRET;

// if (!apiKey) throw new Error("STREAM_API_KEY is missing");
// if (!apiSecret) throw new Error("STREAM_API_SECRET is missing");

// export const chatClient = StreamChat.getInstance(apiKey, apiSecret);

// export const generateStreamToken = (userId) => {
//   return chatClient.createToken(userId.toString());
// };

// src/lib/stream.js

// src/lib/stream.js
import { StreamClient } from "@stream-io/node-sdk";
import dotenv from "dotenv";

dotenv.config();

// Load Stream keys from environment
const { STREAM_API_KEY, STREAM_API_SECRET } = process.env;

if (!STREAM_API_KEY || !STREAM_API_SECRET) {
  throw new Error(
    "Stream.io keys are missing! Please set STREAM_API_KEY and STREAM_API_SECRET in your .env file."
  );
}

// Initialize Stream client
const client = new StreamClient(STREAM_API_KEY, STREAM_API_SECRET);

// Generate a Stream JWT token for a given user
export const generateStreamToken = (userId) => {
  if (!userId) throw new Error("User ID is required to generate Stream token");
  return client.createToken(userId);
};

// Create a video call room
export const createVideoRoom = async () => {
  const callId = `healpeer_${Date.now()}`;

  const call = client.video.call("default", callId);
  await call.getOrCreate({
    data: { starts_at: new Date().toISOString() },
  });

  return {
    callId,
    meetLink: `https://meet.stream-io-video.com/call/default/${callId}`,
  };
};

export default client;

