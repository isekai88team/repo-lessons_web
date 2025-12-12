import React from "react";
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
import { FaGripVertical, FaTimes, FaPlus } from "react-icons/fa";

// Sortable Matching Pair Item
const SortablePairItem = ({
  id,
  index,
  pair,
  onLeftChange,
  onRightChange,
  onRemove,
  canRemove,
  isDarkMode,
  colors,
  inputStyle,
}) => {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-3 rounded-xl ${
        isDragging ? "shadow-lg" : ""
      }`}
    >
      {/* Drag Handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="p-2 rounded-lg cursor-grab active:cursor-grabbing hover:bg-gray-500/10"
        style={{ color: colors.textSecondary }}
      >
        <FaGripVertical />
      </button>

      {/* Index Badge */}
      <span
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
        style={{
          backgroundColor: "#F59E0B20",
          color: "#F59E0B",
        }}
      >
        {index + 1}
      </span>

      {/* Left Input */}
      <input
        value={pair.left}
        onChange={(e) => onLeftChange(e.target.value)}
        className="flex-1 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        style={inputStyle}
        placeholder="ข้อความด้านซ้าย..."
      />

      {/* Arrow */}
      <span style={{ color: colors.textSecondary }}>→</span>

      {/* Right Input */}
      <input
        value={pair.right}
        onChange={(e) => onRightChange(e.target.value)}
        className="flex-1 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        style={inputStyle}
        placeholder="คำตอบด้านขวา..."
      />

      {/* Remove Button */}
      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="p-2 rounded-lg hover:bg-red-500/20 transition"
          style={{ color: "#F87171" }}
        >
          <FaTimes />
        </button>
      )}
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

  const handleRemove = (index) => {
    const newPairs = pairs.filter((_, i) => i !== index);
    onChange(newPairs);
  };

  const handleAdd = () => {
    onChange([...pairs, { left: "", right: "" }]);
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
        ซ้าย = โจทย์ | ขวา = คำตอบ
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
