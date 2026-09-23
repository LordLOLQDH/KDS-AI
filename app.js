const VERSION="2.0";
const ENDPOINT="https://eopvkwhcgznvubesaszv.supabase.co/functions/v1/ai-chat";
const messages=document.querySelector("#messages"),form=document.querySelector("#chat"),input=document.querySelector("#input"),updateApp=document.querySelector("#updateApp");
let messageCount=0;\nlet adminMode=localStorage.getItem("kdsAdminToken")!==null;\nfunction setAdminStatus(){\n  const status=document.querySelector("#modeStatus");\n  if(status) status.textContent=adminMode?"Admin-Modus":"Online";\n}\nsetAdminStatus();
function add(text,cls){
  const el=document.createElement("div");
  el.className="msg "+cls;
  el.textContent=text;
  messages.appendChild(el);
  el.scrollIntoView({behavior:"smooth",block:"nearest"});
}
updateApp.addEventListener("click",()=>{
  updateApp.disabled=true;
  updateApp.textContent="Aktualisiere …";
  window.location.replace(window.location.pathname+"?update="+Date.now());
});
form.addEventListener("submit",async e=>{
  e.preventDefault();
  const message=input.value.trim();
  if(!message)return;
  input.value="";
  add(message,"user");
  add("…","ai");
  const pending=messages.lastElementChild;
  const isFirstMessage=messageCount===0;
  messageCount++;
  try{
    const r=await fetch(ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message,isFirstMessage,adminToken:localStorage.getItem("kdsAdminToken")||""})});
    const d=await r.json();
    if(d.adminToken){\n      localStorage.setItem("kdsAdminToken",d.adminToken);\n      adminMode=true;\n      setAdminStatus();\n    }\n    pending.textContent=d.reply||d.error||"Keine Antwort erhalten.";
  }catch(err){
    pending.textContent="Verbindungsfehler.";
  }
  input.focus();
});
