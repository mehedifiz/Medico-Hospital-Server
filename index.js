import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Connect to database
connectDB();
connectCloudinary()
 
// Middleware
app.use(cors());
app.use(express.json());

// API endpoint for testing
app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});