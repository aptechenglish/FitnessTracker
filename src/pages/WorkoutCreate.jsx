import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Icon from "../components/Icon";
import WorkoutForm, { emptyWorkout } from "../components/WorkoutForm";
import toast from "react-hot-toast";
import { createWorkout } from "../services/workouts";
import { notifySuccess } from "../components/AppToast";

const WorkoutCreate = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (payload) => {
    setSaving(true);
    try {
      await createWorkout(payload);
      const name = payload.workoutName || "Workout";
      toast.success("Workout added!");
      notifySuccess(
        "Workout logged successfully!",
        `${name} has been added to your workout history.`
      );
      navigate("/workouts");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save workout");
      setSaving(false);
    }
  };

  return (
    <Sidebar>
      <main className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link to="/workouts" className="text-sm text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1">
            <Icon name="arrowLeft" className="w-4 h-4" /> Back to Workouts
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">Add New Workout</h1>
          <p className="text-gray-600 mt-1">Create a workout session with exercises and details</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <WorkoutForm
            initial={emptyWorkout()}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/workouts")}
            saving={saving}
            submitLabel="Add Workout"
          />
        </div>
      </main>
    </Sidebar>
  );
};

export default WorkoutCreate;