import express from "express"; // Corrected the import from 'expres' to 'express'
import { Admin } from "../model/Admin.js";
import { Student } from "../model/Student.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const router = express.Router(); // Corrected the initialization to use 'express'
let isProduction = process.env.NODE_ENV === "production";
router.post("/login", async (req, res) => {
  try {
    const { userName, password, role } = req.body;

    if (role === "admin") {
      const admin = await Admin.findOne({ userName });
      if (!admin) {
        return res.json({ message: "Admin not registered" });
      }
      const validPassword = await bcrypt.compare(password, admin.password);
      if (!validPassword) {
        return res.json({ message: "Wrong password" });
      }
      const token = jwt.sign(
        { username: admin.userName, role: "admin" },
        process.env.ADMIN_KEY
      );
      // Store this token inside the cookies
      res.cookie("token", token, { httpOnly: true, secure: isProduction });
      return res.json({ login: true, role: "admin" });
    } else if (role === "student") {
      // Corrected from checking for admin role in student section
      const student = await Student.findOne({ userName });
      if (!student) {
        return res.json({ message: "Student not registered" });
      }
      const validPassword = await bcrypt.compare(password, student.password);
      if (!validPassword) {
        return res.json({ message: "Wrong password" });
      }
      const token = jwt.sign(
        { username: student.userName, role: "student" },
        process.env.STUDENT_KEY
      );
      // Store this token inside the cookies
      res.cookie("token", token, { httpOnly: true, secure: isProduction });
      return res.json({ login: true, role: "student" });
    } else {
      return res.json({ message: "Invalid role" });
    }
  } catch (err) {
    return res.json({ message: "Error in login", error: err.message });
  }
});

const verifyAdmin = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json({ message: "Invalid token" }); // Corrected the message for clarity
  } else {
    jwt.verify(token, process.env.ADMIN_KEY, (err, decode) => {
      if (err) {
        return res.json({ message: "Invalid token" }); // Fixed response method
      } else {
        req.username = decode.username;
        req.role = decode.role;
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
    jwt.verify(token, process.env.ADMIN_KEY, (err, decode) => {
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

router.get("/verify", verifUser, (req, res) => {
  return res.json({ login: true, role: req.role });
});
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ logout: "true" });
});
export { router as AdminRouter, verifyAdmin };
