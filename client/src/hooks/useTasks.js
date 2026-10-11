import { useState, useEffect, useCallback } from "react";
import { api, errorMessage } from "../services/api";
import toast from "react-hot-toast";
export function useTasks(filters) {
  const [data, setData] = useState({
    tasks: [],
    total: 0,
    pages: 1,
    stats: { total: 0, pending: 0, "in-progress": 0, completed: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision((r) => r + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    api
      .get("/tasks", { params: filters, signal: controller.signal })
      .then((r) => setData(r.data))
      .catch((e) => {
        if (e.code !== "ERR_CANCELED") setError(errorMessage(e));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [filters, revision]);
  const save = useCallback(
    async (task, id) => {
      try {
        await (id ? api.put(`/tasks/${id}`, task) : api.post("/tasks", task));
        toast.success(id ? "Task updated" : "Task created");
        refresh();
        return true;
      } catch (e) {
        toast.error(errorMessage(e));
        return false;
      }
    },
    [refresh],
  );
  const remove = useCallback(
    async (id) => {
      try {
        await api.delete(`/tasks/${id}`);
        toast.success("Task deleted");
        refresh();
        return true;
      } catch (e) {
        toast.error(errorMessage(e));
        return false;
      }
    },
    [refresh],
  );
  return { ...data, loading, error, refresh, save, remove };
}
