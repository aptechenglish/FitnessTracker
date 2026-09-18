import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Icon from "../components/Icon";
import toast from "react-hot-toast";
import { getSettings, updateSettings } from "../services/settings";
import { updateProfile } from "../services/auth";
import { useAuth } from "../context/AuthContext";
import { fileToResizedDataUrl } from "../utils/image";

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
  const { user, updateUser } = useAuth();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profileForm, setProfileForm] = useState({
    gender: "",
    dateOfBirth: "",
    weight: "",
    height: "",
  });
  const [profilePic, setProfilePic] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        gender: user.gender || "",
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
        weight: user.weight !== undefined && user.weight !== null ? String(user.weight) : "",
        height: user.height !== undefined && user.height !== null ? String(user.height) : "",
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handlePicUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Please choose an image smaller than 5MB");
      return;
    }
    try {
      const dataUrl = await fileToResizedDataUrl(file);
      setProfilePic(dataUrl);
    } catch {
      toast.error("Could not read that image. Please choose another one.");
    }
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const payload = {
        gender: profileForm.gender,
        dateOfBirth: profileForm.dateOfBirth || "",
        weight: profileForm.weight ? Number(profileForm.weight) : undefined,
        height: profileForm.height ? Number(profileForm.height) : undefined,
      };
      if (profilePic) payload.profilePicture = profilePic;
      const res = await updateProfile(payload);
      const updated = res.data?.user || res.data || payload;
      updateUser({ ...user, ...updated });
      setProfilePic(null);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

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
          <p className="text-gray-600 mt-1">Manage your profile, preferences, units and theme</p>
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

          {/* Personal Information */}
          <section className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
              <Icon name="profile" className="w-6 h-6 text-gray-500" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                <p className="text-sm text-gray-500">Gender, date of birth, weight and height</p>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  name="gender"
                  value={profileForm.gender}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={profileForm.dateOfBirth}
                  onChange={handleProfileChange}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight ({settings.units.weight === "lb" ? "lb" : "kg"})
                </label>
                <input
                  type="number"
                  name="weight"
                  value={profileForm.weight}
                  onChange={handleProfileChange}
                  placeholder="e.g. 70"
                  min="1"
                  max="500"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Height ({settings.units.height === "in" ? "in" : "cm"})
                </label>
                <input
                  type="number"
                  name="height"
                  value={profileForm.height}
                  onChange={handleProfileChange}
                  placeholder="e.g. 175"
                  min="1"
                  max="300"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </section>

          {/* Profile Picture */}
          <section className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
              <Icon name="message" className="w-6 h-6 text-gray-500" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Profile Picture</h2>
                <p className="text-sm text-gray-500">Upload a photo of yourself</p>
              </div>
            </div>
            <div className="p-6 flex items-center gap-6">
              {profilePic || user?.profilePicture ? (
                <img
                  src={profilePic || user.profilePicture}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-indigo-100"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-4xl font-bold">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
              )}
              <div className="flex-1">
                <label className="inline-flex items-center gap-2 cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-semibold transition">
                  <Icon name="sparkles" className="w-4 h-4" />
                  {profilePic ? "Choose Another Photo" : "Upload Photo"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePicUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-sm text-gray-500 mt-2">JPG, PNG or GIF — max 5MB</p>
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

        <div className="mt-8 flex flex-wrap justify-end gap-3">
          <button
            onClick={saveProfile}
            disabled={savingProfile}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {savingProfile ? "Saving Profile..." : "Save Profile Info"}
          </button>
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