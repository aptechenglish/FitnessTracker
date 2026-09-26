import mongoose from "mongoose";

const foodSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      trim: true,
    },
    foodName: {
      type: String,
      trim: true,
    },
    mealType: {
      type: String,
      default: "lunch",
    },
    calories: {
      type: Number,
      required: true,
      default: 0,
    },
    protein: {
      type: Number,
      default: 0,
    },
    carbs: {
      type: Number,
      default: 0,
    },
    fat: {
      type: Number,
      default: 0,
    },
    fats: {
      type: Number,
      default: 0,
    },
    quantity: {
      type: Number,
      default: 1,
    },
    unit: {
      type: String,
      default: "serving",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    image: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

foodSchema.pre("validate", function () {
  if (!this.name && this.foodName) this.name = this.foodName;
  if (!this.foodName && this.name) this.foodName = this.name;
  if (this.fat === undefined && this.fats !== undefined) this.fat = this.fats;
  if (this.fats === undefined && this.fat !== undefined) this.fats = this.fat;
  if (!this.name && !this.foodName) {
    this.name = "Meal";
    this.foodName = "Meal";
  }
});

const Food = mongoose.model("Food", foodSchema);
export default Food;
