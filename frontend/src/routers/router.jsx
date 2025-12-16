import { createBrowserRouter } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import App from "../App";
import AdminLayout from "../pages/Admin/AdminLayout";
import LoginPage from "../pages/Admin/Loginpage";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import AllStudents from "../pages/Admin/AllStudents";
import AllTeachers from "../pages/Admin/AllTeachers";
import AddTeacher from "../pages/Admin/AddTeacher";
import AddStudent from "../pages/Admin/AddStudent";
import EditStudent from "../pages/Admin/EditStudent";
import StudentDetail from "../pages/Admin/StudentDetail";
import EditTeacher from "../pages/Admin/EditTeacher";
// Subject & Chapter
import AllSubjects from "../pages/Admin/AllSubjects";
import AddSubject from "../pages/Admin/AddSubject";
import EditSubject from "../pages/Admin/EditSubject";
import SubjectDetail from "../pages/Admin/SubjectDetail";
import AllChapters from "../pages/Admin/AllChapters";
import AddChapter from "../pages/Admin/AddChapter";
import EditChapter from "../pages/Admin/EditChapter";
// Pretests
import AllPretests from "../pages/Admin/AllPretests";
import AddPretest from "../pages/Admin/AddPretest";
import EditPretest from "../pages/Admin/EditPretest";
import PreviewPretest from "../pages/Admin/PreviewPretest";
// Posttests
import AllPosttests from "../pages/Admin/AllPosttests";
import EditPosttest from "../pages/Admin/EditPosttest";
import PreviewPosttest from "../pages/Admin/PreviewPosttest";
// Final Exam
import CreateFinalExam from "../pages/Admin/CreateFinalExam";
import FinalExamManager from "../pages/Admin/FinalExamManager";
import QuizBank from "../pages/Admin/QuizBank";
import PosttestSettings from "../pages/Admin/PosttestSettings";
// Worksheets
import AllWorksheets from "../pages/Admin/AllWorksheets";
import AddWorksheet from "../pages/Admin/AddWorksheet";
import EditWorksheet from "../pages/Admin/EditWorksheet";
import Grading from "../pages/Admin/Grading";
import ManagementNotification from "../pages/Admin/ManagementNotification";
// Student Pages
import StudentLogin from "../pages/Student/StudentLogin";
import ChapterDetail from "../pages/Student/ChapterDetail";
import StudentProfile from "../pages/Student/StudentProfile";

import MyProgress from "../pages/Student/MyProgress";
import MyTests from "../pages/Student/MyTests";
import MyFinalExam from "../pages/Student/MyFinalExam";
import Worksheets from "../pages/Student/Worksheets";
import WorksheetDetail from "../pages/Student/WorksheetDetail";
import Submissions from "../pages/Student/Submissions";
import StudentNotifications from "../pages/Student/StudentNotifications";
import StudentNotificationDetail from "../pages/Student/StudentNotificationDetail";
import StudentFinalExam from "../pages/Student/FinalExam";

const router = createBrowserRouter([
  // --- User Zone ---
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: "login",
        element: <StudentLogin />,
      },
      {
        path: "register",
        element: <div className="">Register</div>,
      },
      {
        path: "lessons",
        element: <div className="">Lessons List</div>,
      },
      {
        path: "chapter/:id",
        element: <ChapterDetail />,
      },
      {
        path: "profile",
        element: <StudentProfile />,
      },
      {
        path: "my-progress",
        element: <MyProgress />,
      },
      {
        path: "my-tests",
        element: <MyTests />,
      },
      {
        path: "notifications",
        element: <StudentNotifications />,
      },
      {
        path: "notifications/:id",
        element: <StudentNotificationDetail />,
      },
      {
        path: "final-exam/:subjectId",
        element: <StudentFinalExam />,
      },
      {
        path: "final-exams",
        element: <MyFinalExam />,
      },
      {
        path: "worksheets",
        element: <Worksheets />,
      },
      {
        path: "worksheets/:id",
        element: <WorksheetDetail />,
      },
      {
        path: "submissions",
        element: <Submissions />,
      },
    ],
  },

  {
    path: "/admin",
    element: <LoginPage />,
  },

  // --- Admin Zone ---
  {
    path: "/",
    element: <AdminLayout />,
    children: [
      {
        path: "admin/dashboard",
        element: <AdminDashboard />,
      },
      // Students
      {
        path: "admin/students",
        element: <AllStudents />,
      },
      {
        path: "admin/add-student",
        element: <AddStudent />,
      },
      {
        path: "admin/edit-student/:id",
        element: <EditStudent />,
      },
      {
        path: "admin/student/:id",
        element: <StudentDetail />,
      },
      // Teachers
      {
        path: "admin/teachers",
        element: <AllTeachers />,
      },
      {
        path: "admin/add-teacher",
        element: <AddTeacher />,
      },
      {
        path: "admin/edit-teacher/:id",
        element: <EditTeacher />,
      },
      // Subjects
      {
        path: "admin/subjects",
        element: <AllSubjects />,
      },
      {
        path: "admin/add-subject",
        element: <AddSubject />,
      },
      {
        path: "admin/edit-subject/:id",
        element: <EditSubject />,
      },
      {
        path: "admin/subject/:id",
        element: <SubjectDetail />,
      },
      // Chapters
      {
        path: "admin/chapters",
        element: <AllChapters />,
      },
      {
        path: "admin/add-chapter/:subjectId",
        element: <AddChapter />,
      },
      {
        path: "admin/edit-chapter/:id",
        element: <EditChapter />,
      },
      // Pretests
      {
        path: "admin/pretests/:chapterId",
        element: <AllPretests />,
      },
      {
        path: "admin/add-pretest",
        element: <AddPretest />,
      },
      {
        path: "admin/add-pretest/:chapterId",
        element: <AddPretest />,
      },
      {
        path: "admin/edit-pretest/:id",
        element: <EditPretest />,
      },
      {
        path: "admin/preview-pretest/:id",
        element: <PreviewPretest />,
      },
      // Posttests
      {
        path: "admin/posttests/:chapterId",
        element: <AllPosttests />,
      },
      {
        path: "admin/edit-posttest/:id",
        element: <EditPosttest />,
      },
      {
        path: "admin/preview-posttest/:id",
        element: <PreviewPosttest />,
      },
      // Final Exam
      {
        path: "admin/final-exam",
        element: <FinalExamManager />,
      },
      {
        path: "admin/create-final-exam/:subjectId",
        element: <CreateFinalExam />,
      },
      // Quiz Bank (คลังข้อสอบ)
      {
        path: "admin/quizzes",
        element: <QuizBank />,
      },
      {
        path: "admin/posttest-settings/:pretestId",
        element: <PosttestSettings />,
      },
      // Worksheets (ใบงาน)
      {
        path: "admin/worksheets",
        element: <AllWorksheets />,
      },
      {
        path: "admin/add-worksheet",
        element: <AddWorksheet />,
      },
      {
        path: "admin/edit-worksheet/:id",
        element: <EditWorksheet />,
      },
      {
        path: "admin/grading",
        element: <Grading />,
      },
      {
        path: "admin/notifications",
        element: <ManagementNotification />,
      },
    ],
  },
]);

export default router;
