// import { StreamChat } from "stream-chat";
// import Stream from "@stream-io/video-react-sdk";
// import dotenv from "dotenv";
// dotenv.config();

// const apiKey = process.env.STREAM_API_KEY;
// const apiSecret = process.env.STREAM_API_SECRET;

// if (!apiKey || !apiSecret) {
//   console.error("Stream API Key or Secret missing!");
// }

// export const chatClient = StreamChat.getInstance(apiKey);
// export const videoServer = new Stream.StreamServerClient(apiKey, apiSecret);

// export const generateChatToken = (userId) => {
//   return chatClient.createToken(userId.toString());
// };

// export const generateVideoToken = (userId) => {
//   return videoServer.createToken(userId.toString());
// };

// export const upsertStreamUser = async (user) => {
//   try {
//     await chatClient.upsertUser(user);
//     await videoServer.users.createOrUpdate(user);
//   } catch (err) {
//     console.error("Error upserting Stream user:", err.message);
//   }
// };


import { StreamChat } from "stream-chat";

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey) throw new Error("STREAM_API_KEY is missing");
if (!apiSecret) throw new Error("STREAM_API_SECRET is missing");

export const chatClient = StreamChat.getInstance(apiKey, apiSecret);

export const generateStreamToken = (userId) => {
  return chatClient.createToken(userId.toString());
};
