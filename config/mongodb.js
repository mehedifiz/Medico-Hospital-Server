import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Connect to the database
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "medico", // Specify the database name here
    });

    // Log a success message
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Error connecting to the database:", error.message);
    process.exit(1); // Exit the application with failure
  }
};

export default connectDB;
