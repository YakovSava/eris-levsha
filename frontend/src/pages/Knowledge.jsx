import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faUpload } from "@fortawesome/free-solid-svg-icons";
import { api } from "../api.js";

const KINDS = { text: "Текст", photo: "Фото", archive: "Архив" };
const empty = { kind: "photo", title: "", event: "", year: "", description: "" };

export default function Knowledge() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => api("/knowledge/items/").then((d) => setItems(d.results ?? d));
  useEffect(() => { load().catch(() => setError("Не удалось загрузить список")); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => v !== "" && fd.append(k, v));
    if (file) fd.append("file", file);
    try {
      await api("/knowledge/items/", { method: "POST", body: fd });
      setForm(empty);
      setFile(null);
      e.target.reset();
      await load();
    } catch (err) {
      setError(err.data ? Object.values(err.data).flat().join(" ") : err.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id) {
    if (!confirm("Удалить запись?")) return;
    await api(`/knowledge/items/${id}/`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="knowledge">
      <form className="card" onSubmit={submit}>
        <h1>Загрузка данных</h1>
        <label>Тип
          <select value={form.kind} onChange={set("kind")}>
            {Object.entries(KINDS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <label>Название<input value={form.title} onChange={set("title")} required /></label>
        <label>Мероприятие<input value={form.event} onChange={set("event")} /></label>
        <label>Год<input type="number" min="1900" max="2100" value={form.year} onChange={set("year")} /></label>
        <label>Описание<textarea rows="3" value={form.description} onChange={set("description")} /></label>
        <label>Файл<input type="file" onChange={(e) => setFile(e.target.files[0] || null)} /></label>
        {error && <p className="error">{error}</p>}
        <button className="btn" disabled={busy}><FontAwesomeIcon icon={faUpload} /> Загрузить</button>
      </form>

      <div className="card">
        <h1>Архив</h1>
        <table>
          <thead><tr><th>Название</th><th>Тип</th><th>Мероприятие</th><th>Год</th><th /></tr></thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id}>
                <td>{i.title}</td><td>{KINDS[i.kind]}</td><td>{i.event}</td><td>{i.year}</td>
                <td><button className="icon" onClick={() => remove(i.id)} aria-label="Удалить"><FontAwesomeIcon icon={faTrash} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <p className="muted">Пока пусто</p>}
      </div>
    </div>
  );
}
