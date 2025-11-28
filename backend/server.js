const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const port = process.env.PORT || 5000;

// middleware
app.use(express.json());
app.use(cors());

// import routes
const AuthRoutes = require("./src/auth/auth.route");
// routes
app.use("/api/auth", AuthRoutes);

app.get("/", (req, res) => {
  res.send("Lessons Server is running! ✅");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully ✅");
    app.listen(port, () => {
      console.log(`Server running on port ${port} 🚀`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed ❌", err);
    process.exit(1);
  });
