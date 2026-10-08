const VERSION = "5.9.3";
const ENDPOINT = "https://eopvkwhcgznvubesaszv.supabase.co/functions/v1/ai-chat-v3";
const FALLBACK_ENDPOINT = "https://eopvkwhcgznvubesaszv.supabase.co/functions/v1/cloudflare-ai-fallback";
const CLOUDFLARE_WORKER_ENDPOINT = "https://kds-ai-cloudflare.adam-kraus.workers.dev";
const BETA_ENDPOINT = "https://eopvkwhcgznvubesaszv.supabase.co/functions/v1/kds-beta";

const KDS_KNOWLEDGE = `
KDS steht für KDS – Kraus Development Systems. KDS ist ein digitales Dienstleistungsprojekt mit Schwerpunkt auf modernen Websites, digitalen Lösungen und individuellen Funktionen. KDS entwickelt Websites für Kunden und bietet klassische, interaktive und Premium-Lösungen an.
Adam Gabriel Kraus ist Gründer von KDS. Geschäftliche E-Mail: kraus-digital@proton.me. WhatsApp: +49 175 4081426.
Leistungen: Website-Erstellung, Design, Texte, Bilder, interaktive Funktionen, Premium-Funktionen, Admin-Panels, Login-Lösungen und Newsletter.
Preise: Standard-Website 160 € normal / 90 € Testkunde. Grundgerüst 40/30 €, Design 10/5 €, Texte 50/30 €, Bilder 25/10 €, Zeitaufwand 35/15 €. Interaktive Funktion 35/20 €. Premium: Login 50/40 €, Website 2 für Login 40/30 €, Admin Panel mit Login 35/30 €, ohne Login 25/20 €. Nach Übergabe kleine Änderungen 10–30 €, größere Änderungen ca. 30 €. Newsletter: wöchentlich 30 €/18 € pro Monat, monatlich 10 €/5 € pro Monat, individuell 15 €/8 € pro E-Mail, Special E-Mail 20 €/10 € pro Jahr.
`;

const messages=document.querySelector("#messages"),form=document.querySelector("#chat"),input=document.querySelector("#input"),updateApp=document.querySelector("#updateApp"),betaBadge=document.querySelector("#betaBadge");
let messageCount=Number(sessionStorage.getItem("kds_ai_message_count")||"0"),adminToken="",adminMode=false,selectedModel=localStorage.getItem("kds_ai_model")||"default";
const conversation=[];

function setAdminStatus(){const s=document.querySelector("#modeStatus");if(s)s.textContent=adminMode?"Admin-Modus":"Online"}
function setBetaBadge(enabled){if(betaBadge)betaBadge.hidden=!enabled}
setAdminStatus();

async function getBetaStatus(){try{const r=await fetch(BETA_ENDPOINT,{cache:"no-store"});const d=await r.json();setBetaBadge(d.betaEnabled===true);return d.betaEnabled===true}catch{setBetaBadge(false);return false}}
async function setBeta(action){if(!adminToken)throw Error("Admin-Modus erforderlich.");const r=await fetch(BETA_ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action,adminToken})});const d=await r.json();if(!r.ok||!d.ok)throw Error(d.error||"Beta-Einstellung konnte nicht geändert werden.");setBetaBadge(d.betaEnabled===true);return d}
getBetaStatus();

const modelSelect=document.querySelector("#modelSelect");
if(modelSelect){if([...modelSelect.options].some(o=>o.value===selectedModel))modelSelect.value=selectedModel;else{selectedModel="default";modelSelect.value="default"}modelSelect.addEventListener("change",()=>{selectedModel=modelSelect.value;localStorage.setItem("kds_ai_model",selectedModel)})}
function add(text,cls){const el=document.createElement("div");el.className="msg "+cls;el.textContent=text;messages.appendChild(el);el.scrollIntoView({behavior:"smooth",block:"nearest"})}function cleanFirstGreeting(text){if(typeof text!=="string")return text;return text.replace(/^\s*Hallo[!,.]?\s*Wie kann ich dir helfen\??\s*/i,"").replace(/^\s*Hallo[!,.]?\s*Wie kann ich helfen\??\s*/i,"").trim()}
updateApp.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();if(updateApp.disabled)return;updateApp.disabled=true;updateApp.textContent="Aktualisiere …";adminToken="";adminMode=false;sessionStorage.removeItem("kds_ai_message_count");window.location.replace(location.origin+location.pathname+"?cache="+Date.now());});

async function notifyContact(message,details={}){const endpoint="https://eopvkwhcgznvubesaszv.supabase.co/functions/v1/kds-contact-email-v2";const payload={message,name:details.name||"",email:details.email||"",project:details.project||"",conversation:conversation.map(x=>x.role+": "+x.content).join("\n\n"),page:location.href,model:selectedModel,source:details.source||"chat"};try{const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),15000);const r=await fetch(endpoint,{method:"POST",mode:"cors",cache:"no-store",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload),signal:controller.signal});clearTimeout(timer);const d=await r.json().catch(()=>({}));return {ok:r.ok,sent:d?.sent===true,data:d}}catch(err){console.warn("Kontakt-Weiterleitung fehlgeschlagen.",err);try{const beaconBody=new URLSearchParams(payload);const beacon=navigator.sendBeacon(endpoint,beaconBody);if(beacon)return {ok:true,sent:true,data:{fallback:"beacon"}}}catch(beaconErr){console.warn("Kontakt-Beacon fehlgeschlagen.",beaconErr)}return {ok:false,sent:false,data:{error:"Netzwerkfehler beim Kontaktversand."}}}}
const contactForm=document.querySelector("#contactForm"),contactPanel=document.querySelector("#contactPanel"),contactButton=document.querySelector("#contactButton"),contactClose=document.querySelector("#contactClose"),contactStatus=document.querySelector("#contactStatus");
function openContact(){if(contactPanel){contactPanel.hidden=false;contactPanel.scrollIntoView({behavior:"smooth",block:"center"});setTimeout(()=>contactPanel.querySelector("input")?.focus(),120)}}
function closeContact(){if(contactPanel)contactPanel.hidden=true}
contactButton?.addEventListener("click",openContact);contactClose?.addEventListener("click",closeContact);
contactForm?.addEventListener("submit",async e=>{e.preventDefault();e.stopPropagation();if(!contactForm.checkValidity()){contactForm.reportValidity();return}const fd=new FormData(contactForm);const name=String(fd.get("name")||"").trim(),email=String(fd.get("email")||"").trim(),project=String(fd.get("project")||"").trim(),message=String(fd.get("message")||"").trim();if(!message)return;const submit=contactForm.querySelector("button[type=submit]");if(submit){submit.disabled=true;submit.textContent="Wird gesendet …"}if(contactStatus)contactStatus.textContent="";const result=await notifyContact(message,{name,email,project,source:"contact-form"});if(result.sent){if(contactStatus)contactStatus.textContent="Anfrage wurde an KDS gesendet.";contactForm.reset();}else if(contactStatus){contactStatus.textContent=result.data?.error||"Die Anfrage konnte nicht gesendet werden. Bitte später erneut versuchen."}if(submit){submit.disabled=false;submit.textContent="Anfrage senden →"}});
function isContactRequest(message){
 const m=message.toLowerCase();
 const project=/(website|webseite|homepage|shop|onlineshop|online-shop|admin.?panel|login|newsletter|design|programmier|entwickl|funktion)/i.test(m);
 const explicit=/(angebot|anfrage|anfragen|kontakt|kontaktieren|erreichen|sende|schick|meldet euch|melde mich|erstellen lassen|machen lassen|beauftragen|bestellen|rückruf|rueckruf)/i.test(m);
 return project && explicit;
}
function cloudflarePrompt(message,isFirstMessage=false){return `Du bist KDS, der persönliche KI-Agent von KDS – Kraus Development Systems. Nutze diese Wissensbasis als verbindliche Faktenbasis. Antworte direkt und natürlich. Erfinde keine KDS-Fakten. Wenn die Frage nicht über KDS ist, beantworte sie normal. Antworte in derselben Sprache wie der Nutzer. Bei Chinesisch vollständig Chinesisch, bei Englisch Englisch, bei Deutsch Deutsch. Stelle dich nur bei der ersten Nachricht kurz als persönlicher KDS-Agent vor. Stelle dich bei Folgefragen nicht erneut vor und frage nicht "Wie kann ich helfen?", wenn bereits eine konkrete Frage gestellt wurde. Sage niemals, dass du keine Informationen über KDS bereitstellen kannst, wenn die Antwort in der Wissensbasis steht.\n\nKDS-WISSENSBASIS:\n${KDS_KNOWLEDGE}\n\n${isFirstMessage?"Erste Nachricht: kurze Vorstellung erlaubt.":"Folgefrage: keine erneute Vorstellung."}\n\nNUTZERFRAGE:\n${message}`}
async function requestCloudflare(message,isFirstMessage=false){const r=await fetch(CLOUDFLARE_WORKER_ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify({message:cloudflarePrompt(message,isFirstMessage)})});const d=await r.json();if(!r.ok||!d.reply)throw Error(d.error||`Cloudflare-Fehler (${r.status})`);return d.reply}
async function requestMain(message,isFirstMessage){const r=await fetch(ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message,isFirstMessage,adminToken,model:selectedModel,conversation:conversation.map(x=>x.role+": "+x.content).join("\n\n"),page:location.href})});const d=await r.json();if(!r.ok)throw Error(d.error||`Serverfehler (${r.status})`);return d}
form.addEventListener("submit",async e=>{
 e.preventDefault();e.stopPropagation();const message=input.value.trim();if(!message)return;input.value="";add(message,"user");
 const lower=message.toLowerCase().trim();
 if(lower==="/exit"){adminToken="";adminMode=false;setAdminStatus();add("Admin-Modus beendet.","ai");input.focus();return}
 add("…","ai");const pending=messages.lastElementChild;const isFirstMessage=messageCount===0;messageCount++;sessionStorage.setItem("kds_ai_message_count",String(messageCount));
 try{
   const betaOn=/^beta\s+(aktivieren|aktivier|an|ein)$/i.test(message)||/^beta\s+(deaktivieren|deaktivier|aus)$/i.test(message);
   if(betaOn){
     if(!adminMode){pending.textContent="Beta-Einstellungen sind nur im Admin-Modus verfügbar.";input.focus();return}
     const action=/^beta\s+(aktivieren|aktivier|an|ein)$/i.test(message)?"enable":"disable";
     const d=await setBeta(action);pending.textContent=d.reply||"Beta-Einstellung geändert.";input.focus();return;
   }
   if(/^beta\s*(status)?$/i.test(message)){
     const enabled=await getBetaStatus();pending.textContent=enabled?"Beta-Modus ist aktiviert.":"Beta-Modus ist deaktiviert.";input.focus();return;
   }
   if(isContactRequest(message)){ const result=await notifyContact(message); const sent=result.sent; if(sent){pending.textContent="Ich habe deine Anfrage an KDS weitergeleitet. Adam von KDS erhält die Angaben und kann sich bei dir wegen des Angebots für das gewünschte Projekt melden."; } else {pending.textContent="Ich konnte die Anfrage gerade nicht an KDS weiterleiten. Bitte versuche es gleich noch einmal oder kontaktiere KDS direkt über WhatsApp unter +49 175 4081426 oder per E-Mail an kraus-digital@proton.me.";} conversation.push({role:"assistant",content:pending.textContent}); input.focus(); return; }
  if(selectedModel==="cloudflare"){pending.textContent=cleanFirstGreeting(await requestCloudflare(message,isFirstMessage));conversation.push({role:"assistant",content:pending.textContent});input.focus();return}
   let d;
   try{d=await requestMain(message,isFirstMessage)}catch(mainErr){console.warn("Primäres Modell fehlgeschlagen, Cloudflare-Fallback wird verwendet.",mainErr);pending.textContent="Wechsle zu Cloudflare AI …";pending.textContent=await requestCloudflare(message,isFirstMessage);conversation.push({role:"assistant",content:pending.textContent});input.focus();return}
   if(d.adminToken){adminToken=d.adminToken;adminMode=true;setAdminStatus();pending.textContent=d.reply||"Admin-Modus aktiviert."}else { pending.textContent=cleanFirstGreeting(d.reply||d.error||"Keine Antwort erhalten."); conversation.push({role:"assistant",content:pending.textContent}); }
 }catch(err){console.error(err);pending.textContent="Die Anfrage konnte gerade nicht verarbeitet werden."}
 input.focus();
});
