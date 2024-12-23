import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  role: { type: String, default: "student" },
  roll: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  grade: { type: String },
});

const studentModel = new mongoose.model("student", studentSchema);

export { studentModel as Student };
