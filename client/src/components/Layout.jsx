import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  LayoutDashboard,
  CheckCheck,
  Users,
  Check,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  ArrowUpRight,
} from "lucide-react";
import { signedOut } from "../store";
import { initials } from "../utils/format";
import { api } from "../services/api";
export default function Layout() {
  const user = useSelector((s) => s.auth.user),
    dispatch = useDispatch(),
    navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(localStorage.getItem("tf-theme") === "dark");
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("tf-theme", dark ? "dark" : "light");
  }, [dark]);
  useEffect(() => {
    api.get("/me").catch((e) => {
      if (e.response?.status === 401) {
        dispatch(signedOut());
        navigate("/login");
      }
    });
  }, [dispatch, navigate]);
  function logout() {
    dispatch(signedOut());
    navigate("/login");
  }
  return (
    <div className="app-shell">
      {open && <div className="sidebar-scrim" onClick={() => setOpen(false)} />}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <NavLink to="/" className="brand">
          <span>
            <Check size={23} strokeWidth={3} />
          </span>
          taskflow<span className="brand-dot">.</span>
        </NavLink>
        <button
          className="mobile-close icon-button"
          onClick={() => setOpen(false)}
          aria-label="Close navigation"
        >
          <X />
        </button>
        <div className="workspace-label">WORKSPACE</div>
        <nav>
          {[
            [LayoutDashboard, "Overview", "/"],
            [CheckCheck, "All tasks", "/tasks"],
            [Users, "Team", "/team"],
          ].map(([Icon, label, to]) => (
            <NavLink
              key={to}
              to={to}
              end
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <Icon size={19} />
              {label}
              {to === "/" && <span className="nav-dot" />}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-note">
          <span className="note-icon">✦</span>
          <h3>
            A little focus.
            <br />A lot of progress.
          </h3>
          <p>Good work starts with one clear next step.</p>
          <NavLink to="/tasks" onClick={() => setOpen(false)}>
            Find your next task
            <ArrowUpRight size={16} />
          </NavLink>
        </div>
        <div className="sidebar-bottom">
          <div className="profile">
            <span className="avatar large">{initials(user.name)}</span>
            <div>
              <strong>{user.name}</strong>
              <span>
                {user.role === "admin" ? "Workspace admin" : "Team member"}
              </span>
            </div>
          </div>
          <button className="logout" onClick={logout}>
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>
      <div className="main-shell">
        <header className="navbar">
          <div className="flex items-center gap-3">
            <button
              className="mobile-menu icon-button"
              onClick={() => setOpen(true)}
              aria-label="Open navigation"
            >
              <Menu />
            </button>
            <span className="breadcrumb">
              Workspace <span>/</span> <strong>Your team</strong>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="demo-badge">DEMO WORKSPACE</span>
            <button
              className="icon-button"
              onClick={() => setDark((d) => !d)}
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {dark ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <span className="avatar">{initials(user.name)}</span>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
        <div className="page-footer">
          <span>Made for meaningful work.</span>
          <span>TaskFlow · Full Stack Assessment</span>
        </div>
      </div>
    </div>
  );
}
