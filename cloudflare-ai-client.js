// KDS-AI Cloudflare Workers AI client
const CLOUDFLARE_AI_ENDPOINT = "https://kds-ai-cloudflare.adam-kraus.workers.dev";

async function askCloudflareAI(message) {
  const response = await fetch(CLOUDFLARE_AI_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({ message })
  });
  const data = await response.json();
  if (!response.ok || !data?.reply) {
    throw new Error(data?.error || `Cloudflare AI error (${response.status})`);
  }
  return data.reply;
}
