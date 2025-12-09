import { configureStore } from "@reduxjs/toolkit";
import adminApi from "./features/admin/adminApi";
import teacherApi from "./features/teacher/teacherApi";

export const store = configureStore({
  reducer: {
    [adminApi.reducerPath]: adminApi.reducer,
    [teacherApi.reducerPath]: teacherApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(adminApi.middleware, teacherApi.middleware),
});

export default store;
