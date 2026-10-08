import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const ALLOWED_ORIGIN="https://lordlolqdh.github.io";
const TARGET="adam_kraus@icloud.com";
const SENDER="kraus-digital@proton.me";
const recent=new Map<string,number>();

const clean=(v:unknown,max=12000)=>typeof v==="string"?v.replace(/[\u0000-\u001F\u007F]/g," ").trim().slice(0,max):"";
const cors=()=>({"Access-Control-Allow-Origin":ALLOWED_ORIGIN,"Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS","Vary":"Origin"});
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors(),"Content-Type":"application/json"}});
const emailFrom=(v:string)=>{const m=v.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);return m?m[0].toLowerCase():""};
const looksLikeInquiry=(s:string)=>{const m=s.toLowerCase();const intent=/(möchte|moechte|will|brauche|benötige|benoetige|interessiere mich|hätte gerne|haette gerne|beauftragen|bestellen|umsetzen|erstellen lassen|machen lassen|preis|kosten|kostet)/i.test(m);const contact=/(kontakt|kontaktieren|erreichen|melde mich|meldet euch|rückruf|rueckruf|anfrage|anfragen|angebot|termin|beratung)/i.test(m);const project=/(website|webseite|homepage|shop|onlineshop|online-shop|admin.?panel|login|newsletter|design|programmier|entwickl|funktion)/i.test(m);return(contact&&(intent||project))||(project&&intent)};
const escapeHtml=(v:string)=>v.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");

Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors()});
 if(req.method!=="POST")return json({ok:false,error:"Nur POST ist erlaubt."},405);
 try{
  if(req.headers.get("origin")&&req.headers.get("origin")!==ALLOWED_ORIGIN)return json({ok:false,error:"Origin nicht erlaubt."},403);
  const body=await req.json();const message=clean(body?.message);
  if(!message)return json({ok:false,sent:false,error:"message fehlt."},400);
  const ip=req.headers.get("cf-connecting-ip")||req.headers.get("x-forwarded-for")||"unknown";const now=Date.now();
  if(now-(recent.get(ip)||0)<5000)return json({ok:false,sent:false,error:"Bitte kurz warten und erneut versuchen."},429);
  if(!looksLikeInquiry(message))return json({ok:true,sent:false,inquiry:false});recent.set(ip,now);
  const apiKey=Deno.env.get("KDS-AI-Email")||"";
  if(!apiKey)return json({ok:false,sent:false,configured:false,error:"KDS-AI-Email ist noch nicht in den Supabase Secrets hinterlegt."},503);

  const name=clean(body?.name,120),suppliedEmail=clean(body?.email,320),email=emailFrom(suppliedEmail)||emailFrom(message);
  const project=clean(body?.project,500),page=clean(body?.page,500)||"KDS AI",model=clean(body?.model,200)||"Nicht angegeben",conversation=clean(body?.conversation);
  const time=new Date().toLocaleString("de-DE",{timeZone:"Europe/Berlin"});
  const text=["Neue KDS-AI-Kundenanfrage","","Zeit: "+time,"Name: "+(name||"Nicht angegeben"),"E-Mail: "+(email||"Nicht angegeben"),"Projekt: "+(project||"Nicht angegeben"),"Seite: "+page,"KI-Modell: "+model,"","Auslöser:",message,"","Gesprächskontext:",conversation||message].join("\n");
  const html=`<!doctype html><html><body style="margin:0;background:#f5f5f5;font-family:Arial,sans-serif;padding:24px"><div style="max-width:680px;margin:auto;background:#fff;border:1px solid #ddd;border-radius:18px;padding:24px"><div style="font-size:12px;letter-spacing:.12em;color:#FE5A00;font-weight:700">KDS AI</div><h1 style="margin:8px 0 20px;font-size:24px">Neue Kundenanfrage</h1><p><b>Zeit:</b> ${escapeHtml(time)}</p><p><b>Name:</b> ${escapeHtml(name||"Nicht angegeben")}</p><p><b>E-Mail:</b> ${escapeHtml(email||"Nicht angegeben")}</p><p><b>Projekt:</b> ${escapeHtml(project||"Nicht angegeben")}</p><p><b>Seite:</b> ${escapeHtml(page)}</p><p><b>KI-Modell:</b> ${escapeHtml(model)}</p><h2>Auslöser</h2><div style="background:#f7f7f7;border-radius:12px;padding:14px;white-space:pre-wrap">${escapeHtml(message)}</div><h2>Gesprächskontext</h2><div style="background:#f7f7f7;border-radius:12px;padding:14px;white-space:pre-wrap">${escapeHtml(conversation||message)}</div></div></body></html>`;
  const payload:any={sender:{name:"KDS AI",email:SENDER},to:[{email:TARGET,name:"KDS Admin"}],subject:"Neue KDS-AI-Kundenanfrage",textContent:text,htmlContent:html};
  if(email)payload.replyTo={email};
  const response=await fetch("https://api.brevo.com/v3/smtp/email",{method:"POST",headers:{accept:"application/json","api-key":apiKey,"content-type":"application/json"},body:JSON.stringify(payload)});
  const data=await response.json().catch(()=>({}));
  if(!response.ok){console.error("Brevo error:",response.status,data);return json({ok:false,sent:false,error:"Brevo konnte die E-Mail nicht senden.",providerStatus:response.status},502)}
  return json({ok:true,sent:true,inquiry:true,messageId:data?.messageId||null});
 }catch(e){console.error("KDS mail error:",e);return json({ok:false,sent:false,error:"E-Mail-Versand fehlgeschlagen."},500)}
});