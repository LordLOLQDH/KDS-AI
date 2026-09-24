const VERSION = "5.0 Beta";
const ENDPOINT = "https://eopvkwhcgznvubesaszv.supabase.co/functions/v1/ai-chat-v3";
const FALLBACK_ENDPOINT = "https://eopvkwhcgznvubesaszv.supabase.co/functions/v1/cloudflare-ai-fallback";
const CLOUDFLARE_WORKER_ENDPOINT = "https://kds-ai-cloudflare.adam-kraus.workers.dev";

// The Cloudflare fallback receives the same fixed KDS knowledge used by the
// primary KDS AI, so switching providers does not make the assistant "forget" KDS.
const KDS_KNOWLEDGE = `
KDS – Hintergrundwissen

UNTERNEHMEN
KDS steht für Kraus Digital Solutions.
KDS ist ein digitales Dienstleistungsprojekt mit Schwerpunkt auf modernen Websites, digitalen Lösungen und individuellen Funktionen.
KDS entwickelt und gestaltet Websites für Kunden und bietet klassische, interaktive und Premium-Lösungen an.
KDS legt Wert auf moderne, übersichtliche, responsive und professionell wirkende Webauftritte.
KDS arbeitet kundenorientiert und bietet auch nach der Übergabe weitere Änderungen an.

ANSPRECHPERSON
Adam Gabriel Kraus ist Gründer von KDS.
Geschäftliche E-Mail: kraus-digital@proton.me
Administrative/private E-Mail: adam_kraus@icloud.com
Die administrative/private E-Mail darf nur bei ausdrücklicher Nachfrage genannt werden.

GESCHÄFTLICHER KONTAKT
WhatsApp: +49 175 4081426
Geschäftliche E-Mail: kraus-digital@proton.me

LEISTUNGEN
KDS bietet Website-Erstellung, Design, Texte, Bilder, Zeitaufwand, interaktive Funktionen, Premium-Funktionen, Admin-Panels, Login-Lösungen und Newsletter-Leistungen an.

PREISE
WEBSITE STANDARD
Normal: 160 € | Testkunde: 90 €
Grundgerüst: Normal 40 € | Testkunde 30 €
Design: Normal 10 € | Testkunde 5 €
Texte: Normal 50 € | Testkunde 30 €
Bilder: Normal 25 € | Testkunde 10 €
Zeitaufwand: Normal 35 € | Testkunde 15 €

INTERAKTIV
Funktion 1: Normal 35 € | Testkunde 20 €
Funktion 2: Normal 35 € | Testkunde 20 €
Weitere Funktionen mit Aufwand: Normal 135 € | Testkunde +20 €

PREMIUM
Login 1: Normal 50 € | Testkunde 40 €
Website 2 für Login 1: Normal 40 € | Testkunde 30 €
Admin Panel mit Login: Normal 35 € | Testkunde 30 €
Admin Panel ohne Login: Normal 25 € | Testkunde 20 €

NACH ÜBERGABE
Kleine Änderungen: 10–30 € pro Änderung
Größere Änderungen: ca. 30 € pro Änderung

NEWSLETTER
Wöchentlich: 30 € / Monat | Testkunde 18 € / Monat
Monatlich: 10 € / Monat | Testkunde 5 € / Monat
Individuell: 15 € / E-Mail | Testkunde 8 € / E-Mail
Special E-Mail: 20 € / Jahr | Testkunde 10 € / Jahr
`;

const messages=document.querySelector("#messages"),form=document.querySelector("#chat"),input=document.querySelector("#input"),updateApp=document.querySelector("#updateApp");
let messageCount=Number(sessionStorage.getItem("kds_ai_message_count")||"0"),adminToken="",adminMode=false,selectedModel=localStorage.getItem("kds_ai_model")||"default";
function setAdminStatus(){const s=document.querySelector("#modeStatus");if(s)s.textContent=adminMode?"Admin-Modus":"Online"}setAdminStatus();
const modelSelect=document.querySelector("#modelSelect");if(modelSelect){if([...modelSelect.options].some(o=>o.value===selectedModel))modelSelect.value=selectedModel;else{selectedModel="default";modelSelect.value="default"}modelSelect.addEventListener("change",()=>{selectedModel=modelSelect.value;localStorage.setItem("kds_ai_model",selectedModel)})}
function add(text,cls){const el=document.createElement("div");el.className="msg "+cls;el.textContent=text;messages.appendChild(el);el.scrollIntoView({behavior:"smooth",block:"nearest"})}
updateApp.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();updateApp.disabled=true;updateApp.textContent="Aktualisiere …";adminToken="";adminMode=false;const u=new URL(location.href);u.search="";u.searchParams.set("update",Date.now());location.href=u.toString()});

function cloudflarePrompt(message,isFirstMessage=false){return `Du bist KDS, der persönliche KI-Agent von Kraus Digital Solutions. Nutze die folgende KDS-Wissensbasis als verbindliche Faktenbasis. Antworte direkt auf die konkrete Frage und erfinde keine KDS-Fakten. Wenn die Frage nichts mit KDS zu tun hat, beantworte sie trotzdem normal. Antworte in derselben Sprache wie der Nutzer. Bei Chinesisch vollständig auf Chinesisch, bei Englisch auf Englisch, bei Deutsch auf Deutsch. Stelle dich nur bei der ersten Nachricht kurz als persönlicher KDS-Agent vor; schreibe nicht jedes Mal eine Begrüßungsfloskel und frage nicht nach, wie du helfen kannst, wenn bereits eine konkrete Frage gestellt wurde. Sage niemals, dass du keine Informationen über KDS bereitstellen kannst, wenn die Antwort in der Wissensbasis steht. Die administrative/private E-Mail darf nur auf ausdrückliche Nachfrage genannt werden.\n\nKDS-WISSENSBASIS:\n${KDS_KNOWLEDGE}\n\n${isFirstMessage?"Dies ist die erste Nachricht. Eine kurze Vorstellung ist erlaubt.":"Dies ist eine Folgefrage. Stelle dich nicht erneut vor."}\n\nNUTZERFRAGE:\n${message}`}

async function requestCloudflare(message,isFirstMessage=false){const r=await fetch(CLOUDFLARE_WORKER_ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify({message:cloudflarePrompt(message,isFirstMessage)})});const d=await r.json();if(!r.ok||!d.reply)throw Error(d.error||`Cloudflare-Fehler (${r.status})`);return d.reply}
async function requestMain(message,isFirstMessage){const r=await fetch(ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message,isFirstMessage,adminToken,model:selectedModel})});const d=await r.json();if(!r.ok)throw Error(d.error||`Serverfehler (${r.status})`);return d}
form.addEventListener("submit",async e=>{e.preventDefault();e.stopPropagation();const message=input.value.trim();if(!message)return;if(message.toLowerCase()==="/exit"){input.value="";adminToken="";adminMode=false;setAdminStatus();add(message,"user");add("Admin-Modus beendet.","ai");input.focus();return}input.value="";add(message,"user");const n=message.toLowerCase().replace(/[!,.?]/g,"").trim();if(/^(hallo|hi|hey|guten morgen|guten tag|guten abend)$/.test(n)&&selectedModel!=="cloudflare"){messageCount++;sessionStorage.setItem("kds_ai_message_count",String(messageCount));add("Hallo! Ich bin dein persönlicher KDS-Assistent. Was möchtest du wissen?","ai");input.focus();return}add("…","ai");const pending=messages.lastElementChild,isFirstMessage=messageCount===0;messageCount++;sessionStorage.setItem("kds_ai_message_count",String(messageCount));try{if(selectedModel==="cloudflare"){pending.textContent=await requestCloudflare(message,isFirstMessage);input.focus();return}let d;try{d=await requestMain(message,isFirstMessage)}catch(mainErr){console.warn("Primäres Modell fehlgeschlagen, Cloudflare-Fallback wird verwendet.",mainErr);pending.textContent="Wechsle zu Cloudflare AI …";pending.textContent=await requestCloudflare(message,isFirstMessage);input.focus();return}if(d.adminToken){adminToken=d.adminToken;adminMode=true;setAdminStatus();pending.textContent=d.reply||"Admin-Modus aktiviert."}if(d.mode==="exit"){adminToken="";adminMode=false;setAdminStatus()}if(!d.adminToken)pending.textContent=d.reply||d.error||"Keine Antwort erhalten."}catch(err){console.error(err);pending.textContent="Cloudflare AI ist momentan ebenfalls nicht erreichbar."}input.focus()});
