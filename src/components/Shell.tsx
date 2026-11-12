import { useState, type ReactNode } from "react";
import { NavLink, Outlet, Link, useLocation } from "react-router-dom";
import { BackupControls } from "./Backup";
import { useOpenGuide } from "./Guide";
import { CalendarIcon, GridIcon, HeartIcon, MenuIcon } from "./Icons";
import { Sheet } from "./Sheet";

export function Shell() {
  const [menu, setMenu] = useState(false);
  const openGuide = useOpenGuide();
  const { pathname } = useLocation();
  const home = pathname === "/";

  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" className="brand">
          <img src={`${import.meta.env.BASE_URL}icons/icon-192.png`} alt="" width={40} height={40} />
          <span>
            <strong>Elf Ideas</strong>
            {home && <small>Nivaan’s shelf · 2020–2024</small>}
          </span>
        </Link>
        <button type="button" className="icon-button" aria-label="Menu" onClick={() => setMenu(true)}>
          <MenuIcon />
        </button>
      </header>
      <main className="main">
        <Outlet />
      </main>
      <nav className="tabbar" aria-label="Primary">
        <div className="tabbar-inner">
          <Tab to="/" label="Ideas" end>
            <GridIcon />
          </Tab>
          <Tab to="/plan" label="Nights">
            <CalendarIcon />
          </Tab>
          <Tab to="/mine" label="My plan">
            <HeartIcon />
          </Tab>
        </div>
      </nav>
      {menu && (
        <Sheet title="Menu" onClose={() => setMenu(false)}>
          <button
            type="button"
            className="menu-item"
            onClick={() => {
              setMenu(false);
              openGuide();
            }}
          >
            Add to Home Screen
          </button>
          <BackupControls />
          <p className="about">
            Elf Ideas is a private catalog of the setups Karthik’s family made for Nivaan from 2020 to 2024. Want-to-try
            lists, notes, and the December plan stay on this phone. No account, no ads. After the first visit it also
            works offline.
          </p>
        </Sheet>
      )}
    </div>
  );
}

function Tab({ to, label, end, children }: { to: string; label: string; end?: boolean; children: ReactNode }) {
  return (
    <NavLink to={to} end={end} className={({ isActive }) => (isActive ? "tab on" : "tab")}>
      {children}
      <span>{label}</span>
    </NavLink>
  );
}
