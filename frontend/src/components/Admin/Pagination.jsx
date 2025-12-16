import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

/**
 * Reusable Pagination Component
 *
 * Props:
 * - currentPage: number (1-indexed)
 * - totalItems: number
 * - itemsPerPage: number
 * - onPageChange: (page) => void
 * - onItemsPerPageChange: (count) => void (optional)
 * - showItemsPerPage: boolean (default: true)
 */
const Pagination = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPage = true,
}) => {
  const { isDarkMode, colors } = useTheme();

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      // Pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      // Always show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const buttonStyle = {
    backgroundColor: isDarkMode ? `${colors.border}30` : "#f3f4f6",
    color: colors.text,
    border: `1px solid ${colors.border}30`,
  };

  const activeButtonStyle = {
    backgroundColor: colors.primary,
    color: "#FFF6E0",
    border: `1px solid ${colors.primary}`,
  };

  const disabledButtonStyle = {
    backgroundColor: isDarkMode ? `${colors.border}20` : "#e5e7eb",
    color: colors.textSecondary,
    opacity: 0.5,
    cursor: "not-allowed",
  };

  if (totalItems === 0) return null;

  return (
    <div
      className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 p-4 rounded-xl"
      style={{
        backgroundColor: colors.cardBg,
        border: `1px solid ${colors.border}30`,
      }}
    >
      {/* Items info */}
      <div className="text-sm" style={{ color: colors.textSecondary }}>
        แสดง{" "}
        <span style={{ color: colors.text, fontWeight: 600 }}>
          {startItem}-{endItem}
        </span>{" "}
        จาก{" "}
        <span style={{ color: colors.text, fontWeight: 600 }}>
          {totalItems}
        </span>{" "}
        รายการ
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg transition-all cursor-pointer disabled:cursor-not-allowed"
          style={currentPage === 1 ? disabledButtonStyle : buttonStyle}
        >
          <FaChevronLeft className="text-sm" />
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) =>
            page === "..." ? (
              <span
                key={`ellipsis-${index}`}
                className="px-2 py-1 text-sm"
                style={{ color: colors.textSecondary }}
              >
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className="w-9 h-9 rounded-lg text-sm font-medium transition-all cursor-pointer"
                style={currentPage === page ? activeButtonStyle : buttonStyle}
              >
                {page}
              </button>
            )
          )}
        </div>

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg transition-all cursor-pointer disabled:cursor-not-allowed"
          style={currentPage === totalPages ? disabledButtonStyle : buttonStyle}
        >
          <FaChevronRight className="text-sm" />
        </button>
      </div>

      {/* Items per page selector */}
      {showItemsPerPage && onItemsPerPageChange && (
        <div className="flex items-center gap-2">
          <span className="text-sm" style={{ color: colors.textSecondary }}>
            แสดงหน้าละ
          </span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="p-2 rounded-lg text-sm cursor-pointer outline-none"
            style={{
              backgroundColor: isDarkMode ? colors.background : "#f5f6f7",
              border: `1px solid ${colors.border}`,
              color: colors.text,
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default Pagination;
