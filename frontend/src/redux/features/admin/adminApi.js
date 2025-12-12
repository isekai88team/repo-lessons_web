import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import getBaseUrl from "../../../untils/baseURL";

// Base query for admin endpoints
const adminBaseQuery = fetchBaseQuery({
  baseUrl: `${getBaseUrl()}/api/admin`,
  credentials: "include",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// Base query for subject/chapter endpoints
const apiBaseQuery = fetchBaseQuery({
  baseUrl: `${getBaseUrl()}/api`,
  credentials: "include",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// Custom base query to handle different base URLs
const dynamicBaseQuery = async (args, api, extraOptions) => {
  const url = typeof args === "string" ? args : args?.url || "";

  // Handle /subjects and /progress with apiBaseQuery
  if (
    url.startsWith("/subjects") ||
    url.startsWith("/progress") ||
    url.includes("/api/subjects") ||
    url.includes("/api/progress")
  ) {
    return apiBaseQuery(args, api, extraOptions);
  }

  // Everything else uses admin base query
  return adminBaseQuery(args, api, extraOptions);
};

const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: dynamicBaseQuery,
  tagTypes: [
    "Admin",
    "Teachers",
    "Students",
    "Subjects",
    "Chapters",
    "Pretests",
    "Posttests",
    "Progress",
    "FinalExams",
  ],
  endpoints: (builder) => ({
    // --- Admin Auth ---
    registerAdmin: builder.mutation({
      query: (newAdmin) => ({
        url: "/register",
        method: "POST",
        body: newAdmin,
      }),
    }),
    loginAdmin: builder.mutation({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        body: credentials,
      }),
    }),

    // --- Teacher Management ---
    registerTeacher: builder.mutation({
      query: (newTeacher) => ({
        url: "/register-teacher",
        method: "POST",
        body: newTeacher,
      }),
      invalidatesTags: ["Teachers"],
    }),
    fetchAllTeachers: builder.query({
      query: () => "/read-teacher",
      providesTags: ["Teachers"],
    }),
    fetchTeacherById: builder.query({
      query: (id) => `/read-teacher/${id}`,
      providesTags: (result, error, id) => [{ type: "Teachers", id }],
    }),
    updateTeacher: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/update-teacher/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Teachers"],
    }),
    deleteTeacher: builder.mutation({
      query: (id) => ({
        url: `/delete-teacher/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Teachers"],
    }),

    // --- Student Management ---
    registerStudent: builder.mutation({
      query: (newStudent) => ({
        url: "/register-student",
        method: "POST",
        body: newStudent,
      }),
      invalidatesTags: ["Students"],
    }),
    fetchAllStudents: builder.query({
      query: () => "/read-students",
      providesTags: ["Students"],
    }),
    fetchStudentById: builder.query({
      query: (id) => `/read-student/${id}`,
      providesTags: (result, error, id) => [{ type: "Students", id }],
    }),
    updateStudent: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/update-student/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Students"],
    }),
    deleteStudent: builder.mutation({
      query: (id) => ({
        url: `/delete-student/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Students"],
    }),

    // --- Subject Management ---
    createSubject: builder.mutation({
      query: (newSubject) => ({
        url: "/subjects",
        method: "POST",
        body: newSubject,
      }),
      invalidatesTags: ["Subjects"],
    }),
    fetchAllSubjects: builder.query({
      query: () => "/subjects",
      providesTags: ["Subjects"],
    }),
    fetchSubjectById: builder.query({
      query: (id) => `/subjects/${id}`,
      providesTags: (result, error, id) => [{ type: "Subjects", id }],
    }),
    updateSubject: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/subjects/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Subjects"],
    }),
    deleteSubject: builder.mutation({
      query: (id) => ({
        url: `/subjects/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Subjects", "Chapters"],
    }),

    // --- Chapter Management ---
    createChapter: builder.mutation({
      query: (formData) => ({
        url: "/chapters",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Chapters"],
    }),
    fetchChaptersBySubject: builder.query({
      query: (subjectId) => `/chapters/subject/${subjectId}`,
      providesTags: ["Chapters"],
    }),
    fetchChapterById: builder.query({
      query: (id) => `/chapters/${id}`,
      providesTags: (result, error, id) => [{ type: "Chapters", id }],
    }),
    updateChapter: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/chapters/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Chapters"],
    }),
    deleteChapter: builder.mutation({
      query: (id) => ({
        url: `/chapters/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Chapters"],
    }),

    // --- Pretest Management ---
    createPretest: builder.mutation({
      query: (newPretest) => ({
        url: "/pretests",
        method: "POST",
        body: newPretest,
      }),
      invalidatesTags: ["Pretests"],
    }),
    fetchPretestsByChapter: builder.query({
      query: (chapterId) => `/pretests/chapter/${chapterId}`,
      providesTags: ["Pretests"],
    }),
    fetchPretestById: builder.query({
      query: (id) => `/pretests/${id}`,
      providesTags: (result, error, id) => [{ type: "Pretests", id }],
    }),
    updatePretest: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/pretests/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Pretests"],
    }),
    deletePretest: builder.mutation({
      query: (id) => ({
        url: `/pretests/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Pretests"],
    }),
    addQuestion: builder.mutation({
      query: ({ pretestId, question }) => ({
        url: `/pretests/${pretestId}/questions`,
        method: "POST",
        body: question,
      }),
      invalidatesTags: ["Pretests"],
    }),
    updateQuestion: builder.mutation({
      query: ({ pretestId, questionIndex, ...data }) => ({
        url: `/pretests/${pretestId}/questions/${questionIndex}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Pretests"],
    }),
    deleteQuestion: builder.mutation({
      query: ({ pretestId, questionIndex }) => ({
        url: `/pretests/${pretestId}/questions/${questionIndex}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Pretests"],
    }),

    // --- Posttest Management ---
    createPosttest: builder.mutation({
      query: (newPosttest) => ({
        url: "/posttests",
        method: "POST",
        body: newPosttest,
      }),
      invalidatesTags: ["Posttests"],
    }),
    fetchPosttestsByChapter: builder.query({
      query: (chapterId) => `/posttests/chapter/${chapterId}`,
      providesTags: ["Posttests"],
    }),
    fetchPosttestById: builder.query({
      query: (id) => `/posttests/${id}`,
      providesTags: (result, error, id) => [{ type: "Posttests", id }],
    }),
    updatePosttest: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/posttests/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Posttests"],
    }),
    deletePosttest: builder.mutation({
      query: (id) => ({
        url: `/posttests/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Posttests"],
    }),

    // --- Student Progress ---
    fetchStudentsProgress: builder.query({
      query: () => `/progress/students`,
      providesTags: ["Progress"],
    }),
    fetchStudentProgress: builder.query({
      query: (studentId) => `/progress/student/${studentId}`,
      providesTags: (result, error, studentId) => [
        { type: "Progress", id: studentId },
      ],
    }),
    fetchStudentTestHistory: builder.query({
      query: (studentId) => `/progress/student/${studentId}/tests`,
    }),
    enrollStudent: builder.mutation({
      query: ({ studentId, subjectId }) => ({
        url: `/progress/enroll`,
        method: "POST",
        body: { studentId, subjectId },
      }),
      invalidatesTags: ["Progress"],
    }),
    unenrollStudent: builder.mutation({
      query: ({ studentId, subjectId }) => ({
        url: `/progress/unenroll/${studentId}/${subjectId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Progress"],
    }),

    // --- Final Exam Management ---
    fetchAllPretestQuestions: builder.query({
      query: (subjectId) =>
        `/final-exam/questions${subjectId ? `?subjectId=${subjectId}` : ""}`,
    }),
    createFinalExam: builder.mutation({
      query: (newExam) => ({
        url: "/final-exam",
        method: "POST",
        body: newExam,
      }),
      invalidatesTags: ["FinalExams"],
    }),
    fetchFinalExamBySubject: builder.query({
      query: (subjectId) => `/final-exam/subject/${subjectId}`,
      providesTags: ["FinalExams"],
    }),
    fetchFinalExamById: builder.query({
      query: (id) => `/final-exam/${id}`,
      providesTags: (result, error, id) => [{ type: "FinalExams", id }],
    }),
    updateFinalExam: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/final-exam/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["FinalExams"],
    }),
    deleteFinalExam: builder.mutation({
      query: (id) => ({
        url: `/final-exam/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["FinalExams"],
    }),
  }),
});

export const {
  // Admin Auth
  useRegisterAdminMutation,
  useLoginAdminMutation,
  // Teachers
  useRegisterTeacherMutation,
  useFetchAllTeachersQuery,
  useFetchTeacherByIdQuery,
  useUpdateTeacherMutation,
  useDeleteTeacherMutation,
  // Students
  useRegisterStudentMutation,
  useFetchAllStudentsQuery,
  useFetchStudentByIdQuery,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
  // Subjects
  useCreateSubjectMutation,
  useFetchAllSubjectsQuery,
  useFetchSubjectByIdQuery,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
  // Chapters
  useCreateChapterMutation,
  useFetchChaptersBySubjectQuery,
  useFetchChapterByIdQuery,
  useUpdateChapterMutation,
  useDeleteChapterMutation,
  // Pretests
  useCreatePretestMutation,
  useFetchPretestsByChapterQuery,
  useFetchPretestByIdQuery,
  useUpdatePretestMutation,
  useDeletePretestMutation,
  useAddQuestionMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
  // Posttests
  useCreatePosttestMutation,
  useFetchPosttestsByChapterQuery,
  useFetchPosttestByIdQuery,
  useUpdatePosttestMutation,
  useDeletePosttestMutation,
  // Progress
  useFetchStudentsProgressQuery,
  useFetchStudentProgressQuery,
  useFetchStudentTestHistoryQuery,
  useEnrollStudentMutation,
  useUnenrollStudentMutation,
  // Final Exams
  useFetchAllPretestQuestionsQuery,
  useCreateFinalExamMutation,
  useFetchFinalExamBySubjectQuery,
  useFetchFinalExamByIdQuery,
  useUpdateFinalExamMutation,
  useDeleteFinalExamMutation,
} = adminApi;

export default adminApi;
