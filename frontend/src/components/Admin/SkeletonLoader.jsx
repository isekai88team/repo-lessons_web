import React from "react";
import { useTheme } from "../../context/ThemeContext";

/**
 * Skeleton Loading Components
 * Provides animated loading placeholders that match the theme
 */

// Base skeleton element with pulse animation
const SkeletonBase = ({ className = "", style = {} }) => {
  const { isDarkMode, colors } = useTheme();

  return (
    <div
      className={`animate-pulse rounded ${className}`}
      style={{
        backgroundColor: isDarkMode ? `${colors.border}50` : "#e5e7eb",
        ...style,
      }}
    />
  );
};

// Skeleton for table rows
export const TableRowSkeleton = ({ columns = 6 }) => {
  const { colors } = useTheme();

  return (
    <tr style={{ borderBottom: `1px solid ${colors.border}30` }}>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-4">
          <SkeletonBase
            className="h-4"
            style={{
              width: i === 0 ? "40px" : i === columns - 1 ? "80px" : "100%",
            }}
          />
        </td>
      ))}
    </tr>
  );
};

// Skeleton for entire table
export const TableSkeleton = ({ rows = 5, columns = 6 }) => {
  const { isDarkMode, colors } = useTheme();

  return (
    <div
      className="rounded-2xl shadow-lg overflow-hidden"
      style={{
        backgroundColor: colors.cardBg,
        border: `1px solid ${colors.border}30`,
      }}
    >
      {/* Header skeleton */}
      <div
        className="p-4 flex gap-4"
        style={{
          backgroundColor: isDarkMode ? `${colors.border}30` : "#f3f4f6",
        }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <SkeletonBase
            key={i}
            className="h-4 flex-1"
            style={{ maxWidth: i === 0 ? "40px" : undefined }}
          />
        ))}
      </div>

      {/* Table body skeleton */}
      <table className="w-full">
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Skeleton for cards (mobile view)
export const CardSkeleton = () => {
  const { colors } = useTheme();

  return (
    <div
      className="p-5 rounded-xl shadow-sm"
      style={{
        backgroundColor: colors.cardBg,
        border: `1px solid ${colors.border}30`,
      }}
    >
      {/* Avatar and name */}
      <div className="flex items-center gap-3 mb-4">
        <SkeletonBase className="w-12 h-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <SkeletonBase className="h-4 w-3/4" />
          <SkeletonBase className="h-3 w-1/2" />
        </div>
      </div>

      {/* Info rows */}
      <div className="space-y-3">
        <div className="flex justify-between">
          <SkeletonBase className="h-3 w-20" />
          <SkeletonBase className="h-3 w-32" />
        </div>
        <div className="flex justify-between">
          <SkeletonBase className="h-3 w-16" />
          <SkeletonBase className="h-3 w-28" />
        </div>
        <div className="flex justify-between">
          <SkeletonBase className="h-3 w-24" />
          <SkeletonBase className="h-3 w-24" />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mt-4">
        <SkeletonBase className="h-10 flex-1 rounded-lg" />
        <SkeletonBase className="h-10 flex-1 rounded-lg" />
      </div>
    </div>
  );
};

// Skeleton for multiple cards
export const CardListSkeleton = ({ count = 5 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

// Skeleton for stat cards on dashboard
export const StatCardSkeleton = () => {
  const { colors } = useTheme();

  return (
    <div
      className="rounded-2xl p-6 shadow-sm"
      style={{
        backgroundColor: colors.cardBg,
        border: `1px solid ${colors.border}30`,
      }}
    >
      <div className="flex justify-between items-start mb-4">
        <SkeletonBase className="w-14 h-14 rounded-2xl" />
        <SkeletonBase className="w-5 h-5 rounded" />
      </div>
      <SkeletonBase className="h-3 w-24 mb-2" />
      <SkeletonBase className="h-8 w-16" />
    </div>
  );
};

// Skeleton for subject/chapter cards (grid items)
export const SubjectCardSkeleton = () => {
  const { colors } = useTheme();

  return (
    <div
      className="rounded-2xl p-6 shadow-sm"
      style={{
        backgroundColor: colors.cardBg,
        border: `1px solid ${colors.border}30`,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <SkeletonBase className="w-12 h-12 rounded-xl" />
        <div className="flex gap-1">
          <SkeletonBase className="w-8 h-8 rounded-lg" />
          <SkeletonBase className="w-8 h-8 rounded-lg" />
          <SkeletonBase className="w-8 h-8 rounded-lg" />
        </div>
      </div>

      {/* Title */}
      <SkeletonBase className="h-5 w-3/4 mb-2" />

      {/* Code */}
      <SkeletonBase className="h-4 w-1/3 mb-3" />

      {/* Description */}
      <SkeletonBase className="h-3 w-full mb-1" />
      <SkeletonBase className="h-3 w-2/3 mb-4" />

      {/* Teacher */}
      <div
        className="flex items-center gap-2 pt-4 border-t"
        style={{ borderColor: `${colors.border}30` }}
      >
        <SkeletonBase className="w-4 h-4 rounded" />
        <SkeletonBase className="h-3 w-24" />
      </div>

      {/* Button */}
      <SkeletonBase className="h-10 w-full rounded-xl mt-4" />
    </div>
  );
};

// Skeleton for grid of cards
export const CardGridSkeleton = ({ count = 6, columns = 3 }) => (
  <div
    className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-6`}
  >
    {Array.from({ length: count }).map((_, i) => (
      <SubjectCardSkeleton key={i} />
    ))}
  </div>
);

// Skeleton for detail page header
export const DetailHeaderSkeleton = () => {
  const { colors } = useTheme();

  return (
    <div className="mb-8">
      {/* Back button */}
      <SkeletonBase className="h-10 w-24 rounded-lg mb-6" />

      {/* Title section */}
      <div className="flex items-start gap-4">
        <SkeletonBase className="w-16 h-16 rounded-2xl" />
        <div className="flex-1">
          <SkeletonBase className="h-8 w-64 mb-2" />
          <SkeletonBase className="h-4 w-48 mb-1" />
          <SkeletonBase className="h-4 w-full max-w-md" />
        </div>
      </div>
    </div>
  );
};

// Skeleton for notification/simple list items
export const ListItemSkeleton = () => {
  const { colors } = useTheme();

  return (
    <div
      className="p-4 rounded-xl"
      style={{
        backgroundColor: colors.cardBg,
        border: `1px solid ${colors.border}30`,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <SkeletonBase className="h-4 w-48 mb-2" />
          <SkeletonBase className="h-3 w-full max-w-md" />
        </div>
        <div className="flex gap-2 ml-4">
          <SkeletonBase className="w-8 h-8 rounded-lg" />
          <SkeletonBase className="w-8 h-8 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

// Skeleton for list of items
export const ListSkeleton = ({ count = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <ListItemSkeleton key={i} />
    ))}
  </div>
);

// Page loading skeleton with header
export const PageSkeleton = ({ children }) => {
  const { isDarkMode, colors } = useTheme();

  return (
    <div
      className="min-h-screen p-4 md:p-6 lg:p-10 font-sans transition-colors"
      style={{
        backgroundColor: isDarkMode
          ? colors.background
          : `${colors.background}50`,
      }}
    >
      {/* Header skeleton */}
      <div className="flex flex-col gap-4 mb-6 md:mb-8">
        <div className="flex items-center gap-3">
          <SkeletonBase className="w-10 h-10 md:w-12 md:h-12 rounded-xl" />
          <SkeletonBase className="h-8 w-48 rounded" />
        </div>
      </div>

      {children}
    </div>
  );
};

// Main export - combined skeleton loader
const SkeletonLoader = {
  Table: TableSkeleton,
  TableRow: TableRowSkeleton,
  Card: CardSkeleton,
  CardList: CardListSkeleton,
  StatCard: StatCardSkeleton,
  SubjectCard: SubjectCardSkeleton,
  CardGrid: CardGridSkeleton,
  DetailHeader: DetailHeaderSkeleton,
  ListItem: ListItemSkeleton,
  List: ListSkeleton,
  Page: PageSkeleton,
  Base: SkeletonBase,
};

export default SkeletonLoader;
