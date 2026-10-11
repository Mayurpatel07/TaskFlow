import { useState, useEffect } from "react";
import { Users, ShieldCheck, Mail } from "lucide-react";
import { api, errorMessage } from "../services/api";
import { initials } from "../utils/format";
export default function Team() {
  const [users, setUsers] = useState([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    const c = new AbortController();
    api
      .get("/users", { signal: c.signal })
      .then((r) => setUsers(r.data.users))
      .catch((e) => {
        if (e.code !== "ERR_CANCELED") setError(errorMessage(e));
      })
      .finally(() => setLoading(false));
    return () => c.abort();
  }, []);
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">BETTER TOGETHER</span>
          <h1>A team, in sync.</h1>
          <p>The people turning plans into progress.</p>
        </div>
        <span className="team-count">
          <Users size={18} />
          {users.length} members
        </span>
      </div>
      {error && <div className="error-box">{error}</div>}
      <div className="team-grid">
        {loading ? (
          <p>Loading your team...</p>
        ) : (
          users.map((u) => (
            <article className="team-card" key={u._id}>
              <span className="avatar xl">{initials(u.name)}</span>
              <h2>{u.name}</h2>
              <span className="role-label">
                {u.role === "admin" ? (
                  <ShieldCheck size={14} />
                ) : (
                  <Users size={14} />
                )}{" "}
                {u.role === "admin" ? "Admin" : "Member"}
              </span>
              <p>
                <Mail size={14} />
                {u.email}
              </p>
            </article>
          ))
        )}
      </div>
      <div className="team-info">
        <ShieldCheck size={19} />
        <p>
          Members see tasks they create or are assigned to. Admins can manage
          all workspace tasks. Only a task's creator or an admin can edit or
          delete it.
        </p>
      </div>
    </>
  );
}
