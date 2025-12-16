import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { FaChevronDown, FaCheck } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

/**
 * Custom Styled Dropdown Component
 * Uses React Portal to render dropdown menu outside DOM hierarchy
 * This prevents overflow:hidden from parent containers clipping the dropdown
 */
const CustomSelect = ({
  value,
  onChange,
  options,
  placeholder = "-- เลือก --",
  icon: Icon,
  label,
}) => {
  const { isDarkMode, colors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  // Find selected option
  const selectedOption = options.find((opt) => opt.value === value);

  // Calculate menu position when opening - smart positioning
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      const menuHeight = Math.min(options.length * 50, 250); // Estimate menu height

      // Decide: show below or above?
      const showAbove = spaceBelow < menuHeight && spaceAbove > spaceBelow;

      if (showAbove) {
        // Show above the trigger
        const maxHeight = Math.min(spaceAbove - 16, 250);
        setMenuStyle({
          position: "fixed",
          bottom: viewportHeight - rect.top + 8,
          left: rect.left,
          width: rect.width,
          maxHeight: maxHeight,
          zIndex: 999999,
        });
      } else {
        // Show below the trigger
        const maxHeight = Math.min(spaceBelow - 16, 250);
        setMenuStyle({
          position: "fixed",
          top: rect.bottom + 8,
          left: rect.left,
          width: rect.width,
          maxHeight: maxHeight,
          zIndex: 999999,
        });
      }
    }
  }, [isOpen, options.length]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target) &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on scroll (but not when scrolling inside dropdown menu)
  useEffect(() => {
    const handleScroll = (event) => {
      // Don't close if scrolling inside the dropdown menu
      if (menuRef.current && menuRef.current.contains(event.target)) {
        return;
      }
      if (isOpen) setIsOpen(false);
    };
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [isOpen]);

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  // Dropdown menu rendered via Portal
  const dropdownMenu =
    isOpen &&
    createPortal(
      <div
        ref={menuRef}
        className="rounded-xl overflow-hidden overflow-y-auto"
        style={{
          ...menuStyle,
          backgroundColor: isDarkMode ? colors.cardBg : "#FFFFFF",
          border: `1px solid ${isDarkMode ? colors.border : "#E5E7EB"}`,
          boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
        }}
      >
        {options.map((option, index) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleSelect(option.value)}
            className="w-full flex items-center justify-between px-4 py-3 text-left transition-all cursor-pointer"
            style={{
              backgroundColor:
                option.value === value
                  ? isDarkMode
                    ? `${colors.secondary}20`
                    : `${colors.secondary}10`
                  : "transparent",
              color: option.value === value ? colors.secondary : colors.text,
              borderBottom:
                index < options.length - 1
                  ? `1px solid ${isDarkMode ? colors.border : "#F3F4F6"}50`
                  : "none",
            }}
            onMouseEnter={(e) => {
              if (option.value !== value) {
                e.currentTarget.style.backgroundColor = isDarkMode
                  ? `${colors.border}30`
                  : "#F9FAFB";
              }
            }}
            onMouseLeave={(e) => {
              if (option.value !== value) {
                e.currentTarget.style.backgroundColor = "transparent";
              }
            }}
          >
            <div className="flex flex-col">
              <span className="font-medium text-sm">{option.label}</span>
              {option.sublabel && (
                <span
                  className="text-xs mt-0.5"
                  style={{ color: colors.textSecondary }}
                >
                  {option.sublabel}
                </span>
              )}
            </div>
            {option.value === value && (
              <FaCheck
                className="text-sm"
                style={{ color: colors.secondary }}
              />
            )}
          </button>
        ))}
      </div>,
      document.body
    );

  return (
    <div className="space-y-2">
      {/* Label */}
      {label && (
        <label
          className="text-xs font-medium flex items-center gap-2"
          style={{ color: colors.textSecondary }}
        >
          {Icon && <Icon />}
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all cursor-pointer font-medium text-left"
        style={{
          backgroundColor: isDarkMode ? colors.background : "#FFFFFF",
          border: value
            ? `2px solid ${colors.secondary}`
            : `1.5px solid ${isDarkMode ? colors.border : "#D1D5DB"}`,
          color: value ? colors.text : colors.textSecondary,
          boxShadow: isOpen
            ? `0 0 0 3px ${colors.secondary}30`
            : "0 1px 3px rgba(0,0,0,0.08)",
        }}
      >
        <span className={selectedOption ? "font-medium" : "opacity-70"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <FaChevronDown
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          style={{ color: colors.textSecondary }}
        />
      </button>

      {/* Portal-rendered dropdown menu */}
      {dropdownMenu}
    </div>
  );
};

export default CustomSelect;
