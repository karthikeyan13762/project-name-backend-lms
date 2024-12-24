import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { adminModel } from "./models/Admin.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import "./db.js";

import { AdminRouter } from "./routes/auth.js";
import { studentRouter } from "./routes/student.js";
import { bookRouter } from "./routes/book.js";
import { Student } from "./models/Student.js";
import { Book } from "./models/Book.js";

const app = express();
//
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://library-management-system-8.netlify.app"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true"); // If you're using cookies
  next();
});
app.use(
  cors({
    origin: "https://library-management-system-8.netlify.app", // Your frontend URL
    credentials: true, // Allow cookies to be sent
  })
);
app.use(cookieParser());
dotenv.config();

app.use("/uploads", express.static("uploads"));
app.use("/auth", AdminRouter);

app.use("/student", studentRouter);

app.use("/book", bookRouter);

app.use("/dashboard", async (req, res) => {
  try {
    const student = await Student.countDocuments();
    const admin = await adminModel.countDocuments();
    const book = await Book.countDocuments();
    res.json({ ok: true, student, book, admin });
  } catch (error) {
    return res.json(error);
  }
});
// Function to ensure default admin account exists
// async function ensureAdminAccount() {
//   try {
//     const adminCount = await adminModel.countDocuments();
//     if (adminCount === 0) {
//       const hashPassword = await bcrypt.hash(process.env.ADMIN_PWD, 12);

//       const newAdmin = new adminModel({
//         username: "admin",
//         password: hashPassword,
//       });
//       await newAdmin.save();
//       console.log("Default admin account created.");
//     } else {
//       console.log("Admin account already exists.");
//     }
//   } catch (err) {
//     console.error("Error ensuring admin account:", err);
//   }
// }
async function ensureAdminAccount() {
  try {
    if (!process.env.ADMIN_PWD) {
      throw new Error(
        "Admin password is not defined in environment variables."
      );
    }

    const adminCount = await adminModel.countDocuments();
    if (adminCount === 0) {
      const hashPassword = await bcrypt.hash(process.env.ADMIN_PWD, 12);

      const newAdmin = new adminModel({
        username: "admin",
        password: hashPassword,
      });
      await newAdmin.save();
      console.log("Default admin account created.");
    } else {
      console.log("Admin account already exists.");
    }
  } catch (err) {
    console.error("Error ensuring admin account:", err);
  }
}
// Ensure admin account before starting the server
ensureAdminAccount().then(() => {
  app.listen(process.env.PORT || 3001, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
});
