import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
  name: { type: String },
  author: { type: String, required: true },
  image: { type: String, required: true, default: "" },
});

const bookModel = mongoose.model("Book", bookSchema);

export { bookModel as Book };
