import { useAppSettings } from "@/context/app-settings-context";
import { useWidgetLayout } from "@/context/widget-layout-context";
import type { Widget, WidgetSize } from "@/context/widget-layout-context";
import { useState, useRef, useEffect } from "react";
import { FaGripVertical, FaTimes, FaWindowMaximize, FaWindowRestore } from "react-icons/fa";
import { Button } from "../ui/button";

interface WidgetContainerProps {
  widget: Widget;
  children: React.ReactNode;
  isBeingDragged?: boolean;
  dragHandleProps?: {
    onMouseDown: (e: React.MouseEvent) => void;
  };
}

export default function WidgetContainer({
  widget,
  children,
  isBeingDragged = false,
  dragHandleProps,
}: WidgetContainerProps) {
  const { settings } = useAppSettings();
  const { removeWidget, setWidgets } = useWidgetLayout();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [currentSize, setCurrentSize] = useState<WidgetSize>(widget.size);

  // Update local size when widget prop changes
  useEffect(() => {
    setCurrentSize(widget.size);
  }, [widget.size]);

  const handleResize = () => {
    // Cycle through all three sizes
    const sizes: WidgetSize[] = ['small', 'medium', 'large'];
    const currentIndex = sizes.indexOf(currentSize);
    const nextIndex = (currentIndex + 1) % sizes.length;
    const newSize = sizes[nextIndex];
    
    console.log('Resizing from', currentSize, 'to', newSize);
    
    // Update local state
    setCurrentSize(newSize);
    
    // Update context
    setWidgets(prev => prev.map(w => {
      if (w.id === widget.id) {
        return { ...w, size: newSize };
      }
      return w;
    }));
  };

  const isMainWidget = widget.type === 'tasks';

  return (
    <div
      ref={containerRef}
      className={`widget rounded-xl overflow-hidden transition-all duration-300 ${
        isBeingDragged
          ? "widget-dragging opacity-70 scale-95"
          : ""
      } ${
        settings.advancedMode
          ? "bg-slate-800/95 border border-slate-700/70"
          : "bg-white/95 backdrop-blur-lg border border-gray-200/50 shadow-lg"
      }`}
      style={{
        width: "100%",
        marginBottom: isBeingDragged ? "40px" : "0",
        transform: isBeingDragged ? "rotate(-1deg)" : "none",
        boxShadow: settings.advancedMode
          ? "none"
          : "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Widget Header */}
      <div
        className={`widget-header px-1.5 py-1.5 flex justify-between items-center border-b ${
          settings.advancedMode
            ? "bg-slate-800 border-slate-700/70 text-white"
            : "bg-gradient-to-r from-white to-gray-50 border-gray-200/50"
        }`}
      >
        <div className="flex items-center">
          <div
            className={`cursor-move p-1 mr-1 rounded-md transition-colors ${
              settings.advancedMode
                ? "hover:bg-slate-700/70 text-gray-300 hover:text-white"
                : "hover:bg-gray-100/80 text-gray-500 hover:text-gray-800"
            }`}
            {...dragHandleProps}
          >
            <FaGripVertical size={12} />
          </div>
          <h3
            className={`text-xs font-medium ${
              settings.advancedMode ? "text-gray-200" : "text-gray-700"
            }`}
          >
            {widget.title}
          </h3>
        </div>
        <div className="flex items-center space-x-1.5">
          {/* Toggle widget size button - only for non-main widgets */}
          {!isMainWidget && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleResize}
              className={`rounded-md transition-colors ${settings.advancedMode ? "hover:bg-slate-700/70 text-gray-300 hover:text-white" : "hover:bg-gray-100/80 text-gray-500 hover:text-gray-700"}`}
            >
              {currentSize === "large" ? (
                <FaWindowRestore className="text-base" />
              ) : (
                <FaWindowMaximize className="text-base" />
              )}
            </Button>
          )}

          {/* Remove button - only for non-main widgets */}
          {!isMainWidget && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeWidget(widget.id)}
              className={`rounded-md transition-colors ${settings.advancedMode ? "hover:bg-red-900/20 text-gray-300 hover:text-red-400" : "hover:bg-red-50 text-gray-500 hover:text-red-500"}`}
            >
              <FaTimes className="text-base" />
            </Button>
          )}
        </div>
      </div>

      {/* Widget Content */}
      <div className={`widget-content p-2 ${settings.advancedMode ? "text-gray-200" : ""}`}>
        {children}
      </div>
    </div>
  );
} 