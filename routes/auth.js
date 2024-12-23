import express from "express";
import { adminModel } from "../models/Admin.js";
import { Student } from "../models/Student.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const router = express.Router();

router.post("/login", async (req, res) => {
  let { username, password, role } = req.body;

  if (role === "admin") {
    try {
      // Correct filter for Mongoose's findOne
      const admin = await adminModel.findOne({ username }); // Pass an object here

      if (!admin) {
        return res.json({ message: "Admin not registered" });
      }

      // Compare the password
      const validPassword = await bcrypt.compare(password, admin.password);
      if (!validPassword) {
        return res.json({ message: "Wrong password" });
      }

      // Generate a JWT token
      const token = jwt.sign(
        { username: admin.username, role: "admin" },
        process.env.ADMIN_SCREAT_KEY
      );

      // Store the token in a cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 3600000,
      });
      return res.json({ login: true, role: "admin" });
    } catch (err) {
      console.error("Error during login:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  } else if (role === "student") {
    const student = await Student.findOne({ username });
    if (!student) {
      return res.json({ message: "Student not registered" });
    }
    const validPassword = await bcrypt.compare(password, student.password);
    if (!validPassword) {
      return res.json({ message: "Wrong password" });
    }
    const token = jwt.sign(
      { username: student.username, role: "student" },
      process.env.STUDENT_KEY
    );
    // Store this token inside the cookies
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000,
    });
    return res.json({ login: true, role: "student" });
  }
});

const verifyAdmin = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.json({ message: "Invalid Admin" });
  } else {
    jwt.verify(token, process.env.ADMIN_SCREAT_KEY, (err, decoded) => {
      if (err) {
        return res.json({ message: "Invalid token" + err });
      } else {
        req.username = decoded.username;
        req.role = decoded.role;
        next();
      }
    });
  }
};
const verifUser = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json({ message: "Invalid User" }); // Corrected the message for clarity
  } else {
    jwt.verify(token, process.env.ADMIN_SCREAT_KEY, (err, decode) => {
      if (err) {
        jwt.verify(token, process.env.STUDENT_KEY, (err, decode) => {
          if (err) {
            return res.json({ message: "Invalid token" }); // Fixed response method
          } else {
            req.username = decode.username;
            req.role = decode.role;
            next();
          }
        });
      } else {
        req.username = decode.username;
        req.role = decode.role;
        next();
      }
    });
  }
};
router.get("/logout", (req, res) => {
  res.clearCookie("token"); // Clear the token cookie
  return res.json({ Logout: true }); // Explicitly return `Logout: true`
});

router.get("/verify", verifUser, (req, res) => {
  return res.json({ login: true, role: req.role });
});

export { router as AdminRouter, verifyAdmin };
