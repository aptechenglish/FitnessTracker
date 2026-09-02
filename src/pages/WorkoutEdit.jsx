import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Icon from "../components/Icon";
import WorkoutForm, { workoutFromExisting } from "../components/WorkoutForm";
import toast from "react-hot-toast";
import { getWorkoutById, updateWorkout } from "../services/workouts";
import { notifySuccess } from "../components/AppToast";

const WorkoutEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initial, setInitial] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getWorkoutById(id);
        setInitial(workoutFromExisting(res.data));
      } catch (error) {
        if (error.response?.status === 404) setNotFound(true);
        else toast.error("Failed to load workout");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSubmit = async (payload) => {
    setSaving(true);
    try {
      await updateWorkout(id, payload);
      toast.success("Workout updated!");
      notifySuccess(
        "Workout updated",
        `${payload.workoutName || "Workout"} has been updated successfully.`
      );
      navigate(`/workouts/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update workout");
      setSaving(false);
    }
  };

  return (
    <Sidebar>
      <main className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link to={`/workouts/${id}`} className="text-sm text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1">
            <Icon name="arrowLeft" className="w-4 h-4" /> Back to Workout
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">Edit Workout</h1>
          <p className="text-gray-600 mt-1">Update your workout details</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : notFound ? (
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
            <Icon name="search" className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Workout not found</h3>
            <button
              onClick={() => navigate("/workouts")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Back to Workouts
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <WorkoutForm
              initial={initial}
              onSubmit={handleSubmit}
              onCancel={() => navigate(`/workouts/${id}`)}
              saving={saving}
              submitLabel="Save Changes"
            />
          </div>
        )}
      </main>
    </Sidebar>
  );
};

export default WorkoutEdit;