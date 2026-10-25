import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faPlus, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";

export default function Chat() {
  const { user, hasRole } = useAuth();
  const isMember = hasRole("member");
  const [chats, setChats] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const bottom = useRef(null);

  const loadChats = () => isMember && api("/chat/chats/").then(setChats).catch(() => {});
  useEffect(() => { loadChats(); }, [user]); // eslint-disable-line
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function openChat(id) {
    const c = await api(`/chat/chats/${id}/`);
    setChatId(id);
    setMessages(c.messages);
  }

  function newChat() { setChatId(null); setMessages([]); }

  async function send(e) {
    e.preventDefault();
    const q = text.trim();
    if (!q || busy) return;
    setText("");
    setError("");
    setBusy(true);
    setMessages((m) => [...m, { role: "user", content: q, attachments: [] }]);
    try {
      const r = await api("/chat/ask/", { method: "POST", body: { message: q, chat_id: chatId || undefined } });
      setMessages((m) => [...m, { role: "assistant", content: r.answer, attachments: r.attachments }]);
      if (r.chat_id && r.chat_id !== chatId) { setChatId(r.chat_id); loadChats(); }
    } catch (err) {
      setError(err.status === 429 ? "Слишком много запросов, подождите минуту." : "Не удалось получить ответ.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="chat-layout">
      {isMember && (
        <aside className="sidebar">
          <button className="btn" onClick={newChat}><FontAwesomeIcon icon={faPlus} /> Новый чат</button>
          <ul>
            {chats.map((c) => (
              <li key={c.id}>
                <button className={c.id === chatId ? "active" : ""} onClick={() => openChat(c.id)}>
                  {c.title || `Чат ${c.id}`}
                </button>
              </li>
            ))}
          </ul>
        </aside>
      )}
      <section className="chat">
        {!isMember && (
          <p className="notice">
            Вы общаетесь как гость: чаты не сохраняются, фото недоступны.{" "}
            <Link to="/register">Зарегистрируйтесь</Link>, чтобы это изменить.
          </p>
        )}
        <div className="messages">
          {messages.length === 0 && <p className="muted center">Спросите что-нибудь у Левши…</p>}
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role}`}>
              <p>{m.content}</p>
              {m.attachments?.length > 0 && (
                <div className="gallery">
                  {m.attachments.map((a) => (
                    <a key={a.id} href={a.url} target="_blank" rel="noreferrer" title={`${a.title} ${a.year || ""}`}>
                      <img src={a.url} alt={a.title} loading="lazy" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
          {busy && <div className="msg assistant"><FontAwesomeIcon icon={faSpinner} spin /></div>}
          <div ref={bottom} />
        </div>
        {error && <p className="error">{error}</p>}
        <form className="composer" onSubmit={send}>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Ваш вопрос…" maxLength={4000} />
          <button className="btn" disabled={busy || !text.trim()} aria-label="Отправить">
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </form>
      </section>
    </div>
  );
}
