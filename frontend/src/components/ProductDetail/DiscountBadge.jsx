import React from "react";

export default function DiscountBadge({
  percent,
  position = "left",
  variant = "rebaja",
  size = "md",
}) {
  const positionClasses = {
    left: "top-2 left-2",
    right: "top-2 right-2",
    "top-left": "top-2 left-2",
    "top-right": "top-2 right-2",
  };

  const sizeClasses = {
    sm: "text-[10px] px-2 py-0.5",
    md: "text-xs px-3 py-1",
    lg: "text-sm px-4 py-1.5",
  };

  if (variant === "percentage") {
    return (
      <div
        className={`absolute ${positionClasses[position]} bg-[#557051] text-white font-bold rounded-full z-10 shadow-md ${sizeClasses[size]}`}
      >
        -{percent}%
      </div>
    );
  }

  return (
    <div
      className={`absolute ${positionClasses[position]} bg-red-600 text-white font-bold rounded-md z-10 shadow-md uppercase tracking-wide ${sizeClasses[size]}`}
    >
      OFERTA
    </div>
  );
}