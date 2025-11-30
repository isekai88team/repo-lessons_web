const express = require('express');
const { postAdmin, loginAdmin, postTeachers, readTeachers, readTeacherById, readStudents, readStudentById } = require('./admin.controller');
const authMiddleware = require("../middlewares/auth.middleware");
const router = express.Router();

//Admin Route
router.post("/register",postAdmin)
router.post("/login",loginAdmin)


//Management Teacher Route
router.post("/register-teacher",postTeachers)
router.get("/read-teacher",authMiddleware,readTeachers)
router.get("/read-teacher/:id",authMiddleware,readTeacherById)

//Menagement Student Route
router.get("/read-students",authMiddleware,readStudents)
router.get("/read-student/:id",authMiddleware,readStudentById)


module.exports = router;