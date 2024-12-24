import expres from "express";

import { Book } from "../models/Book.js";

import { verifyAdmin } from "./auth.js";

import multer from "multer";
// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save files in the "uploads" directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Add timestamp to ensure unique filenames
  },
});
const upload = multer({ storage });

const router = expres.Router();
// Add Book Endpoint
router.post("/add", verifyAdmin, upload.single("image"), async (req, res) => {
  try {
    const { name, author } = req.body;
    // const image = req.file ? req.file.path : ""; // Get the uploaded image path
    const image = req.file ? `/uploads/${req.file.filename}` : "";
    const newBook = new Book({
      name,
      author,
      image,
    });
    await newBook.save();

    return res.json({ added: true });
  } catch (err) {
    console.error("Error adding book:", err);
    return res.status(500).json({ message: "Error in adding new book" });
  }
});

router.get("/books", async (req, res) => {
  try {
    const books = await Book.find({});
    return res.json(books);
  } catch (err) {
    return res.json(err);
  }
});

router.get("/book/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const book = await Book.findById({ _id: id });
    return res.json(book);
  } catch (err) {
    return res.json(err);
  }
});

router.put(
  "/book/:id",
  verifyAdmin,
  upload.single("image"),
  async (req, res) => {
    const id = req.params.id;
    try {
      const { name, author } = req.body;
      const image = req.file ? `/uploads/${req.file.filename}` : null;

      // Update the book details
      const updatedData = { name, author };
      if (image) updatedData.image = image;

      const book = await Book.findByIdAndUpdate(id, updatedData, { new: true });

      return res.json({ updated: true, book });
    } catch (err) {
      console.error("Error updating book:", err);
      return res.status(500).json({ message: "Error updating book" });
    }
  }
);
router.delete("/book/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const book = await Book.findByIdAndDelete({ _id: id });
    return res.json({ deleted: true, book });
  } catch (err) {
    return res.json(err);
  }
});
export { router as bookRouter }; //import this bookrouter in index.je
