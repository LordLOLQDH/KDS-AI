const VERSION = "5.6";
const ENDPOINT = "https://eopvkwhcgznvubesaszv.supabase.co/functions/v1/ai-chat-v3";
const FALLBACK_ENDPOINT = "https://eopvkwhcgznvubesaszv.supabase.co/functions/v1/cloudflare-ai-fallback";
const CLOUDFLARE_WORKER_ENDPOINT = "https://kds-ai-cloudflare.adam-kraus.workers.dev";
const BETA_ENDPOINT = "https://eopvkwhcgznvubesaszv.supabase.co/functions/v1/kds-beta";

const KDS_KNOWLEDGE = `
KDS steht für Kraus Digital Solutions. KDS ist ein digitales Dienstleistungsprojekt mit Schwerpunkt auf modernen Websites, digitalen Lösungen und individuellen Funktionen. KDS entwickelt Websites für Kunden und bietet klassische, interaktive und Premium-Lösungen an.
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
function add(text,cls){const el=document.createElement("div");el.className="msg "+cls;el.textContent=text;messages.appendChild(el);el.scrollIntoView({behavior:"smooth",block:"nearest"})}
updateApp.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();updateApp.disabled=true;updateApp.textContent="Aktualisiere …";adminToken="";adminMode=false;const u=new URL(location.href);u.search="";u.searchParams.set("update",Date.now());location.href=u.toString()});

async function notifyContact(message){try{const r=await fetch("https://eopvkwhcgznvubesaszv.supabase.co/functions/v1/kds-contact-email",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message,conversation:conversation.map(x=>x.role+": "+x.content).join("\n\n"),page:location.href,model:selectedModel})});if(!r.ok)return false;const d=await r.json();return d?.sent===true}catch(err){console.warn("Kontakt-Weiterleitung fehlgeschlagen.",err);return false}}
function isContactRequest(message){
 const m=message.toLowerCase();
 const project=/(website|webseite|homepage|shop|onlineshop|online-shop|admin.?panel|login|newsletter|design|programmier|entwickl|funktion)/i.test(m);
 const explicit=/(angebot|anfrage|anfragen|kontakt|kontaktieren|erreichen|sende|schick|meldet euch|melde mich|erstellen lassen|machen lassen|beauftragen|bestellen|rückruf|rueckruf)/i.test(m);
 return project && explicit;
}
let contactFlow=null;
function extractContactData(text){
 const data={};
 const name=text.match(/(?:ich hei(?:ß|ss)e|mein(?:e)?\s+name\s+ist|name\s*[:=])\s+([A-Za-zÄÖÜäöüß' -]{2,60})/i);
 if(name)data.name=name[1].trim().replace(/[.,;:]+$/,"");
 const email=text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
 if(email)data.contact=email[0];
 const phone=text.match(/(?:\+49|0\d)[\d\s()/-]{7,18}\d/);
 if(!data.contact&&phone)data.contact=phone[0].trim();
 const domain=text.match(/\b(?:https?:\/\/)?(?:www\.)?[a-z0-9-]+\.(?:de|com|net|org|io|eu)\b/i);
 if(domain)data.project=domain[0];
 const project=text.match(/(?:website|webseite|homepage)(?:\s+(?:soll|heißt|heisst|ist|werden))?\s*(?:namens?|mit dem namen)?\s*[:=]?\s*([A-Za-z0-9ÄÖÜäöüß ._-]{2,80})/i);
 if(!data.project&&project)data.project=project[1].trim().replace(/[.,;:]+$/,"");
 return data;
}
function missingContactFields(){
 return ["name","project","contact"].filter(k=>!contactFlow?.[k]);
}
function contactSummary(){
 return "Ich habe folgende Angaben für deine Anfrage erfasst:\nName: "+contactFlow.name+"\nProjekt: "+contactFlow.project+"\nKontakt: "+contactFlow.contact+"\n\nSoll ich diese Anfrage jetzt an KDS senden?";
}
function addSendButton(messageEl){
 const wrap=document.createElement("div");wrap.className="contact-action";
 const btn=document.createElement("button");btn.type="button";btn.className="contact-send";btn.textContent="An KDS senden";
 btn.addEventListener("click",async()=>{
   btn.disabled=true;btn.textContent="Wird gesendet …";
   const request="Website-Angebotsanfrage\nName: "+contactFlow.name+"\nProjekt: "+contactFlow.project+"\nKontakt: "+contactFlow.contact;
   const sent=await notifyContact(request);
   if(sent){btn.textContent="An KDS gesendet";btn.classList.add("sent");contactFlow=null;}
   else{btn.disabled=false;btn.textContent="An KDS senden";}
 });
 wrap.appendChild(btn);messageEl.parentNode.insertBefore(wrap,messageEl.nextSibling);
}
function showContactMessage(text,withButton=false){
 add(text,"ai");
 const el=messages.lastElementChild;
 if(withButton)addSendButton(el);
}
function cloudflarePrompt(message,isFirstMessage=false){return `Du bist KDS, der persönliche KI-Agent von Kraus Digital Solutions. Nutze diese Wissensbasis als verbindliche Faktenbasis. Antworte direkt und natürlich. Erfinde keine KDS-Fakten. Wenn die Frage nicht über KDS ist, beantworte sie normal. Antworte in derselben Sprache wie der Nutzer. Bei Chinesisch vollständig Chinesisch, bei Englisch Englisch, bei Deutsch Deutsch. Stelle dich nur bei der ersten Nachricht kurz als persönlicher KDS-Agent vor. Stelle dich bei Folgefragen nicht erneut vor und frage nicht "Wie kann ich helfen?", wenn bereits eine konkrete Frage gestellt wurde. Sage niemals, dass du keine Informationen über KDS bereitstellen kannst, wenn die Antwort in der Wissensbasis steht.\n\nKDS-WISSENSBASIS:\n${KDS_KNOWLEDGE}\n\n${isFirstMessage?"Erste Nachricht: kurze Vorstellung erlaubt.":"Folgefrage: keine erneute Vorstellung."}\n\nNUTZERFRAGE:\n${message}`}
async function requestCloudflare(message,isFirstMessage=false){const r=await fetch(CLOUDFLARE_WORKER_ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify({message:cloudflarePrompt(message,isFirstMessage)})});const d=await r.json();if(!r.ok||!d.reply)throw Error(d.error||`Cloudflare-Fehler (${r.status})`);return d.reply}
async function requestMain(message,isFirstMessage){const r=await fetch(ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message,isFirstMessage,adminToken,model:selectedModel,conversation:conversation.map(x=>x.role+": "+x.content).join("\n\n"),page:location.href})});const d=await r.json();if(!r.ok)throw Error(d.error||`Serverfehler (${r.status})`);return d}
("submit",async e=>{
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
   if(isContactRequest(message)||contactFlow){
    const extracted=extractContactData(message);
    if(!contactFlow)contactFlow={};
    Object.assign(contactFlow,extracted);
    const missing=missingContactFields();
    if(missing.length){
      const labels={name:"deinen Namen",project:"den Namen bzw. die Domain des Projekts",contact:"eine Kontaktmöglichkeit (E-Mail oder Telefonnummer)"};
      const ask=missing.length===3?"Gerne. Bevor ich die Anfrage an KDS sende, brauche ich noch deinen Namen, den Namen bzw. die Domain des Projekts und eine Kontaktmöglichkeit (E-Mail oder Telefonnummer).":
        "Gerne. Mir fehlt noch "+missing.map(k=>labels[k]).join(" und ")+".";
      pending.textContent=(isFirstMessage?"Hallo! Ich bin dein persönlicher Assistent von KDS.\n\n":"")+ask;
      conversation.push({role:"assistant",content:pending.textContent});input.focus();return;
    }
    pending.textContent=(isFirstMessage?"Hallo! Ich bin dein persönlicher Assistent von KDS.\n\n":"")+contactSummary();
    conversation.push({role:"assistant",content:pending.textContent});
    addSendButton(pending);input.focus();return;
  }
  if(selectedModel==="cloudflare"){pending.textContent=await requestCloudflare(message,isFirstMessage);conversation.push({role:"assistant",content:pending.textContent});input.focus();return}
   let d;
   try{d=await requestMain(message,isFirstMessage)}catch(mainErr){console.warn("Primäres Modell fehlgeschlagen, Cloudflare-Fallback wird verwendet.",mainErr);pending.textContent="Wechsle zu Cloudflare AI …";pending.textContent=await requestCloudflare(message,isFirstMessage);conversation.push({role:"assistant",content:pending.textContent});input.focus();return}
   if(d.adminToken){adminToken=d.adminToken;adminMode=true;setAdminStatus();pending.textContent=d.reply||"Admin-Modus aktiviert."}else { pending.textContent=d.reply||d.error||"Keine Antwort erhalten."; conversation.push({role:"assistant",content:pending.textContent}); }
 }catch(err){console.error(err);pending.textContent="Die Anfrage konnte gerade nicht verarbeitet werden."}
 input.focus();
});
