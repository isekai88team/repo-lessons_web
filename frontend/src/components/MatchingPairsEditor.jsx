import React, { useRef } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FaGripVertical, FaTimes, FaPlus, FaImage } from "react-icons/fa";

// Sortable Matching Pair Item
const SortablePairItem = ({
  id,
  index,
  pair,
  onLeftChange,
  onRightChange,
  onLeftImageChange,
  onRightImageChange,
  onRemoveLeftImage,
  onRemoveRightImage,
  onRemove,
  canRemove,
  isDarkMode,
  colors,
  inputStyle,
}) => {
  const leftInputRef = useRef(null);
  const rightInputRef = useRef(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getImageSrc = (image) => {
    if (!image) return null;
    if (image instanceof File) return URL.createObjectURL(image);
    return image;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3 rounded-xl ${isDragging ? "shadow-lg" : ""}`}
    >
      <div className="flex items-start gap-2">
        {/* Drag Handle */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="p-2 rounded-lg cursor-grab active:cursor-grabbing hover:bg-gray-500/10 mt-1"
          style={{ color: colors.textSecondary }}
        >
          <FaGripVertical />
        </button>

        {/* Index Badge */}
        <span
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1"
          style={{
            backgroundColor: "#F59E0B20",
            color: "#F59E0B",
          }}
        >
          {index + 1}
        </span>

        {/* Left Side (Question) - Text + Optional Image */}
        <div className="flex-1 space-y-2">
          <input
            value={pair.left || ""}
            onChange={(e) => onLeftChange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            style={inputStyle}
            placeholder="ข้อความด้านซ้าย (ถ้ามี)..."
          />

          {/* Left Image */}
          {pair.leftImage || pair.leftImageFile ? (
            <div className="relative inline-block">
              <img
                src={getImageSrc(pair.leftImageFile || pair.leftImage)}
                alt="Left"
                className="h-16 w-auto rounded-lg border object-cover"
                style={{ borderColor: colors.border }}
              />
              <button
                type="button"
                onClick={onRemoveLeftImage}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full text-xs"
              >
                <FaTimes />
              </button>
            </div>
          ) : (
            <>
              <input
                ref={leftInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    onLeftImageChange(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => leftInputRef.current?.click()}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs transition"
                style={{
                  backgroundColor: `${colors.border}30`,
                  color: colors.textSecondary,
                }}
              >
                <FaImage /> เพิ่มรูป (ถ้ามี)
              </button>
            </>
          )}
        </div>

        {/* Arrow */}
        <span className="mt-3" style={{ color: colors.textSecondary }}>
          →
        </span>

        {/* Right Side (Answer) - Text + Optional Image */}
        <div className="flex-1 space-y-2">
          <input
            value={pair.right || ""}
            onChange={(e) => onRightChange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            style={inputStyle}
            placeholder="คำตอบด้านขวา (ถ้ามี)..."
          />

          {/* Right Image */}
          {pair.rightImage || pair.rightImageFile ? (
            <div className="relative inline-block">
              <img
                src={getImageSrc(pair.rightImageFile || pair.rightImage)}
                alt="Right"
                className="h-16 w-auto rounded-lg border object-cover"
                style={{ borderColor: colors.border }}
              />
              <button
                type="button"
                onClick={onRemoveRightImage}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full text-xs"
              >
                <FaTimes />
              </button>
            </div>
          ) : (
            <>
              <input
                ref={rightInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    onRightImageChange(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => rightInputRef.current?.click()}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs transition"
                style={{
                  backgroundColor: `${colors.border}30`,
                  color: colors.textSecondary,
                }}
              >
                <FaImage /> เพิ่มรูป (ถ้ามี)
              </button>
            </>
          )}
        </div>

        {/* Remove Button */}
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-2 rounded-lg hover:bg-red-500/20 transition mt-1"
            style={{ color: "#F87171" }}
          >
            <FaTimes />
          </button>
        )}
      </div>
    </div>
  );
};

const MatchingPairsEditor = ({
  pairs,
  onChange,
  isDarkMode,
  colors,
  inputStyle,
  minPairs = 2,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Generate unique IDs for each pair
  const pairsWithIds = pairs.map((pair, index) => ({
    ...pair,
    id: `pair-${index}`,
  }));

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = pairsWithIds.findIndex((p) => p.id === active.id);
      const newIndex = pairsWithIds.findIndex((p) => p.id === over.id);

      const newPairs = arrayMove(pairs, oldIndex, newIndex);
      onChange(newPairs);
    }
  };

  const handleLeftChange = (index, value) => {
    const newPairs = [...pairs];
    newPairs[index] = { ...newPairs[index], left: value };
    onChange(newPairs);
  };

  const handleRightChange = (index, value) => {
    const newPairs = [...pairs];
    newPairs[index] = { ...newPairs[index], right: value };
    onChange(newPairs);
  };

  const handleLeftImageChange = (index, file) => {
    const newPairs = [...pairs];
    newPairs[index] = { ...newPairs[index], leftImageFile: file };
    onChange(newPairs);
  };

  const handleRightImageChange = (index, file) => {
    const newPairs = [...pairs];
    newPairs[index] = { ...newPairs[index], rightImageFile: file };
    onChange(newPairs);
  };

  const handleRemoveLeftImage = (index) => {
    const newPairs = [...pairs];
    newPairs[index] = {
      ...newPairs[index],
      leftImage: "",
      leftImageFile: null,
    };
    onChange(newPairs);
  };

  const handleRemoveRightImage = (index) => {
    const newPairs = [...pairs];
    newPairs[index] = {
      ...newPairs[index],
      rightImage: "",
      rightImageFile: null,
    };
    onChange(newPairs);
  };

  const handleRemove = (index) => {
    const newPairs = pairs.filter((_, i) => i !== index);
    onChange(newPairs);
  };

  const handleAdd = () => {
    onChange([
      ...pairs,
      { left: "", right: "", leftImage: "", rightImage: "" },
    ]);
  };

  return (
    <div>
      <label
        className="text-sm font-medium flex items-center gap-2"
        style={{ color: colors.textSecondary }}
      >
        🎯 คู่จับคู่ (ลากเพื่อสลับลำดับ)
      </label>
      <p className="text-xs mb-3" style={{ color: colors.textSecondary }}>
        ใส่ข้อความ หรือ รูปภาพ หรือทั้งสองอย่างก็ได้
      </p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={pairsWithIds.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          <div
            className="space-y-2 p-3 rounded-xl"
            style={{
              backgroundColor: isDarkMode
                ? "rgba(255,255,255,0.03)"
                : "#F8F9FA",
            }}
          >
            {pairsWithIds.map((pair, index) => (
              <SortablePairItem
                key={pair.id}
                id={pair.id}
                index={index}
                pair={pair}
                onLeftChange={(value) => handleLeftChange(index, value)}
                onRightChange={(value) => handleRightChange(index, value)}
                onLeftImageChange={(file) => handleLeftImageChange(index, file)}
                onRightImageChange={(file) =>
                  handleRightImageChange(index, file)
                }
                onRemoveLeftImage={() => handleRemoveLeftImage(index)}
                onRemoveRightImage={() => handleRemoveRightImage(index)}
                onRemove={() => handleRemove(index)}
                canRemove={pairs.length > minPairs}
                isDarkMode={isDarkMode}
                colors={colors}
                inputStyle={inputStyle}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add Button */}
      <button
        type="button"
        onClick={handleAdd}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm mt-3 transition hover:scale-105"
        style={{
          backgroundColor: `${colors.primary}20`,
          color: colors.primary,
        }}
      >
        <FaPlus /> เพิ่มคู่
      </button>
    </div>
  );
};

export default MatchingPairsEditor;
