// Import necessary modules
const express = require("express");
const cors = require("cors");

const app = express();

const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// API endpoint for testing
app.get("/", (req, res) => {
  res.send("server is running ");
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
