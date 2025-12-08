import React from "react";

export default function Home() {
  return (
    <div>
      <section className="card">
        <h2>Bienvenue sur Nesti</h2>
        <p>Nesti simplifie la vie familiale : fil d’actualité, agenda, membres et assistant IA.</p>
        <a href="/mon-nest">Créer mon Nest →</a>
      </section>

      <section className="card">
        <h3>Découvrir</h3>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
          <div className="card">Fil familial</div>
          <div className="card">Agenda</div>
          <div className="card">Nesti IA</div>
        </div>
      </section>
    </div>
  );
}
