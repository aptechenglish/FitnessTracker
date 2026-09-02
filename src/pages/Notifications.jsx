import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../services/notifications";
import Sidebar from "../components/Sidebar";
import Icon from "../components/Icon";
import toast from "react-hot-toast";

const TYPE_META = {
  workout: { icon: "workouts", color: "bg-indigo-100 text-indigo-700" },
  goal: { icon: "goals", color: "bg-emerald-100 text-emerald-700" },
  follower: { icon: "users", color: "bg-blue-100 text-blue-700" },
  forum: { icon: "message", color: "bg-purple-100 text-purple-700" },
  reminder: { icon: "reminders", color: "bg-yellow-100 text-yellow-700" },
  system: { icon: "notifications", color: "bg-gray-100 text-gray-700" },
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getNotifications();
      setNotifications(res.data);
    } catch (error) {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    } catch (error) {}
  };

  const handleReadAll = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("All marked as read");
    } catch (error) {
      toast.error("Failed to update");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      toast.success("Notification deleted");
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const fmtTime = (d) =>
    new Date(d).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <Sidebar>
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-1">
              {unread > 0 ? `${unread} unread notifications` : "You're all caught up"}
            </p>
          </div>
          <button
            onClick={handleReadAll}
            disabled={unread === 0}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg font-medium text-sm transition"
          >
            Mark all as read
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
            <Icon name="notifications" className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No notifications yet</h3>
            <p className="text-gray-500">
              Complete workouts and hit goals to receive notifications here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => {
              const meta = TYPE_META[n.type] || TYPE_META.system;
              return (
                <div
                  key={n._id}
                  className={`bg-white rounded-2xl border-l-4 shadow-sm hover:shadow-md transition ${
                    n.read
                      ? "border-l-gray-200 opacity-70"
                      : "border-l-indigo-500 bg-indigo-50/50"
                  }`}
                  onClick={() => !n.read && handleRead(n._id)}
                >
                  <div className="p-5 flex items-start gap-4 cursor-pointer">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${meta.color}`}>
                      <Icon name={n.icon || meta.icon} className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-gray-900">{n.title}</h3>
                        <span className="text-xs text-gray-400 shrink-0">{fmtTime(n.createdAt)}</span>
                      </div>
                      {n.message && <p className="text-sm text-gray-600 mt-1">{n.message}</p>}
                      <div className="flex items-center justify-between mt-3">
                        {n.link ? (
                          <Link
                            to={n.link}
                            className="text-xs font-medium text-indigo-600 hover:underline inline-flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View <Icon name="arrowRight" className="w-3.5 h-3.5" />
                          </Link>
                        ) : (
                          <span></span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(n._id);
                          }}
                          className="text-xs text-red-500 hover:text-red-700 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    {!n.read && (
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0 mt-2"></span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </Sidebar>
  );
};

export default Notifications;