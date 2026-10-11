import { useState, useMemo, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import {
  Plus,
  Search,
  SlidersHorizontal,
  ArrowUpRight,
  Layers,
  Clock3,
  CheckCircle2,
  Activity,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Inbox,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  Cell,
} from "recharts";
import { useTasks } from "../hooks/useTasks";
import { useDebounce } from "../hooks/useDebounce";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";
export default function Dashboard() {
  const all = useLocation().pathname === "/tasks";
  const user = useSelector((s) => s.auth.user);
  const [search, setSearch] = useState(""),
    [status, setStatus] = useState(""),
    [priority, setPriority] = useState(""),
    [sort, setSort] = useState("due"),
    [page, setPage] = useState(1),
    [view, setView] = useState("grid"),
    [selected, setSelected] = useState(null);
  const debounced = useDebounce(search);
  const filters = useMemo(
    () => ({ search: debounced, status, priority, sort, page, limit: 6 }),
    [debounced, status, priority, sort, page],
  );
  const data = useTasks(filters);
  useEffect(() => setPage(1), [debounced, status, priority, sort]);
  useEffect(() => {
    if (!data.loading && page > data.pages) setPage(data.pages);
  }, [data.loading, data.pages, page]);
  const open = useCallback((t) => setSelected({ task: t, mode: "view" }), []);
  const close = useCallback(() => setSelected(null), []);
  const chart = useMemo(
    () => [
      { name: "Pending", value: data.stats.pending, fill: "#c4b49e" },
      {
        name: "In progress",
        value: data.stats["in-progress"],
        fill: "#8797c0",
      },
      { name: "Completed", value: data.stats.completed, fill: "#73a89a" },
    ],
    [data.stats],
  );
  const pct = data.stats.total
    ? Math.round((data.stats.completed / data.stats.total) * 100)
    : 0;
  const date = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">{date.toUpperCase()}</span>
          <h1>
            {all
              ? "All your tasks."
              : `Good to see you, ${user.name.split(" ")[0]}.`}
          </h1>
          <p>
            {all
              ? "A clear view of what needs doing, and who is doing it."
              : "Let's make a little progress today."}
          </p>
        </div>
        <button
          className="button primary"
          onClick={() => setSelected({ mode: "create" })}
        >
          <Plus size={18} />
          New task
        </button>
      </div>
      <div className="stats-grid">
        {[
          ["total", "Total tasks", Layers, "All the work in one place"],
          ["pending", "Pending", Clock3, "Ready when you are"],
          ["in-progress", "In progress", Activity, "Moving things forward"],
          ["completed", "Completed", CheckCircle2, "Good work, done"],
        ].map(([key, label, Icon, hint]) => (
          <div key={key} className={`stat-card stat-${key}`}>
            <div>
              <span>{label}</span>
              <span className="stat-icon">
                <Icon size={19} />
              </span>
            </div>
            <strong>{data.loading ? "·" : data.stats[key]}</strong>
            <p>{hint}</p>
          </div>
        ))}
      </div>
      {!all && (
        <div className="overview-grid">
          <section className="progress-panel">
            <div>
              <span className="eyebrow">THE BIG PICTURE</span>
              <h2>Small steps. Real progress.</h2>
              <p>
                {data.stats.total
                  ? `${data.stats.completed} of ${data.stats.total} tasks complete. Keep your momentum going.`
                  : "Your next chapter starts with your first task."}
              </p>
              <div className="progress-line">
                <span style={{ width: `${pct}%` }} />
              </div>
              <div className="progress-caption">
                <span>Workspace completion</span>
                <strong>{pct}%</strong>
              </div>
            </div>
            <div className="progress-art" aria-hidden="true">
              <div className="orbit one" />
              <div className="orbit two" />
              <div className="art-center">
                <CheckCircle2 size={38} strokeWidth={1.3} />
              </div>
              <span className="art-dot a" />
              <span className="art-dot b" />
            </div>
          </section>
          <section className="chart-panel">
            <h3>Work at a glance</h3>
            <p>Tasks by status</p>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={110}>
                <BarChart
                  data={chart}
                  margin={{ top: 8, right: 12, left: 12, bottom: 0 }}
                >
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#777" }}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{ borderRadius: 10, fontSize: 12 }}
                  />
                  <Bar
                    isAnimationActive={false}
                    dataKey="value"
                    radius={[5, 5, 0, 0]}
                    barSize={30}
                  >
                    {chart.map((c) => (
                      <Cell key={c.name} fill={c.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      )}
      <section className="tasks-section">
        <div className="section-heading">
          <div>
            <h2>
              {all ? "Task workspace" : "Your task workspace"}
              <span className="count-badge">{data.total}</span>
            </h2>
            <p>Keep the details clear. Let the work flow.</p>
          </div>
          <div className="view-toggle">
            <button
              onClick={() => setView("grid")}
              className={view === "grid" ? "selected" : ""}
              aria-label="Grid view"
              aria-pressed={view === "grid"}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setView("list")}
              className={view === "list" ? "selected" : ""}
              aria-label="List view"
              aria-pressed={view === "list"}
            >
              <List size={17} />
            </button>
          </div>
        </div>
        <div className="filters">
          <div className="search-field">
            <Search size={17} />
            <input
              aria-label="Search tasks by title"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button aria-label="Clear search" onClick={() => setSearch("")}>
                ×
              </button>
            )}
          </div>
          <select
            aria-label="Filter by status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In progress</option>
            <option value="completed">Completed</option>
          </select>
          <select
            aria-label="Filter by priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="">All priorities</option>
            <option value="high">High priority</option>
            <option value="medium">Medium priority</option>
            <option value="low">Low priority</option>
          </select>
          <select
            aria-label="Sort tasks"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="due">Due date: soonest</option>
            <option value="newest">Newest first</option>
            <option value="oldest">Due date: oldest</option>
          </select>
          {(search || status || priority) && (
            <button
              className="clear-filters"
              onClick={() => {
                setSearch("");
                setStatus("");
                setPriority("");
              }}
            >
              Reset
            </button>
          )}
        </div>
        {data.error ? (
          <div className="empty-state">
            <RefreshCw size={32} />
            <h3>Let's try that again.</h3>
            <p>{data.error}</p>
            <button className="button secondary" onClick={data.refresh}>
              Retry
            </button>
          </div>
        ) : data.loading ? (
          <div className="task-grid" aria-label="Loading tasks">
            {Array.from({ length: 6 }, (_, i) => (
              <div className="skeleton-card" key={i}>
                <div />
                <div />
                <div />
              </div>
            ))}
          </div>
        ) : data.tasks.length ? (
          <div className={`task-grid ${view === "list" ? "list-view" : ""}`}>
            {data.tasks.map((t) => (
              <TaskCard key={t._id} task={t} onOpen={open} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Inbox size={38} strokeWidth={1.4} />
            <h3>
              {search || status || priority
                ? "No tasks match your filters."
                : "A little space for something good."}
            </h3>
            <p>
              {search || status || priority
                ? "Try a different search or reset your filters."
                : "Create your first task and get things moving."}
            </p>
            <button
              className="button secondary"
              onClick={() => {
                if (search || status || priority) {
                  setSearch("");
                  setStatus("");
                  setPriority("");
                } else setSelected({ mode: "create" });
              }}
            >
              {search || status || priority ? "Reset filters" : "Create a task"}
            </button>
          </div>
        )}
        <div className="pagination">
          <span>
            {data.total
              ? `${(page - 1) * 6 + 1}-${Math.min(page * 6, data.total)} of ${data.total} tasks`
              : "0 tasks"}
          </span>
          <div>
            <button
              className="icon-button"
              onClick={() => setPage((p) => p - 1)}
              disabled={page <= 1 || data.loading}
              aria-label="Previous page"
            >
              <ChevronLeft size={17} />
            </button>
            <span>
              Page {page} of {data.pages}
            </span>
            <button
              className="icon-button"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= data.pages || data.loading}
              aria-label="Next page"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </section>
      {selected && (
        <TaskModal
          {...selected}
          user={user}
          onClose={close}
          onSave={data.save}
          onDelete={data.remove}
        />
      )}
    </>
  );
}
