// import express from "express";

// import dotenv from "dotenv";

// const app = express();

// dotenv.config();

// app.listen(process.env.PORT, () => {
//   console.log("server is running ");
// });

import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { adminModel } from "./models/Admin.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import "./db.js";

import { AdminRouter } from "./routes/auth.js";

dotenv.config();
const app = express();

app.use(express.json());

app.use(cors());

app.use(cookieParser());
app.use("/auth", AdminRouter);
// Function to ensure default admin account exists
async function ensureAdminAccount() {
  try {
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
  app.listen(process.env.PORT || 8001, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
});
