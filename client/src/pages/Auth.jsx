import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Check,
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";
import { api, errorMessage } from "../services/api";
import { signedIn } from "../store";
export default function Auth() {
  const register = useLocation().pathname === "/register";
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [remember, setRemember] = useState(false),
    [show, setShow] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const dispatch = useDispatch(),
    navigate = useNavigate();
  const change = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  async function submit(e) {
    e.preventDefault();
    setError("");
    if (
      register &&
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,72}$/.test(
        form.password,
      )
    ) {
      setError(
        "Use 8+ characters with uppercase, lowercase, a number and a symbol.",
      );
      return;
    }
    setBusy(true);
    try {
      const r = await api.post(
        register ? "/register" : "/login",
        register
          ? form
          : {
              email: form.email,
              password: form.password,
              rememberMe: remember,
            },
      );
      dispatch(signedIn({ ...r.data, remember }));
      navigate("/");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-page">
      <section className="auth-story">
        <Link to="/login" className="brand">
          <span>
            <Check size={23} />
          </span>
          taskflow<span className="brand-dot">.</span>
        </Link>
        <div className="auth-story-body">
          <span className="eyebrow">LESS NOISE. MORE MOMENTUM.</span>
          <h1>
            Your work,
            <br />
            in a better flow.
          </h1>
          <p>
            One calm place to organize tasks, connect your team, and make real
            progress.
          </p>
          <div className="preview-stack">
            <div className="preview-item">
              <span className="check-box done">
                <Check size={16} />
              </span>
              <span>Turn ideas into clear next steps</span>
              <span className="tiny-pill">Done</span>
            </div>
            <div className="preview-item shifted">
              <span className="check-box" />
              <span>Keep everyone moving together</span>
              <span className="tiny-pill in-progress">In progress</span>
            </div>
            <div className="preview-item">
              <span className="check-box" />
              <span>Make room for your best work</span>
              <span className="tiny-pill">Next up</span>
            </div>
          </div>
        </div>
        <div className="auth-footnote">
          <ShieldCheck size={16} />
          Secure sign-in. Thoughtful by design.
        </div>
      </section>
      <section className="auth-form">
        <div className="auth-form-inner">
          <span className="eyebrow">YOUR WORKSPACE AWAITS</span>
          <h2>{register ? "Start something good." : "Welcome back."}</h2>
          <p>
            {register
              ? "Create an account and get your work in flow."
              : "A fresh start for everything on your list."}
          </p>
          <form onSubmit={submit}>
            {register && (
              <label>
                Your name
                <input
                  name="name"
                  autoComplete="name"
                  value={form.name}
                  onChange={change}
                  placeholder="Alex Morgan"
                  required
                  minLength={2}
                  maxLength={80}
                />
              </label>
            )}
            <label>
              Email address
              <input
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={change}
                placeholder="you@example.com"
                required
              />
            </label>
            <label>
              Password
              <div className="password-field">
                <input
                  name="password"
                  type={show ? "text" : "password"}
                  autoComplete={register ? "new-password" : "current-password"}
                  value={form.password}
                  onChange={change}
                  placeholder={
                    register
                      ? "Create a strong password"
                      : "Enter your password"
                  }
                  required
                  minLength={register ? 8 : 1}
                  maxLength={72}
                />
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
            {register ? (
              <small>
                8+ characters, uppercase, lowercase, a number and a symbol.
              </small>
            ) : (
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Remember me for 7 days
              </label>
            )}
            {error && (
              <div className="error-box" role="alert">
                {error}
              </div>
            )}
            <button className="button primary auth-submit" disabled={busy}>
              {busy ? <LoaderCircle size={18} className="spin" /> : null}
              {busy ? "Connecting..." : register ? "Create account" : "Sign in"}
              {!busy && <ArrowRight size={17} />}
            </button>
            {busy && (
              <small className="block mt-2">
                A free hosting server may take a minute to wake up.
              </small>
            )}
          </form>
          <div className="auth-switch">
            {register ? "Already have an account?" : "New to TaskFlow?"}{" "}
            <Link to={register ? "/login" : "/register"}>
              {register ? "Sign in" : "Create an account"}
            </Link>
          </div>
          {!register && (
            <div className="demo-credentials">
              <span className="eyebrow">TAKE A LOOK AROUND</span>
              <p>Public demo accounts. Please don't add sensitive data.</p>
              <button
                type="button"
                onClick={() =>
                  setForm({
                    name: "",
                    email: "testuser@example.com",
                    password: "Test@1234",
                  })
                }
              >
                Use member demo <ArrowRight size={14} />
              </button>
              <button
                type="button"
                onClick={() =>
                  setForm({
                    name: "",
                    email: "admin@example.com",
                    password: "Admin@1234",
                  })
                }
              >
                Use admin demo <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
