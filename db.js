import mongoose from "mongoose";

import dotenv from "dotenv";

dotenv.config();

const Connection = async () => {
  try {
    mongoose.connect(process.env.URL);
    console.log("mongodb connected successfully");
  } catch (err) {
    console.log("Mogodb Error" + err);
  }
};

Connection();
