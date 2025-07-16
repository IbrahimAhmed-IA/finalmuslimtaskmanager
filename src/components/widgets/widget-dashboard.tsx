import AzanTimes from "@/components/azan/azan-times";
import ProjectManager from "@/components/task-manager/project-manager";
import TaskManager from "@/components/task-manager/task-manager";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAppSettings } from "@/context/app-settings-context";
import { useTaskContext } from "@/context/task-context";
import { useWidgetLayout } from "@/context/widget-layout-context";
import type { Widget, WidgetType } from "@/context/widget-layout-context";
import { useState, useEffect, useMemo } from "react";
import { FaCheckCircle, FaSort, FaUndoAlt, FaPlus, FaTimes } from "react-icons/fa";
import NotesWidget from "./notes-widget";
import PomodoroWidget from "./pomodoro-widget";
import WidgetContainer from "./widget-container";
import RepeatTaskModal from "../task-manager/modals/repeat-task-modal";

export default function WidgetDashboard() {
  const { widgets, availableWidgets, addWidget, setWidgets, isDragging, setIsDragging } =
    useWidgetLayout();
  const { settings } = useAppSettings();
  const { getOverallProgress, uncheckAllTasks, sortTasks, selectedTasks, setSelectedTasks } = useTaskContext();
  const [draggingWidget, setDraggingWidget] = useState<string | null>(null);
  const [showAddWidgets, setShowAddWidgets] = useState(false);
  const [gridColumns, setGridColumns] = useState(2);
  const [containerWidth, setContainerWidth] = useState(0);
  const [showRepeatModal, setShowRepeatModal] = useState(false);

  const handleRepeatTasks = () => {
    if (!selectedTasks || selectedTasks.length === 0) return;
    setShowRepeatModal(true);
  };

  // Update grid columns based on screen width
  useEffect(() => {
    const updateGridColumns = () => {
      const width = window.innerWidth - 80; // account for sidebar width
      setContainerWidth(width);
      if (width >= 1600) {
        setGridColumns(4);
      } else if (width >= 1200) {
        setGridColumns(3);
      } else if (width >= 800) {
        setGridColumns(2);
      } else {
        setGridColumns(1);
      }
    };

    updateGridColumns();
    window.addEventListener('resize', updateGridColumns);
    return () => window.removeEventListener('resize', updateGridColumns);
  }, []);

  // Sort widgets by position and filter visible ones
  const sortedWidgets = useMemo(() => {
    return [...widgets]
      .filter((w) => w.visible)
      .sort((a, b) => {
        if (a.position.y === b.position.y) {
          return a.position.x - b.position.x;
        }
        return a.position.y - b.position.y;
      });
  }, [widgets]);

  // Render widget content based on type
  const renderWidgetContent = (widget: Widget) => {
    switch (widget.type) {
      case "tasks":
        return <TaskManager />;
      case "pomodoro":
        return <PomodoroWidget />;
      case "projects":
        return <ProjectManager />;
      case "azanTimes":
        return <AzanTimes />;
      case "notes":
        return <NotesWidget />;
      case "progress":
        return (
          <div className="flex flex-col items-center">
            <div className={`text-xl font-bold mb-2 ${settings.advancedMode ? "text-white" : "text-gray-800"}`}>
              {getOverallProgress()}%
            </div>
            <Progress
              value={getOverallProgress()}
              className={`h-3 w-full rounded-full ${settings.advancedMode ? "bg-slate-700/60" : "bg-gray-100"}`}
            />
            <div className={`text-[11px] mt-1 ${settings.advancedMode ? "text-slate-400" : "text-gray-500"}`}>
              Overall Task Completion
            </div>
          </div>
        );
      default:
        return <div className="text-white">Widget content not available</div>;
    }
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, widgetId: string) => {
    setDraggingWidget(widgetId);
    setIsDragging(true);
    e.dataTransfer.setData("text/plain", widgetId);
    e.dataTransfer.effectAllowed = "move";

    // Create custom drag image
    const dragImage = document.createElement("div");
    dragImage.classList.add(
      "opacity-80",
      "pointer-events-none",
      "py-2",
      "px-3",
      "border",
      settings.advancedMode ? "border-blue-500/50" : "border-indigo-400/50",
      settings.advancedMode ? "bg-slate-800/90" : "bg-white/90",
      "rounded-lg",
      "shadow-lg",
      "flex",
      "items-center",
      "gap-2"
    );

    const icon = document.createElement("span");
    icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>`;
    icon.className = settings.advancedMode ? "text-blue-400" : "text-indigo-500";

    const text = document.createElement("span");
    text.textContent = "Moving Widget";
    text.className = settings.advancedMode ? "text-gray-200 text-sm font-medium" : "text-gray-700 text-sm font-medium";

    dragImage.appendChild(icon);
    dragImage.appendChild(text);
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);

    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, targetWidgetId: string) => {
    e.preventDefault();
    if (draggingWidget === targetWidgetId) return;

    const draggedWidget = widgets.find((w) => w.id === draggingWidget);
    const targetWidget = widgets.find((w) => w.id === targetWidgetId);
    if (!draggedWidget || !targetWidget) return;

    // Calculate new position
    const newPosition = { ...targetWidget.position };

    // Update widget positions
    setWidgets((prev) =>
      prev.map((widget) => {
        if (widget.id === draggingWidget) {
          return { ...widget, position: newPosition };
        }
        if (widget.id === targetWidgetId) {
          return { ...widget, position: draggedWidget.position };
        }
        return widget;
      })
    );
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggingWidget(null);
    setIsDragging(false);
  };

  // Handle adding a new widget
  const handleAddWidget = (type: WidgetType) => {
    addWidget(type);
  };

  // Toggle the add widgets panel
  const toggleAddWidgets = () => {
    setShowAddWidgets(!showAddWidgets);
  };

  if (!settings.advancedMode) {
    return null;
  }

  return (
    <div className={`widget-dashboard ${settings.advancedMode ? 'px-0 w-full' : 'px-1'} relative`}>
      {/* Remove header row if only Add Widget button */}
      {/* Widgets Layout */}
      <div className={`flex flex-col gap-2 ${settings.advancedMode ? 'w-full' : ''}`}> 
        {/* Main Widget (Task Manager) */}
        {sortedWidgets
          .filter(widget => widget.type === 'tasks')
          .map(widget => (
            <div
              key={widget.id}
              draggable
              onDragStart={(e) => handleDragStart(e, widget.id)}
              onDragOver={(e) => handleDragOver(e, widget.id)}
              onDragEnd={handleDragEnd}
              className={settings.advancedMode ? 'w-full' : 'w-full'}
              style={settings.advancedMode ? {maxWidth: '100%'} : {}}
            >
              <WidgetContainer
                widget={widget}
                isBeingDragged={draggingWidget === widget.id}
                dragHandleProps={{
                  onMouseDown: (e: React.MouseEvent) => {
                    e.stopPropagation();
                  },
                }}
              >
                {renderWidgetContent(widget)}
              </WidgetContainer>
            </div>
          ))}
        {/* Other Widgets */}
        <div className="grid gap-2" style={{
          gridTemplateColumns: 'repeat(3, 1fr)',
        }}>
          {sortedWidgets
            .filter(widget => widget.type !== 'tasks')
            .map((widget) => {
              // Calculate grid span based on size
              const gridSpan = widget.size === 'large' ? 3 : 
                             widget.size === 'medium' ? 2 : 1;

              return (
                <div
                  key={widget.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, widget.id)}
                  onDragOver={(e) => handleDragOver(e, widget.id)}
                  onDragEnd={handleDragEnd}
                  style={{
                    gridColumn: `span ${gridSpan}`,
                  }}
                >
                  <WidgetContainer
                    widget={widget}
                    isBeingDragged={draggingWidget === widget.id}
                    dragHandleProps={{
                      onMouseDown: (e: React.MouseEvent) => {
                        e.stopPropagation();
                      },
                    }}
                  >
                    {renderWidgetContent(widget)}
                  </WidgetContainer>
                </div>
              );
            })}
        </div>
      </div>
      {/* Floating Add Widget Button at bottom right */}
      {availableWidgets.length > 0 && (
        <div className="fixed bottom-8 right-8 z-40">
          <Button
            onClick={toggleAddWidgets}
            size="icon"
            className={`rounded-full shadow-lg ${settings.advancedMode ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}
            aria-label={showAddWidgets ? "Hide Widget Options" : "Add Widgets"}
          >
            {showAddWidgets ? <FaTimes size={20} /> : <FaPlus size={20} />}
          </Button>
          {showAddWidgets && (
            <div className={`absolute bottom-14 right-0 z-50 rounded-xl p-4 transition-all duration-300 shadow-lg min-w-[220px] ${
              settings.advancedMode
                ? "bg-slate-800/90 backdrop-blur-sm border border-slate-700/70"
                : "bg-white/95 backdrop-blur-sm border border-gray-200/50"
            }`}>
              <h2 className={`text-sm font-medium mb-2 ${settings.advancedMode ? "text-white" : "text-gray-800"}`}>Available Widgets</h2>
              <div className="grid grid-cols-1 gap-2 mb-2">
                {availableWidgets.map((widget) => (
                  <button
                    key={widget.id}
                    onClick={() => handleAddWidget(widget.type)}
                    className={`flex items-center justify-start p-2 rounded-lg text-xs transition-all duration-200 w-full text-left ${
                      settings.advancedMode
                        ? "bg-slate-700/80 border border-slate-600/50 text-white hover:bg-slate-600 hover:scale-[1.03]"
                        : "bg-gray-50 border border-gray-200 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 hover:scale-[1.03]"
                    }`}
                  >
                    <FaPlus className={`mr-2 ${settings.advancedMode ? "text-blue-400" : "text-indigo-500"}`} size={10} />
                    {widget.title}
                  </button>
                ))}
              </div>
              <div className="border-t border-slate-600/40 my-2" />
              <div className={`text-xs font-semibold mb-1 ${settings.advancedMode ? "text-slate-400" : "text-gray-500"}`}>Actions</div>
              <div className="flex flex-col gap-1">
                <button
                  className="flex items-center px-3 py-2 text-xs rounded hover:bg-slate-700/60 hover:text-blue-300 transition-colors"
                  onClick={uncheckAllTasks}
                >
                  <FaUndoAlt className="mr-2 text-base" /> Uncheck All Tasks
                </button>
                <button
                  className="flex items-center px-3 py-2 text-xs rounded hover:bg-slate-700/60 hover:text-blue-300 transition-colors"
                  onClick={handleRepeatTasks}
                  disabled={!selectedTasks || selectedTasks.length === 0}
                >
                  <FaCheckCircle className="mr-2 text-base" /> Repeat {selectedTasks && selectedTasks.length > 0 ? `(${selectedTasks.length})` : ""}
                </button>
                <button
                  className="flex items-center px-3 py-2 text-xs rounded hover:bg-slate-700/60 hover:text-blue-300 transition-colors"
                  onClick={sortTasks}
                >
                  <FaSort className="mr-2 text-base" /> Sort & Organize
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {/* RepeatTaskModal for floating menu */}
      <RepeatTaskModal
        isOpen={showRepeatModal}
        onClose={() => setShowRepeatModal(false)}
        taskIds={selectedTasks}
        onTasksRepeated={() => {
          setSelectedTasks([]);
          setShowRepeatModal(false);
        }}
      />
    </div>
  );
} 