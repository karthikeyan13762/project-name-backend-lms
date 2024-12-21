import express from "express";

import bcrypt from "bcrypt";

import { adminModel } from "./models/Admin.js";

import "./db.js";
async function AdminAccount() {
  try {
    const adminCount = await adminModel.countDocuments();
    if (adminCount === 0) {
      const hashPassword = await bcrypt.hash(process.env.ADMIN_PWD, 12);

      const newAdmin = new adminModel({
        username: "admin",
        password: hashPassword,
      });
      await newAdmin.save();
      console.log("Acount created");
    } else {
      console.log("Account akready exists");
    }
  } catch (err) {
    console.log("error" + err);
  }
}
AdminAccount();
