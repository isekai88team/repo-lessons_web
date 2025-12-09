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
import EditTeacher from "../pages/Admin/EditTeacher";
// Subject & Chapter
import AllSubjects from "../pages/Admin/AllSubjects";
import AddSubject from "../pages/Admin/AddSubject";
import EditSubject from "../pages/Admin/EditSubject";
import SubjectDetail from "../pages/Admin/SubjectDetail";
import AddChapter from "../pages/Admin/AddChapter";
import EditChapter from "../pages/Admin/EditChapter";
// Pretests
import AllPretests from "../pages/Admin/AllPretests";
import AddPretest from "../pages/Admin/AddPretest";
import EditPretest from "../pages/Admin/EditPretest";
import PreviewPretest from "../pages/Admin/PreviewPretest";

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
        element: <div className="">User Login</div>,
      },
      {
        path: "register",
        element: <div className="">Register</div>,
      },
      {
        path: "lessons",
        element: <div className="">Lessons List</div>,
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
    ],
  },
]);

export default router;
