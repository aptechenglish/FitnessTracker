import { useState, useEffect, useCallback } from "react";
import {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
} from "../services/reminders";
import Sidebar from "../components/Sidebar";
import Icon from "../components/Icon";
import toast from "react-hot-toast";

const TYPE_META = {
  workout: { icon: "workouts", label: "Workout", color: "bg-indigo-100 text-indigo-700" },
  meal: { icon: "utensils", label: "Meal", color: "bg-emerald-100 text-emerald-700" },
  goal: { icon: "goals", label: "Fitness Goal", color: "bg-blue-100 text-blue-700" },
  water: { icon: "droplet", label: "Water", color: "bg-cyan-100 text-cyan-700" },
  sleep: { icon: "moon", label: "Sleep", color: "bg-purple-100 text-purple-700" },
  custom: { icon: "reminders", label: "Custom", color: "bg-yellow-100 text-yellow-700" },
};

const DAYS = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 7, label: "Sun" },
];

const emptyReminder = () => ({
  type: "workout",
  title: "",
  message: "",
  time: "07:00",
  days: [1, 2, 3, 4, 5, 6, 7],
  active: true,
});

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyReminder());
  const [saving, setSaving] = useState(false);
  const [perms, setPerms] = useState(Notification.permission);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getReminders();
      setReminders(res.data);
    } catch (error) {
      toast.error("Failed to load reminders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      toast.error("This browser doesn't support notifications");
      return;
    }
    const p = await Notification.requestPermission();
    setPerms(p);
    if (p === "granted") toast.success("Notifications enabled!");
    else toast.error("Notification permission denied");
  };

  const openAdd = () => {
    setEditing(null);
    setForm(emptyReminder());
    setShowModal(true);
  };

  const openEdit = (r) => {
    setEditing(r._id);
    setForm({
      type: r.type,
      title: r.title,
      message: r.message,
      time: r.time,
      days: r.days,
      active: r.active,
    });
    setShowModal(true);
  };

  const toggleDay = (day) => {
    setForm({
      ...form,
      days: form.days.includes(day)
        ? form.days.filter((d) => d !== day)
        : [...form.days, day],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.time) {
      toast.error("Title and time are required");
      return;
    }
    if (form.days.length === 0) {
      toast.error("Select at least one day");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updateReminder(editing, form);
        toast.success("Reminder updated!");
      } else {
        await createReminder(form);
        toast.success("Reminder created!");
      }
      setShowModal(false);
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save reminder");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this reminder?")) return;
    try {
      await deleteReminder(id);
      toast.success("Reminder deleted");
      load();
    } catch (error) {
      toast.error("Failed to delete reminder");
    }
  };

  const toggleActive = async (r) => {
    try {
      await updateReminder(r._id, { active: !r.active });
      load();
    } catch (error) {
      toast.error("Failed to update");
    }
  };

  const dayLabels = (days = []) => {
    const map = { 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat", 7: "Sun" };
    return days.includes(5) && days.includes(6) && days.includes(7) ? "Weekend" : days.map((d) => map[d]).join(" · ");
  };

  return (
    <Sidebar>
      <main className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reminders</h1>
            <p className="text-gray-600 mt-1">Schedule workout, meal & goal reminders</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={requestPermission}
              className={`px-5 py-2.5 rounded-lg font-medium text-sm transition ${
                perms === "granted"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              }`}
            >
              {perms === "granted" ? (
                <span className="inline-flex items-center gap-1.5"><Icon name="check" className="w-4 h-4" /> Notifications On</span>
              ) : (
                <span className="inline-flex items-center gap-1.5"><Icon name="notifications" className="w-4 h-4" /> Enable Notifications</span>
              )}
            </button>
            <button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-semibold transition"
            >
              + Add Reminder
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : reminders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
            <Icon name="reminders" className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No reminders set</h3>
            <p className="text-gray-500 mb-6">Create reminders for workouts, meals and goals so you never miss them</p>
            <button onClick={openAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition">
              Create Reminder
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reminders.map((r) => {
              const meta = TYPE_META[r.type] || TYPE_META.custom;
              return (
                <div
                  key={r._id}
                  className={`bg-white rounded-2xl shadow-lg p-6 transition ${
                    r.active ? "" : "opacity-50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center ${meta.color}`}>
                      <Icon name={meta.icon} className="w-6 h-6" />
                    </div>
                    <button
                      onClick={() => toggleActive(r)}
                      className={`relative w-11 h-6 rounded-full transition ${
                        r.active ? "bg-indigo-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`toggle-knob absolute top-0.5 w-5 h-5 rounded-full transition-all ${
                          r.active ? "left-5" : "left-0.5"
                        }`}
                      ></span>
                    </button>
                  </div>
                  <h3 className="font-semibold text-gray-900">{r.title}</h3>
                  {r.message && <p className="text-sm text-gray-600 mt-1">{r.message}</p>}
                  <div className="flex items-center gap-2 mt-4">
                    <Icon name="reminders" className="w-6 h-6 text-indigo-500" />
                    <span className="text-lg font-bold text-indigo-600">{r.time}</span>
                    <span className="text-xs text-gray-500">{meta.label}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{dayLabels(r.days)}</p>
                  <div className="flex gap-3 mt-4 border-t pt-4">
                    <button
                      onClick={() => openEdit(r)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(r._id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4 flex justify-between items-center sticky top-0">
              <h2 className="text-xl font-bold text-white">
                {editing ? "Edit Reminder" : "Add Reminder"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-white text-2xl hover:text-gray-200"><Icon name="x" className="w-6 h-6" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {Object.entries(TYPE_META).map(([value, m]) => (
                    <option key={value} value={value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder={
                    form.type === "workout"
                      ? "e.g. Evening Workout"
                      : form.type === "meal"
                      ? "e.g. Lunch Break"
                      : form.type === "goal"
                      ? "e.g. Daily Steps Goal"
                      : "e.g. Take a walk"
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <input
                  type="text"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Optional reminder note"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Repeat on</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => toggleDay(d.value)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition border ${
                        form.days.includes(d.value)
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : editing ? "Save Changes" : "Add Reminder"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Sidebar>
  );
};

export default Reminders;