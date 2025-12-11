import { StreamClient } from "@stream-io/node-sdk";

const client = new StreamClient(
  process.env.STREAM_API_KEY,
  process.env.STREAM_API_SECRET
);

export const createVideoRoom = async () => {
  const callId = `healpeer_${Date.now()}`;

  const call = client.video.call("default", callId);

  await call.getOrCreate({
    data: {
      starts_at: new Date().toISOString(),
    },
  });

  return {
    callId,
    meetLink: `https://meet.stream-io-video.com/call/default/${callId}`,
  };
};
