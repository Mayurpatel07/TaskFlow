import { useEffect, useState, useRef } from "react";
import { X, Trash2, Pencil, LoaderCircle } from "lucide-react";
import { api, errorMessage } from "../services/api";
import { statusLabel, formatDate } from "../utils/format";
import toast from "react-hot-toast";
export default function TaskModal({
  task,
  mode = "view",
  user,
  onClose,
  onSave,
  onDelete,
}) {
  const [editing, setEditing] = useState(mode === "create");
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    title: task?.title || "",
    description: task?.description || "",
    priority: task?.priority || "medium",
    status: task?.status || "pending",
    dueDate:
      task?.dueDate?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    assignedUser: task?.assignedUser?._id || user.id,
  });
  const modalRef = useRef();
  const canEdit =
    !task || user.role === "admin" || task.createdBy?._id === user.id;
  useEffect(() => {
    api
      .get("/users")
      .then((r) => setUsers(r.data.users))
      .catch((e) => toast.error(errorMessage(e)));
    const before = document.activeElement;
    modalRef.current?.focus();
    const handler = (e) => {
      if (e.key === "Escape" && !busy) onClose();
      if (e.key === "Tab") {
        const items = modalRef.current.querySelectorAll(
          'button,input,textarea,select,[tabindex="0"]',
        );
        const first = items[0],
          last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = old;
      before?.focus();
    };
  }, [onClose, busy]);
  const change = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    if (await onSave(form, task?._id)) onClose();
    setBusy(false);
  }
  async function del() {
    setBusy(true);
    if (await onDelete(task._id)) onClose();
    setBusy(false);
  }
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <section
        className="modal"
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <header>
          <div>
            <span className="eyebrow">TASK WORKSPACE</span>
            <h2 id="modal-title">
              {editing
                ? task
                  ? "Edit task"
                  : "Create a new task"
                : "Task details"}
            </h2>
          </div>
          <button
            className="icon-button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </header>
        {editing ? (
          <form onSubmit={submit}>
            <label>
              Task title
              <input
                name="title"
                value={form.title}
                onChange={change}
                required
                maxLength={120}
                placeholder="What needs to get done?"
                autoFocus
              />
            </label>
            <label>
              Description
              <textarea
                name="description"
                rows={4}
                value={form.description}
                onChange={change}
                maxLength={4000}
                placeholder="Add some context for your team..."
              />
            </label>
            <div className="form-grid">
              <label>
                Priority
                <select
                  aria-label="Priority"
                  name="priority"
                  value={form.priority}
                  onChange={change}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>
              <label>
                Status
                <select
                  aria-label="Status"
                  name="status"
                  value={form.status}
                  onChange={change}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In progress</option>
                  <option value="completed">Completed</option>
                </select>
              </label>
              <label>
                Due date
                <input
                  type="date"
                  name="dueDate"
                  value={form.dueDate}
                  onChange={change}
                  required
                />
              </label>
              <label>
                Assigned to
                <select
                  aria-label="Assigned to"
                  name="assignedUser"
                  value={form.assignedUser}
                  onChange={change}
                  required
                >
                  {!users.length && (
                    <option value={user.id}>{user.name}</option>
                  )}
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <footer>
              <button
                type="button"
                className="button secondary"
                onClick={onClose}
                disabled={busy}
              >
                Cancel
              </button>
              <button className="button primary" disabled={busy}>
                {busy ? <LoaderCircle className="spin" size={17} /> : null}
                {task ? "Save changes" : "Create task"}
              </button>
            </footer>
          </form>
        ) : (
          <>
            <div className="detail-title">
              <span className={`priority ${task.priority}`}>
                <i />
                {task.priority}
              </span>
              <span className={`status ${task.status}`}>
                {statusLabel(task.status)}
              </span>
            </div>
            <h3 className="text-xl font-semibold my-4">{task.title}</h3>
            <p className="detail-description">
              {task.description || "No description added."}
            </p>
            <dl className="detail-grid">
              <div>
                <dt>Assigned to</dt>
                <dd>{task.assignedUser?.name}</dd>
              </div>
              <div>
                <dt>Due date</dt>
                <dd>{formatDate(task.dueDate)}</dd>
              </div>
              <div>
                <dt>Created by</dt>
                <dd>{task.createdBy?.name}</dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>{formatDate(task.createdAt)}</dd>
              </div>
            </dl>
            {canEdit && (
              <footer>
                {confirm ? (
                  <>
                    <span className="text-sm">
                      Delete this task permanently?
                    </span>
                    <button
                      className="button danger"
                      onClick={del}
                      disabled={busy}
                    >
                      Delete
                    </button>
                    <button
                      className="button secondary"
                      onClick={() => setConfirm(false)}
                    >
                      Keep task
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="button danger-outline"
                      onClick={() => setConfirm(true)}
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                    <button
                      className="button primary"
                      onClick={() => setEditing(true)}
                    >
                      <Pencil size={16} />
                      Edit task
                    </button>
                  </>
                )}
              </footer>
            )}
          </>
        )}
      </section>
    </div>
  );
}
