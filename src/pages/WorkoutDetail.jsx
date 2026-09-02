import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Icon from "../components/Icon";
import { getCategoryInfo } from "../components/WorkoutForm";
import toast from "react-hot-toast";
import { getWorkoutById, deleteWorkout } from "../services/workouts";

const WorkoutDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [workout, setWorkout] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getWorkoutById(id);
        setWorkout(res.data);
      } catch (error) {
        if (error.response?.status === 404) setNotFound(true);
        else toast.error("Failed to load workout");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this workout?")) return;
    try {
      await deleteWorkout(id);
      toast.success("Workout deleted");
      navigate("/workouts");
    } catch (error) {
      toast.error("Failed to delete workout");
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Sidebar>
      <main className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link to="/workouts" className="text-sm text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1">
            <Icon name="arrowLeft" className="w-4 h-4" /> Back to Workouts
          </Link>
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
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className={`px-6 py-6 ${getCategoryInfo(workout.category).color} bg-opacity-30`}>
              <div className="flex items-center gap-3">
                <Icon name={getCategoryInfo(workout.category).icon} className="w-10 h-10 text-gray-500" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{workout.workoutName}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getCategoryInfo(workout.category).color}`}>
                      {getCategoryInfo(workout.category).label}
                    </span>
                    <span className="text-sm text-gray-600">{formatDate(workout.date)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              {(workout.caloriesBurned > 0 || workout.durationMinutes > 0) && (
                <div className="flex gap-6 mb-6 text-sm text-gray-600">
                  {workout.caloriesBurned > 0 && (
                    <span className="flex items-center gap-1"><Icon name="flame" className="w-4 h-4 text-red-500" /> <strong>{workout.caloriesBurned}</strong> cal</span>
                  )}
                  {workout.durationMinutes > 0 && (
                    <span className="flex items-center gap-1"><Icon name="reminders" className="w-4 h-4 text-gray-400" /> <strong>{workout.durationMinutes}</strong> min</span>
                  )}
                </div>
              )}

              {workout.notes && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-1">Session Notes</p>
                  <p className="text-gray-600 whitespace-pre-wrap">{workout.notes}</p>
                </div>
              )}

              <h2 className="text-lg font-semibold text-gray-800 mb-4">Exercises</h2>
              <div className="space-y-3">
                {workout.exercises.map((ex, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-800">{ex.name}</span>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        {ex.sets > 0 && <span><strong>{ex.sets}</strong> sets</span>}
                        {ex.reps > 0 && <span><strong>{ex.reps}</strong> reps</span>}
                        {ex.weight > 0 && <span><strong>{ex.weight}</strong> kg</span>}
                        {ex.duration > 0 && <span><strong>{ex.duration}</strong> min</span>}
                        {ex.distance > 0 && <span><strong>{ex.distance}</strong> km</span>}
                      </div>
                    </div>
                    {ex.notes && <p className="text-sm text-gray-500 mt-2">{ex.notes}</p>}
                  </div>
                ))}
              </div>

              {workout.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-6">
                  {workout.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-3 mt-8 border-t pt-6">
                <button
                  onClick={() => navigate(`/workouts/${id}/edit`)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
                >
                  Edit Workout
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </Sidebar>
  );
};

export default WorkoutDetail;