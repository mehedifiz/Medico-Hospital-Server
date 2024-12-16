import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import adminRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import userRouter from "./routes/userRoutes.js";

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
  app.use('/api/admin' , adminRouter)


  app.use('/api/doctor' , doctorRouter)
  app.use('/api/user' , userRouter)
 


app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
