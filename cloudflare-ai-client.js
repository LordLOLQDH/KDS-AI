// KDS-AI Cloudflare Workers AI client
const CLOUDFLARE_AI_ENDPOINT = "https://eopvkwhcgznvubesaszv.supabase.co/functions/v1/cloudflare-ai-fallback";

async function askCloudflareAI(message, model = "cloudflare") {
  const response = await fetch(CLOUDFLARE_AI_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, model })
  });
  const data = await response.json();
  if (!response.ok || !data?.reply) throw new Error(data?.error || `Cloudflare AI error (${response.status})`);
  return data.reply;
}
