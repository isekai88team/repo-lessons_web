const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const { loginTeacher, editTeacherProfile, readTeachers, createStudents, readStudents, readStudentById, updateStudent, deleteStudent, createSubject, readSubjectByTeacher, readSubjectById, updateSubject, deleteSubject, createChapter, readChaptersAll, readChapterById, editChapterById, deleteChapter } = require("./teacher.controller");


//Routes Teacher

router.post("/login",loginTeacher)
router.get("/profile",authMiddleware,readTeachers)
router.put("/edit-profile",authMiddleware,editTeacherProfile )

//Management Students by Teacher
router.post("/create-students",authMiddleware,createStudents)
router.get("/read-students",authMiddleware,readStudents)
router.get("/read-student/:id",authMiddleware,readStudentById)
router.put("/edit-student/:id",authMiddleware,updateStudent)
router.delete("/delete-student/:id",authMiddleware,deleteStudent)

//Management Subjects and Chapter by Teacher
router.post("/create-subject",authMiddleware,createSubject)
router.get("/read-subjects",authMiddleware,readSubjectByTeacher)
router.get("/read-subject/:id",authMiddleware,readSubjectById)
router.put("/edit-subject/:id",authMiddleware,updateSubject)
router.delete("/delete-subject/:id",authMiddleware,deleteSubject)

//Management Chapter by Teacher
router.post("/create-chapter/:id",authMiddleware,createChapter)
router.get("/read-chapter",authMiddleware,readChaptersAll)
router.get("/read-chapter/:id",authMiddleware,readChapterById)
router.put("/edit-chapter/:id",authMiddleware,editChapterById)
router.delete("/delete-chapter/:id",authMiddleware,deleteChapter)

module.exports = router;