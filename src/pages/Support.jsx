import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Icon from "../components/Icon";
import toast from "react-hot-toast";
import {
  getSupportMeta,
  getContactInfo,
  submitSupport,
  getMyTickets,
} from "../services/support";

const TABS = [
  { type: "contact", label: "Contact Support", icon: "support" },
  { type: "issue", label: "Report Issue", icon: "reports" },
  { type: "feedback", label: "Send Feedback", icon: "message" },
];

const DEFAULT_META = {
  contact: { labels: ["general", "partnership", "billing", "account"] },
  issue: { labels: ["bug", "login", "data", "crash", "performance", "other"] },
  feedback: { labels: ["feature", "improvement", "praise", "other"] },
};

const ALLOWED_TYPES = ["contact", "issue", "feedback"];

const Support = () => {
  const [tab, setTab] = useState("contact");
  const [contactInfo, setContactInfo] = useState({});
  const [meta, setMeta] = useState(DEFAULT_META);
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({ subject: "", message: "", category: "" });
  const [sending, setSending] = useState(false);
  const [showTickets, setShowTickets] = useState(false);

  useEffect(() => {
    Promise.all([
      getContactInfo(),
      getSupportMeta(),
      getMyTickets(),
    ])
      .then(([info, m, t]) => {
        setContactInfo(info.data);
        if (m.data) setMeta(m.data);
        setTickets(t.data);
      })
      .catch(() => toast.error("Failed to load support info"));
  }, []);

  const switchTab = (t) => {
    if (!ALLOWED_TYPES.includes(t)) return;
    setTab(t);
    setForm({ subject: "", message: "", category: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) {
      toast.error("Please fill in subject and message");
      return;
    }
    setSending(true);
    try {
      const res = await submitSupport({
        type: tab,
        subject: form.subject,
        message: form.message,
        category: form.category,
      });
      toast.success(
        tab === "issue"
          ? "Issue reported! Our team will look into it."
          : tab === "feedback"
          ? "Thanks for your feedback!"
          : "Message sent! We'll get back to you."
      );
      setForm({ subject: "", message: "", category: "" });
      setTickets((prev) => [res.data, ...prev]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send");
    } finally {
      setSending(false);
    }
  };

  const categories = meta[tab]?.labels || DEFAULT_META[tab]?.labels || [];

  const STATUS_STYLE = {
    open: "bg-yellow-100 text-yellow-700",
    in_progress: "bg-blue-100 text-blue-700",
    resolved: "bg-green-100 text-green-700",
    closed: "bg-gray-200 text-gray-600",
  };

  const TYPE_ICON = { contact: "support", issue: "reports", feedback: "message" };

  return (
    <Sidebar>
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Support & Feedback</h1>
          <p className="text-gray-600 mt-1">
            Need help? Contact our support team, report a bug, or share your feedback
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-lg p-2 flex flex-col sm:flex-row gap-2">
            {TABS.map((t) => (
              <button
                key={t.type}
                onClick={() => switchTab(t.type)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition ${
                  tab === t.type
                    ? "bg-indigo-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                                <Icon name={t.icon} className="w-5 h-5" />
                {t.label}
              </button>
            ))}
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Icon name={TABS.find((t) => t.type === tab)?.icon} className="w-5 h-5 text-gray-500" />
                {TABS.find((t) => t.type === tab)?.label}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select category (optional)</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder={
                      tab === "issue"
                        ? "Briefly describe the problem"
                        : tab === "feedback"
                        ? "What would you like to share?"
                        : "How can we help?"
                    }
                    maxLength={200}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message *
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={5}
                  maxLength={2000}
                  placeholder={
                    tab === "issue"
                      ? "Describe what happened, steps to reproduce, and what you expected..."
                      : tab === "feedback"
                      ? "Tell us what you like or how we can improve..."
                      : "Write your message here..."
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                ></textarea>
                <p className="text-xs text-gray-400 mt-1 text-right">{form.message.length}/2000</p>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={sending}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {sending ? "Sending..." : "Submit"}
                </button>
              </div>
            </form>
          </div>

          {/* Contact info */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><Icon name="support" className="w-5 h-5 text-gray-500" /> Contact Information</h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500">Email</p>
                <a href={`mailto:${contactInfo.email}`} className="font-semibold text-indigo-600 break-all">
                  {contactInfo.email}
                </a>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-semibold text-gray-800">{contactInfo.phone}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500">Support Hours</p>
                <p className="font-semibold text-gray-800">{contactInfo.hours}</p>
              </div>
            </div>
          </div>

          {/* Tickets */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <button
              onClick={() => setShowTickets(!showTickets)}
              className="px-6 py-5 border-b border-gray-100 flex items-center justify-between w-full"
            >
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><Icon name="reminders" className="w-5 h-5 text-gray-500" /> My Requests</h2>
              <span className="text-gray-400 transition-transform">{showTickets ? "−" : "+"}</span>
            </button>
            {showTickets && (
              <div className="divide-y divide-gray-100">
                {tickets.length === 0 ? (
                  <p className="p-6 text-gray-500 text-center">No requests submitted yet.</p>
                ) : (
                  tickets.map((t) => (
                    <div key={t._id} className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl"><Icon name={TYPE_ICON[t.type]} className="w-6 h-6 text-gray-500" /></span>
                          <div>
                            <p className="font-semibold text-gray-900">{t.subject}</p>
                            <p className="text-sm text-gray-500">
                              {t.category ? `${t.category.charAt(0).toUpperCase()}${t.category.slice(1)} · ` : ""}
                              {new Date(t.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            STATUS_STYLE[t.status] || STATUS_STYLE.open
                          }`}
                        >
                          {t.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-3 whitespace-pre-wrap">{t.message}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </Sidebar>
  );
};

export default Support;