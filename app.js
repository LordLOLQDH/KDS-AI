const ENDPOINT="https://eopvkwhcgznvubesaszv.supabase.co/functions/v1/ai-chat";
const messages=document.querySelector("#messages"),form=document.querySelector("#chat"),input=document.querySelector("#input");
let messageCount=0;
function add(text,cls){const el=document.createElement("div");el.className="msg "+cls;el.textContent=text;messages.appendChild(el);el.scrollIntoView({behavior:"smooth"});}
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
    const r=await fetch(ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message,isFirstMessage})});
    const d=await r.json();
    pending.textContent=d.reply||d.error||"Keine Antwort erhalten.";
  }catch(err){
    pending.textContent="Verbindungsfehler.";
  }
});