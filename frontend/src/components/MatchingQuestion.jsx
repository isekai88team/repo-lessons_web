import React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FaTimes, FaGripVertical } from "react-icons/fa";

// Draggable Answer Item
const DraggableAnswer = ({ id, answer, isUsed, isDarkMode, colors }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: isUsed });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: isUsed
      ? `${colors.border}30`
      : isDarkMode
      ? "#8B5CF620"
      : "#EDE9FE",
    border: `2px solid ${isUsed ? "transparent" : "#8B5CF6"}`,
    color: isUsed ? colors.textSecondary : "#8B5CF6",
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-4 rounded-xl font-medium transition-all flex items-center gap-2 ${
        !isUsed
          ? "cursor-grab active:cursor-grabbing hover:scale-105"
          : "opacity-40 cursor-not-allowed"
      }`}
    >
      {!isUsed && <FaGripVertical className="text-purple-400" />}
      {isUsed ? <s>{answer}</s> : answer}
    </div>
  );
};

// Drop Zone for each left item
const DropZone = ({
  index,
  leftText,
  matchedAnswer,
  onClear,
  isDarkMode,
  colors,
  isOver,
}) => {
  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-xl transition-all ${
        isOver ? "scale-105" : ""
      }`}
      style={{
        backgroundColor: matchedAnswer
          ? isDarkMode
            ? "#22c55e20"
            : "#dcfce7"
          : isOver
          ? isDarkMode
            ? "#8B5CF620"
            : "#EDE9FE"
          : isDarkMode
          ? colors.background
          : "#F8F9FA",
        border: `2px dashed ${
          matchedAnswer ? "#22c55e" : isOver ? "#8B5CF6" : colors.border
        }`,
        minHeight: "70px",
      }}
    >
      <span
        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
        style={{ backgroundColor: "#F59E0B", color: "#FFF" }}
      >
        {index + 1}
      </span>
      <span className="flex-1 font-medium" style={{ color: colors.text }}>
        {leftText}
      </span>
      <span style={{ color: colors.textSecondary }}>→</span>
      {matchedAnswer ? (
        <div className="flex items-center gap-2">
          <span
            className="px-4 py-2 rounded-lg font-medium"
            style={{ backgroundColor: "#22c55e", color: "#FFF" }}
          >
            {matchedAnswer}
          </span>
          <button
            onClick={onClear}
            className="p-1 rounded-full hover:bg-red-500/20"
            style={{ color: "#ef4444" }}
          >
            <FaTimes size={12} />
          </button>
        </div>
      ) : (
        <span
          className="px-4 py-2 rounded-lg text-sm"
          style={{
            backgroundColor: `${colors.border}40`,
            color: colors.textSecondary,
          }}
        >
          ลากมาวางที่นี่
        </span>
      )}
    </div>
  );
};

const MatchingQuestion = ({
  pairs,
  shuffledAnswers,
  matchingAnswers,
  onMatchingAnswer,
  isDarkMode,
  colors,
}) => {
  const [activeId, setActiveId] = React.useState(null);
  const [overId, setOverId] = React.useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const usedAnswers = Object.values(matchingAnswers || {}).filter(Boolean);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event) => {
    const { over } = event;
    setOverId(over?.id || null);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);

    if (over && over.id.toString().startsWith("drop-")) {
      const dropIndex = parseInt(over.id.toString().replace("drop-", ""));
      const answer = active.id;
      onMatchingAnswer(dropIndex, answer);
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setOverId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Questions (Drop Zones) */}
        <div className="space-y-3">
          <p
            className="text-sm font-medium mb-2"
            style={{ color: colors.textSecondary }}
          >
            📋 โจทย์ (ลากคำตอบมาวาง)
          </p>
          <SortableContext
            items={pairs?.map((_, i) => `drop-${i}`) || []}
            strategy={verticalListSortingStrategy}
          >
            {pairs?.map((pair, i) => (
              <DropZoneWrapper
                key={`drop-${i}`}
                id={`drop-${i}`}
                index={i}
                leftText={pair.left}
                matchedAnswer={matchingAnswers?.[i]}
                onClear={() => onMatchingAnswer(i, "")}
                isDarkMode={isDarkMode}
                colors={colors}
                isOver={overId === `drop-${i}`}
              />
            ))}
          </SortableContext>
        </div>

        {/* Right Column - Answers (Draggable) */}
        <div className="space-y-3">
          <p
            className="text-sm font-medium mb-2"
            style={{ color: colors.textSecondary }}
          >
            🎯 คำตอบ (ลากไปวาง)
          </p>
          <SortableContext
            items={shuffledAnswers || []}
            strategy={verticalListSortingStrategy}
          >
            {shuffledAnswers?.map((answer, idx) => {
              const isUsed = usedAnswers.includes(answer);
              return (
                <DraggableAnswer
                  key={answer}
                  id={answer}
                  answer={answer}
                  isUsed={isUsed}
                  isDarkMode={isDarkMode}
                  colors={colors}
                />
              );
            })}
          </SortableContext>
        </div>
      </div>

      <DragOverlay>
        {activeId ? (
          <div
            className="p-4 rounded-xl font-medium shadow-lg"
            style={{
              backgroundColor: "#8B5CF6",
              color: "#FFF",
              transform: "scale(1.05)",
            }}
          >
            {activeId}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

// Wrapper to make drop zones droppable
const DropZoneWrapper = ({
  id,
  index,
  leftText,
  matchedAnswer,
  onClear,
  isDarkMode,
  colors,
  isOver,
}) => {
  const { setNodeRef } = useSortable({ id });

  return (
    <div ref={setNodeRef}>
      <DropZone
        index={index}
        leftText={leftText}
        matchedAnswer={matchedAnswer}
        onClear={onClear}
        isDarkMode={isDarkMode}
        colors={colors}
        isOver={isOver}
      />
    </div>
  );
};

export default MatchingQuestion;
