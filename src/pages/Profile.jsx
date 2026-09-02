import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import Icon from "../components/Icon";

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const form = {
    name: user?.name || "",
    username: user?.username || "",
    email: user?.email || "",
    gender: user?.gender || "",
    height: user?.height || "",
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
    fitnessGoal: user?.fitnessGoal || "general_fitness",
    profilePicture: user?.profilePicture || "",
  };

  const goals = [
    { value: "lose_weight", label: "Lose Weight", icon: "activity" },
    { value: "gain_muscle", label: "Gain Muscle", icon: "workouts" },
    { value: "maintain", label: "Maintain", icon: "goals" },
    { value: "improve_endurance", label: "Endurance", icon: "progress" },
    { value: "general_fitness", label: "General Fitness", icon: "sparkles" },
  ];

  const getGoal = (value) =>
    goals.find((g) => g.value === value) || goals[goals.length - 1];

  return (
    <Sidebar>
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-1">Manage your personal information</p>
          </div>
          <button
            onClick={() => navigate("/profile/edit")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-semibold transition"
          >
            Edit Profile
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8">
              <div className="flex items-center space-x-6">
                {form.profilePicture ? (
                  <img
                    src={form.profilePicture}
                    alt="Profile"
                    className="w-24 h-24 rounded-full border-4 border-white object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-white/20 border-4 border-white flex items-center justify-center text-4xl font-bold text-white">
                    {form.name ? form.name.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-white">{form.name}</h2>
                  <p className="text-white/80">@{form.username}</p>
                  <span className="inline-flex items-center gap-1.5 mt-2 bg-white/20 text-white text-sm px-3 py-1 rounded-full">
                    <Icon name={getGoal(form.fitnessGoal).icon} className="w-4 h-4" />
                    {getGoal(form.fitnessGoal).label}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                <Icon name="message" className="w-7 h-7 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-800">{form.email || "Not set"}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                <Icon name="profile" className="w-7 h-7 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium text-gray-800 capitalize">
                    {form.gender ? form.gender : "Not set"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                <Icon name="sparkles" className="w-7 h-7 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Height</p>
                  <p className="font-medium text-gray-800">
                    {form.height ? `${form.height} cm` : "Not set"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                <Icon name="calendar" className="w-7 h-7 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-medium text-gray-800">
                    {form.dateOfBirth ? form.dateOfBirth : "Not set"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
    </Sidebar>
  );
};

export default Profile;
