import express from "express";
import { Student } from "../models/Student.js";

import bcrypt from "bcrypt";

import { verifyAdmin } from "./auth.js";
const router = express.Router();

router.post("/register", verifyAdmin, async (req, res) => {
  try {
    let { username, password, roll, grade, role } = req.body;

    // Default role to "student" if not provided
    role = role || "student";

    const student = await Student.findOne({ username });

    if (student) {
      return res.json({ message: "student is registered" });
    }

    const hashPassword = await bcrypt.hash(password, 12);

    const newstudent = new Student({
      username,
      password: hashPassword,
      roll,
      grade,
      role, // Include role
    });
    await newstudent.save();

    return res.json({ registered: true });
  } catch (err) {
    console.error("Error during registration:", err);
    return res
      .status(500)
      .json({ message: "Error in registering student", error: err.message });
  }
});

export { router as studentRouter }; // import in index.js   app.use("/student", studentRouter);
