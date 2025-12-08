export default function Card({ content }) {
  return (
    <div className="card">
      <h3>{content.title}</h3>
      <p>{content.text}</p>
      <small>{new Date(content.created_at).toLocaleString()}</small>
    </div>
  );
}
