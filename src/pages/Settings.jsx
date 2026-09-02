import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Icon from "../components/Icon";
import toast from "react-hot-toast";
import { getSettings, updateSettings } from "../services/settings";

const DEFAULT_SETTINGS = {
  notificationPreferences: {
    email: true,
    workoutReminders: true,
    mealReminders: true,
    goalAchievements: true,
  },
  units: {
    weight: "kg",
    height: "cm",
  },
  theme: "dark",
};

const NotificationToggle = ({ label, desc, checked, onChange }) => (
  <div className="flex items-start justify-between gap-4 py-4 border-b border-gray-100 last:border-0">
    <div>
      <p className="font-medium text-gray-800">{label}</p>
      {desc && <p className="text-sm text-gray-500 mt-0.5">{desc}</p>}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-6 shrink-0 rounded-full transition ${
        checked ? "bg-indigo-600" : "bg-gray-300"
      }`}
    >
      <span
        className={`toggle-knob absolute top-0.5 w-5 h-5 rounded-full shadow transition-all ${
          checked ? "left-6" : "left-0.5"
        }`}
      ></span>
    </button>
  </div>
);

const OptionCard = ({ active, onClick, icon, label, unit }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 transition text-left ${
      active
        ? "border-indigo-600 bg-indigo-50"
        : "border-gray-200 bg-white hover:border-gray-300"
    }`}
  >
    <Icon name={icon} className="w-6 h-6 text-gray-600" />
    <div>
      <p className="font-semibold text-gray-800">{label}</p>
      <p className="text-sm text-gray-500">{unit}</p>
    </div>
    {active && <Icon name="check" className="ml-auto w-5 h-5 text-indigo-600" />}
  </button>
);

const Settings = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getSettings();
        setSettings(res.data);
      } catch (error) {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const setPref = (key, value) => {
    setSettings({
      ...settings,
      notificationPreferences: {
        ...settings.notificationPreferences,
        [key]: value,
      },
    });
  };

  const setUnit = (key, value) => {
    const units = { ...settings.units, [key]: value };
    setSettings({ ...settings, units });
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      await updateSettings({
        notificationPreferences: settings.notificationPreferences,
        units: settings.units,
      });
      toast.success("Settings saved!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Sidebar>
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your preferences, units and theme</p>
        </div>

        <div className="space-y-6">
          {/* Theme - Fixed Dark */}
          <section className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
              <Icon name="sparkles" className="w-6 h-6 text-gray-500" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Theme</h2>
                <p className="text-sm text-gray-500">Dark theme is always active</p>
              </div>
            </div>
            <div className="p-6 flex items-center gap-4">
              <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-indigo-600 bg-indigo-50 flex-1">
                <Icon name="moon" className="w-6 h-6 text-indigo-600" />
                <div>
                  <p className="font-semibold text-gray-800">Dark</p>
                  <p className="text-sm text-gray-500">Easy on the eyes</p>
                </div>
                <Icon name="check" className="ml-auto w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </section>

          {/* Units */}
          <section className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
              <Icon name="scale" className="w-6 h-6 text-gray-500" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Units</h2>
                <p className="text-sm text-gray-500">Set your preferred measurement units</p>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <p className="font-medium text-gray-800 mb-3">Weight</p>
                <div className="flex gap-4">
                  <OptionCard
                    active={settings.units.weight === "kg"}
                    onClick={() => setUnit("weight", "kg")}
                    icon="scale"
                    label="Kilograms"
                    unit="kg"
                  />
                  <OptionCard
                    active={settings.units.weight === "lb"}
                    onClick={() => setUnit("weight", "lb")}
                    icon="workouts"
                    label="Pounds"
                    unit="lb"
                  />
                </div>
              </div>
              <div>
                <p className="font-medium text-gray-800 mb-3">Height</p>
                <div className="flex gap-4">
                  <OptionCard
                    active={settings.units.height === "cm"}
                    onClick={() => setUnit("height", "cm")}
                    icon="sparkles"
                    label="Centimeters"
                    unit="cm"
                  />
                  <OptionCard
                    active={settings.units.height === "in"}
                    onClick={() => setUnit("height", "in")}
                    icon="scale"
                    label="Inches"
                    unit="in"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
              <Icon name="notifications" className="w-6 h-6 text-gray-500" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
                <p className="text-sm text-gray-500">Choose what notifications you receive</p>
              </div>
            </div>
            <div className="px-6">
              <NotificationToggle
                label="Email Notifications"
                desc="Receive updates via email"
                checked={settings.notificationPreferences.email}
                onChange={(v) => setPref("email", v)}
              />
              <NotificationToggle
                label="Workout Reminders"
                desc="Get reminded about your workouts"
                checked={settings.notificationPreferences.workoutReminders}
                onChange={(v) => setPref("workoutReminders", v)}
              />
              <NotificationToggle
                label="Meal Reminders"
                desc="Reminders for breakfast, lunch & dinner"
                checked={settings.notificationPreferences.mealReminders}
                onChange={(v) => setPref("mealReminders", v)}
              />
              <NotificationToggle
                label="Goal Achievements"
                desc="Know when you hit a fitness goal or PR"
                checked={settings.notificationPreferences.goalAchievements}
                onChange={(v) => setPref("goalAchievements", v)}
              />
            </div>
          </section>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={saveAll}
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </main>
    </Sidebar>
  );
};

export default Settings;