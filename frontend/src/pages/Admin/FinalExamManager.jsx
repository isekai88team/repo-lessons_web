import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import { useFetchAllSubjectsQuery } from "../../redux/features/admin/adminApi";

const FinalExamManager = () => {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { data: subjectsData, isLoading } = useFetchAllSubjectsQuery();
  const subjects = subjectsData?.subjects || [];
  const firstSubject = subjects[0];

  // Auto redirect to create/edit page
  useEffect(() => {
    if (firstSubject?._id && !isLoading) {
      navigate(`/admin/create-final-exam/${firstSubject._id}`, {
        replace: true,
      });
    }
  }, [firstSubject, isLoading, navigate]);

  // Show loading while fetching subject and redirecting
  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{ backgroundColor: colors.background }}
    >
      <FaSpinner
        className="animate-spin text-5xl"
        style={{ color: "#F59E0B" }}
      />
    </div>
  );
};

export default FinalExamManager;
