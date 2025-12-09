import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import getBaseUrl from "../../../untils/baseURL";

const baseQuery = fetchBaseQuery({
  baseUrl: `${getBaseUrl()}/api/teachers`,
  credentials: "include",
  prepareHeaders: (Headers) => {
    const token = localStorage.getItem("token");
    if (token) {
      Headers.set("Authorization", `Bearer ${token}`);
    }
    return Headers;
  },
});

const teacherApi = createApi({
  reducerPath: "teacherApi",
  baseQuery,
  tagTypes: ["Teachers"],
  endpoints: (builder) => ({
    fetchAllTeachers: builder.query({
      query: () => "/",
      providesTags: ["Teachers"],
    }),
    fetchTeacherById: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: "Teachers", id }],
    }),
    addTeacher: builder.mutation({
      query: (newTeacher) => ({
        url: `/add-teacher`,
        method: "POST",
        body: newTeacher,
      }),
      invalidatesTags: ["Teachers"],
    }),
    updateTeacher: builder.mutation({
      query: ({ id, ...rest }) => ({
        url: `/edit/${id}`,
        method: "PUT",
        body: rest,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Teachers"],
    }),
    deleteTeacher: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Teachers"],
    }),
  }),
});

// Changed exported hooks
export const {
  useFetchAllTeachersQuery,
  useFetchTeacherByIdQuery,
  useAddTeacherMutation,
  useUpdateTeacherMutation,
  useDeleteTeacherMutation,
} = teacherApi;
export default teacherApi;
