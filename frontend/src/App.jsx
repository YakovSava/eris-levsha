import { Link, NavLink, Navigate, Route, Routes } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightFromBracket, faArrowRightToBracket, faBoxArchive, faComments, faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "./auth.jsx";
import Chat from "./pages/Chat.jsx";
import Auth from "./pages/Auth.jsx";
import Knowledge from "./pages/Knowledge.jsx";

function RequireRole({ role, children }) {
  const { ready, hasRole } = useAuth();
  if (!ready) return null;
  return hasRole(role) ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { user, logout, hasRole } = useAuth();
  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" className="brand">
          <img src="/logo.svg" alt="" width="32" height="32" />
          <span>Левша</span>
        </Link>
        <nav>
          <NavLink to="/" end><FontAwesomeIcon icon={faComments} /> Чат</NavLink>
          {hasRole("moderator") && (
            <NavLink to="/knowledge"><FontAwesomeIcon icon={faBoxArchive} /> Архив</NavLink>
          )}
          {hasRole("admin") && <a href="/admin/">Админка</a>}
        </nav>
        <div className="spacer" />
        {user ? (
          <div className="user">
            <span>{user.username} · {user.role}</span>
            <button className="btn ghost" onClick={logout}>
              <FontAwesomeIcon icon={faArrowRightFromBracket} /> Выйти
            </button>
          </div>
        ) : (
          <div className="user">
            <NavLink to="/login"><FontAwesomeIcon icon={faArrowRightToBracket} /> Войти</NavLink>
            <NavLink to="/register"><FontAwesomeIcon icon={faUserPlus} /> Регистрация</NavLink>
          </div>
        )}
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Chat />} />
          <Route path="/login" element={<Auth mode="login" />} />
          <Route path="/register" element={<Auth mode="register" />} />
          <Route path="/knowledge" element={<RequireRole role="moderator"><Knowledge /></RequireRole>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
