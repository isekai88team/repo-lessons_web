const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const port = process.env.PORT || 5000;

// middleware
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5175",
      "http://localhost:5173",
      "http://localhost:5000",
    ],
    credentials: true,
  })
);

// import routes
const AuthRoutes = require("./src/auth/auth.route");
const AdminRoutes = require("./src/admin/admin.route");
const TeacherRoutes = require("./src/teacher/teacher.route");
const StudentRoutes = require("./src/student/student.route");
const SubjectRoutes = require("./src/subject/subject.route");
const ChapterRoutes = require("./src/chapter/chapter.route");
const ProgressRoutes = require("./src/progress/progress.route");
const PublicRoutes = require("./src/public/public.route");
const NotificationRoutes = require("./src/notification/notification.route");

// routes
app.use("/api/auth", AuthRoutes);
app.use("/api/admin", AdminRoutes);
app.use("/api/teacher", TeacherRoutes);
app.use("/api/students", StudentRoutes);
app.use("/api/subjects", SubjectRoutes);
app.use("/api/chapters", ChapterRoutes);
app.use("/api/progress", ProgressRoutes);
app.use("/api/public", PublicRoutes);
app.use("/api/notifications", NotificationRoutes);

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
