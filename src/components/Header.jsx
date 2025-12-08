import DarkModeToggle from "./DarkModeToggle";

export default function Header() {
  return (
    <header className="header">
      <h1>Nesti</h1>
      <nav>
        <a href="/">Accueil</a>
        <a href="/monnest">Mon Nest</a>
        <a href="/agenda">Agenda</a>
        <a href="/discover">Découvertes</a>
        <a href="/nesti-ia">Nesti IA</a>
      </nav>
      <DarkModeToggle />
    </header>
  );
}
