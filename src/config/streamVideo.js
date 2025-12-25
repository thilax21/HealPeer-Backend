

// src/config/streamVideo.js
import { StreamClient } from "@stream-io/node-sdk";

 const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

console.log("[Stream] STREAM_API_KEY:", apiKey);
console.log("[Stream] STREAM_API_SECRET present:", !!apiSecret);

if (!apiKey || !apiSecret) {
  console.warn(
    "⚠️ STREAM_API_KEY or STREAM_API_SECRET not set. Stream video features are disabled."
  );
}

let client = null;

try {
  if (apiKey && apiSecret) {
    // 👇 IMPORTANT: use positional arguments
    client = new StreamClient(apiKey, apiSecret);
    console.log("[Stream] StreamClient created successfully");
  } else {
    console.log("[Stream] StreamClient not created (missing key/secret)");
  }
} catch (err) {
  console.error("[Stream] Error creating StreamClient:", err);
  client = null;
}

// This is what other modules import
export const streamClient = client;