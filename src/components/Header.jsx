import { Link } from "react-router-dom";
import DarkModeToggle from "./DarkModeToggle";

export default function Header() {
  return (
    <header className="header">
      <h1>Nesti</h1>
      <nav>
        <Link to="/">Accueil</Link>
        <Link to="/mon-nest">Mon Nest</Link>
        <Link to="/agenda">Agenda</Link>
        <Link to="/decouvertes">Découvertes</Link>
        <Link to="/nesti-ia">Nesti IA</Link>
      </nav>
      <DarkModeToggle />
    </header>
  );
}
