import express from "express";

import { adminModel } from "../models/Admin.js";

import jwt from "jsonwebtoken";

import bcrypt from "bcrypt";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { username, password, role } = req.body;
  if (role === "admin") {
    const admin = await adminModel.findOne(username);
    if (!admin) {
      res.json({ message: "admin not registered" });
    }
    const validPassword = await bcrypt.compare(password, adminModel.password);

    if (!validPassword) return res.json({ message: "wrong pasword" });

    const token = jwt.sign(
      { username: adminModel.username, role: "admin" },
      process.env.ADMIN_SCREAT_KEY
    );

    // store the toke insedthe cookies | (optional) httpOnly: true secure: true this is for security purpose it enable we can not acess our cookies thwo javascript

    res.cookie("token", token, { httpOnly: true, secure: true });
    return res.json({ login: true, role: "admin" });
  } else if (role === "student") {
  }
});

export { router as AdminRouter }; //import in index.js        import { AdminRouter } from "./routes/auth.js";       app.use("/auth", AdminRouter);
