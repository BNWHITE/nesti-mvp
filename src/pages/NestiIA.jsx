import React, { useState } from "react";

export default function NestiIA() {
  const [msg, setMsg] = useState("");
  const [log, setLog] = useState([]);

  const send = async () => {
    if (!msg) return;

    setLog(l => [...l, { role: "user", content: msg }]);

    try {
      const r = await fetch("/api/nesti-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg })
      });

      const data = await r.json();
      
      const reply =
        data?.choices?.[0]?.message?.content ||
        data?.result ||
        "Réponse IA indisponible";

      setLog(l => [...l, { role: "assistant", content: reply }]);
    } catch (err) {
      setLog(l => [...l, { role: "assistant", content: "Erreur serveur" }]);
    }

    setMsg("");
  };

  return (
    <div className="card">
      <h2>Nesti IA</h2>

      <div style={{border:"1px solid #ddd", padding:12, marginBottom:12, minHeight:180}}>
        {log.map((m,i) => (
          <div key={i}>
            <b>{m.role === "user" ? "Moi :" : "Nesti :"}</b>
            <p>{m.content}</p>
          </div>
        ))}
      </div>

      <div style={{display:"flex", gap:10}}>
        <input
          style={{flex:1, padding:8}}
          value={msg}
          placeholder="Demande quelque chose à Nesti…"
          onChange={e => setMsg(e.target.value)}
        />
        <button onClick={send}>Envoyer</button>
      </div>
    </div>
  );
}
