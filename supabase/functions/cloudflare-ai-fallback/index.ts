import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const cors = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
const ACCOUNT_ID = "600932bafc27f05a65a99d32b65e4e35";
const MODEL = "@cf/meta/llama-3.2-1b-instruct";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return new Response(JSON.stringify({error:"POST required"}), {status:405,headers:{...cors,"Content-Type":"application/json"}});
  try {
    const token = Deno.env.get("CLOUDFLARE_AI_TOKEN");
    if (!token) throw new Error("CLOUDFLARE_AI_TOKEN is not configured");
    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [{role:"user",content:String(body?.message ?? "")}];
    const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/${encodeURIComponent(MODEL)}`, {method:"POST",headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},body:JSON.stringify({messages,max_tokens:512,temperature:0.7})});
    const data = await r.json();
    if (!r.ok || data?.success === false) return new Response(JSON.stringify({ok:false,error:"Cloudflare AI request failed",details:data?.errors ?? []}),{status:502,headers:{...cors,"Content-Type":"application/json"}});
    const reply = data?.result?.response ?? data?.result?.text ?? data?.result?.output_text ?? "";
    return new Response(JSON.stringify({ok:true,provider:"cloudflare",model:MODEL,reply}),{headers:{...cors,"Content-Type":"application/json"}});
  } catch (e) {
    return new Response(JSON.stringify({ok:false,error:String(e?.message ?? e)}),{status:500,headers:{...cors,"Content-Type":"application/json"}});
  }
});