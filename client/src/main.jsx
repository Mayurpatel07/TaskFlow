import React, { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { Provider, useSelector } from "react-redux";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { store } from "./store";
import Layout from "./components/Layout";
import "./styles.css";
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Team = lazy(() => import("./pages/Team"));
function Protected() {
  const user = useSelector((s) => s.auth.user);
  return user ? <Layout /> : <Navigate to="/login" replace />;
}
class ErrorBoundary extends React.Component {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <div className="empty-state">
        <h1>Something went wrong.</h1>
        <p>Refresh the page to start fresh.</p>
        <button className="button primary" onClick={() => location.reload()}>
          Refresh
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
function App() {
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="app-loading">
            <span className="loader" />
            <p>Getting your workspace ready...</p>
          </div>
        }
      >
        <Routes>
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth />} />
          <Route element={<Protected />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tasks" element={<Dashboard />} />
            <Route path="/team" element={<Team />} />
          </Route>
          <Route
            path="*"
            element={
              <div className="empty-state">
                <h1>Page not found.</h1>
                <Link to="/" className="button primary">
                  Back to workspace
                </Link>
              </div>
            }
          />
        </Routes>
      </Suspense>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { borderRadius: 12, fontSize: 14 },
          duration: 4000,
        }}
      />
    </ErrorBoundary>
  );
}
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);
