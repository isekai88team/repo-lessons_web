import React, { useState } from "react";
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
import { FaTimes, FaGripVertical, FaSearchPlus } from "react-icons/fa";

// Image Preview Modal - Fullscreen view
const ImagePreviewModal = ({ isOpen, image, onClose }) => {
  if (!isOpen || !image) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative max-w-full max-h-full">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-3 bg-white/20 hover:bg-white/30 rounded-full text-white transition-all"
        >
          <FaTimes size={20} />
        </button>

        {/* Image */}
        <img
          src={image}
          alt="Full Preview"
          className="max-w-[95vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />

        {/* Hint text */}
        <p className="text-center text-white/70 text-sm mt-4">
          คลิกที่ใดก็ได้เพื่อปิด
        </p>
      </div>
    </div>
  );
};

// Render content (text + optional image) with preview capability
const ContentDisplay = ({
  text,
  image,
  className = "",
  size = "normal",
  onImageClick,
}) => {
  if (!text && !image) return <span className="italic opacity-50">-</span>;

  // Determine image size classes based on context
  const imageSizeClasses = {
    small: "h-12 sm:h-16 w-auto",
    normal: "h-20 sm:h-24 w-auto",
    large: "h-24 sm:h-32 w-auto",
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {image && (
        <div className="relative group">
          <img
            src={image}
            alt="Content"
            className={`${
              imageSizeClasses[size] || imageSizeClasses.normal
            } rounded-lg object-cover mb-1 cursor-pointer hover:opacity-90 transition-opacity`}
            onClick={(e) => {
              e.stopPropagation();
              onImageClick?.(image);
            }}
          />
          {/* Preview icon overlay */}
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onImageClick?.(image);
            }}
          >
            <FaSearchPlus className="text-white text-xl sm:text-2xl" />
          </div>
        </div>
      )}
      {text && <span className="text-sm sm:text-base">{text}</span>}
    </div>
  );
};

// Draggable Answer Item
const DraggableAnswer = ({
  id,
  answer,
  answerImage,
  isUsed,
  isDarkMode,
  colors,
  onImageClick,
}) => {
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
      className={`p-3 sm:p-4 rounded-xl font-medium transition-all flex items-center gap-2 ${
        !isUsed
          ? "cursor-grab active:cursor-grabbing hover:scale-105"
          : "opacity-40 cursor-not-allowed"
      }`}
    >
      {!isUsed && <FaGripVertical className="text-purple-400 flex-shrink-0" />}
      {isUsed ? (
        <s>
          <ContentDisplay
            text={answer}
            image={answerImage}
            size="small"
            onImageClick={onImageClick}
          />
        </s>
      ) : (
        <ContentDisplay
          text={answer}
          image={answerImage}
          size="normal"
          onImageClick={onImageClick}
        />
      )}
    </div>
  );
};

// Drop Zone for each left item
const DropZone = ({
  index,
  leftText,
  leftImage,
  matchedAnswer,
  matchedImage,
  onClear,
  isDarkMode,
  colors,
  isOver,
  onImageClick,
}) => {
  return (
    <div
      className={`flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl transition-all ${
        isOver ? "scale-[1.02]" : ""
      }`}
      style={{
        backgroundColor:
          matchedAnswer || matchedImage
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
          matchedAnswer || matchedImage
            ? "#22c55e"
            : isOver
            ? "#8B5CF6"
            : colors.border
        }`,
        minHeight: leftImage ? "auto" : "70px",
      }}
    >
      {/* Row 1: Number + Content */}
      <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 w-full">
        <span
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0"
          style={{ backgroundColor: "#F59E0B", color: "#FFF" }}
        >
          {index + 1}
        </span>
        <div
          className="flex-1 font-medium min-w-0"
          style={{ color: colors.text }}
        >
          <ContentDisplay
            text={leftText}
            image={leftImage}
            size="large"
            onImageClick={onImageClick}
          />
        </div>
      </div>

      {/* Row 2: Arrow + Answer */}
      <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto pl-9 sm:pl-0">
        <span
          className="hidden sm:inline"
          style={{ color: colors.textSecondary }}
        >
          →
        </span>
        {matchedAnswer || matchedImage ? (
          <div className="flex items-center gap-2 flex-1 sm:flex-none">
            <div
              className="px-3 sm:px-4 py-2 rounded-lg font-medium flex-1 sm:flex-none"
              style={{ backgroundColor: "#22c55e", color: "#FFF" }}
            >
              <ContentDisplay
                text={matchedAnswer}
                image={matchedImage}
                size="small"
                onImageClick={onImageClick}
              />
            </div>
            <button
              onClick={onClear}
              className="p-2 rounded-full hover:bg-red-500/20 flex-shrink-0"
              style={{ color: "#ef4444" }}
            >
              <FaTimes size={14} />
            </button>
          </div>
        ) : (
          <span
            className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm"
            style={{
              backgroundColor: `${colors.border}40`,
              color: colors.textSecondary,
            }}
          >
            ลากมาวางที่นี่
          </span>
        )}
      </div>
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
  const [activeId, setActiveId] = useState(null);
  const [overId, setOverId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const usedAnswers = Object.values(matchingAnswers || {}).filter(Boolean);

  // Build answer map with images
  const answerDataMap = {};
  pairs?.forEach((p) => {
    const key = p.right || p.rightImage || `img-${p.rightImage}`;
    answerDataMap[key] = { text: p.right, image: p.rightImage };
  });

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

  // Get matched answer data
  const getMatchedData = (answerId) => {
    if (!answerId) return { text: null, image: null };
    return answerDataMap[answerId] || { text: answerId, image: null };
  };

  // Image preview handler
  const handleImageClick = (image) => {
    setPreviewImage(image);
  };

  return (
    <>
      {/* Image Preview Modal */}
      <ImagePreviewModal
        isOpen={!!previewImage}
        image={previewImage}
        onClose={() => setPreviewImage(null)}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Left Column - Questions (Drop Zones) */}
          <div className="space-y-2 sm:space-y-3">
            <p
              className="text-xs sm:text-sm font-medium mb-2"
              style={{ color: colors.textSecondary }}
            >
              📋 โจทย์ (ลากคำตอบมาวาง)
            </p>
            <SortableContext
              items={pairs?.map((_, i) => `drop-${i}`) || []}
              strategy={verticalListSortingStrategy}
            >
              {pairs?.map((pair, i) => {
                const matched = getMatchedData(matchingAnswers?.[i]);
                return (
                  <DropZoneWrapper
                    key={`drop-${i}`}
                    id={`drop-${i}`}
                    index={i}
                    leftText={pair.left}
                    leftImage={pair.leftImage}
                    matchedAnswer={matched.text}
                    matchedImage={matched.image}
                    onClear={() => onMatchingAnswer(i, "")}
                    isDarkMode={isDarkMode}
                    colors={colors}
                    isOver={overId === `drop-${i}`}
                    onImageClick={handleImageClick}
                  />
                );
              })}
            </SortableContext>
          </div>

          {/* Right Column - Answers (Draggable) */}
          <div className="space-y-2 sm:space-y-3">
            <p
              className="text-xs sm:text-sm font-medium mb-2"
              style={{ color: colors.textSecondary }}
            >
              🎯 คำตอบ (ลากไปวาง)
            </p>
            <SortableContext
              items={shuffledAnswers || []}
              strategy={verticalListSortingStrategy}
            >
              {shuffledAnswers?.map((answerId) => {
                const isUsed = usedAnswers.includes(answerId);
                const data = answerDataMap[answerId] || {
                  text: answerId,
                  image: null,
                };
                return (
                  <DraggableAnswer
                    key={answerId}
                    id={answerId}
                    answer={data.text}
                    answerImage={data.image}
                    isUsed={isUsed}
                    isDarkMode={isDarkMode}
                    colors={colors}
                    onImageClick={handleImageClick}
                  />
                );
              })}
            </SortableContext>
          </div>
        </div>

        <DragOverlay>
          {activeId ? (
            <div
              className="p-3 sm:p-4 rounded-xl font-medium shadow-lg"
              style={{
                backgroundColor: "#8B5CF6",
                color: "#FFF",
                transform: "scale(1.05)",
              }}
            >
              <ContentDisplay
                text={answerDataMap[activeId]?.text || activeId}
                image={answerDataMap[activeId]?.image}
                size="normal"
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </>
  );
};

// Wrapper to make drop zones droppable
const DropZoneWrapper = ({
  id,
  index,
  leftText,
  leftImage,
  matchedAnswer,
  matchedImage,
  onClear,
  isDarkMode,
  colors,
  isOver,
  onImageClick,
}) => {
  const { setNodeRef } = useSortable({ id });

  return (
    <div ref={setNodeRef}>
      <DropZone
        index={index}
        leftText={leftText}
        leftImage={leftImage}
        matchedAnswer={matchedAnswer}
        matchedImage={matchedImage}
        onClear={onClear}
        isDarkMode={isDarkMode}
        colors={colors}
        isOver={isOver}
        onImageClick={onImageClick}
      />
    </div>
  );
};

export default MatchingQuestion;
