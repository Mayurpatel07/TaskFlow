import { memo } from "react";
import { CalendarDays, ArrowUpRight, MoreHorizontal } from "lucide-react";
import { formatDate, initials, statusLabel } from "../utils/format";
export default memo(function TaskCard({ task, onOpen }) {
  const overdue =
    new Date(task.dueDate) < new Date(new Date().toDateString()) &&
    task.status !== "completed";
  return (
    <button
      className="task-card"
      onClick={() => onOpen(task)}
      aria-label={`View ${task.title}`}
    >
      <div className="flex items-center justify-between">
        <span className={`priority ${task.priority}`}>
          <i />
          {task.priority}
        </span>
        <MoreHorizontal size={19} />
      </div>
      <h3>{task.title}</h3>
      <p>{task.description || "No description yet."}</p>
      <span className={`status ${task.status}`}>
        {statusLabel(task.status)}
      </span>
      <div className="task-footer">
        <span className={overdue ? "overdue" : ""}>
          <CalendarDays size={14} />
          {formatDate(task.dueDate)}
          {overdue ? " · overdue" : ""}
        </span>
        <span className="avatar" title={task.assignedUser?.name}>
          {initials(task.assignedUser?.name)}
        </span>
      </div>
    </button>
  );
});
