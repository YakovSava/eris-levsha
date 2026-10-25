import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";

export default function Auth({ mode }) {
  const isLogin = mode === "login";
  const { login, register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (isLogin) await login(form.username, form.password);
      else await register(form.username, form.email, form.password);
      nav("/");
    } catch (err) {
      const d = err.data;
      setError(d ? Object.values(d).flat().join(" ") : err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card auth" onSubmit={submit}>
      <h1>{isLogin ? "Вход" : "Регистрация"}</h1>
      <label>Логин<input value={form.username} onChange={set("username")} required autoFocus /></label>
      {!isLogin && <label>Email<input type="email" value={form.email} onChange={set("email")} /></label>}
      <label>Пароль<input type="password" value={form.password} onChange={set("password")} required /></label>
      {error && <p className="error">{error}</p>}
      <button className="btn" disabled={busy}>{isLogin ? "Войти" : "Создать аккаунт"}</button>
      <p className="muted">
        {isLogin ? <>Нет аккаунта? <Link to="/register">Регистрация</Link></>
                 : <>Уже есть аккаунт? <Link to="/login">Войти</Link></>}
      </p>
    </form>
  );
}
