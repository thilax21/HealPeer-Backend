


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

import { StreamClient } from "@stream-io/node-sdk";

const client = new StreamClient(
  process.env.STREAM_API_KEY,
  process.env.STREAM_API_SECRET
);

export const generateStreamToken = (userId) => {
  if (!userId) throw new Error("User ID required");

  // Generate token for chat/video
  const token = client.createToken(userId);
  return token;
};
