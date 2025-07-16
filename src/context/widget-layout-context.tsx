'use client';

import type React from 'react';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';

// Widget Types
export type WidgetType =
  | 'tasks'
  | 'pomodoro'
  | 'projects'
  | 'azanTimes'
  | 'notes'
  | 'progress';

// Widget Sizes
export type WidgetSize = 'small' | 'medium' | 'large';

// Widget Position
export interface WidgetPosition {
  x: number;
  y: number;
}

// Widget Interface
export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  size: WidgetSize;
  position: WidgetPosition;
  visible: boolean;
  order: number;
  config?: Record<string, any>; // For widget-specific configuration
}

// Widget Type Configuration
export interface WidgetTypeConfig {
  id: string;
  type: WidgetType;
  title: string;
  description: string;
  defaultSize: WidgetSize;
  minSize: WidgetSize;
  maxSize: WidgetSize;
  icon?: string;
  category: 'productivity' | 'worship' | 'utility';
}

// Context Type
interface WidgetContextType {
  widgets: Widget[];
  availableWidgets: WidgetTypeConfig[];
  addWidget: (type: WidgetType) => void;
  removeWidget: (id: string) => void;
  updateWidgetPosition: (id: string, position: WidgetPosition) => void;
  updateWidgetSize: (id: string, size: WidgetSize) => void;
  updateWidgetConfig: (id: string, config: Record<string, any>) => void;
  toggleWidgetSize: (id: string) => void;
  setWidgets: React.Dispatch<React.SetStateAction<Widget[]>>;
  isDragging: boolean;
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>;
}

// Widget Type Configurations
const widgetTypes: Record<WidgetType, WidgetTypeConfig> = {
  tasks: {
    id: 'tasks',
    type: 'tasks',
    title: 'Task Manager',
    description: 'Manage your daily tasks and to-dos',
    defaultSize: 'large',
    minSize: 'medium',
    maxSize: 'large',
    category: 'productivity',
  },
  pomodoro: {
    id: 'pomodoro',
    type: 'pomodoro',
    title: 'Pomodoro Timer',
    description: 'Focus timer with work and break intervals',
    defaultSize: 'medium',
    minSize: 'small',
    maxSize: 'medium',
    category: 'productivity',
  },
  projects: {
    id: 'projects',
    type: 'projects',
    title: 'Projects',
    description: 'Manage your long-term projects',
    defaultSize: 'medium',
    minSize: 'small',
    maxSize: 'large',
    category: 'productivity',
  },
  azanTimes: {
    id: 'azanTimes',
    type: 'azanTimes',
    title: 'Azan Times',
    description: 'View prayer times for your location',
    defaultSize: 'medium',
    minSize: 'small',
    maxSize: 'medium',
    category: 'worship',
  },
  notes: {
    id: 'notes',
    type: 'notes',
    title: 'Quick Notes',
    description: 'Take quick notes and reminders',
    defaultSize: 'medium',
    minSize: 'small',
    maxSize: 'large',
    category: 'utility',
  },
  progress: {
    id: 'progress',
    type: 'progress',
    title: 'Progress',
    description: 'Track your overall task completion',
    defaultSize: 'small',
    minSize: 'small',
    maxSize: 'medium',
    category: 'productivity',
  },
};

// Create Context
const WidgetLayoutContext = createContext<WidgetContextType | undefined>(undefined);

// Provider Component
export function WidgetLayoutProvider({ children }: { children: React.ReactNode }) {
  const [widgets, setWidgets] = useState<Widget[]>(() => {
    if (typeof window !== 'undefined') {
      const savedWidgets = localStorage.getItem('biome-widgets');
      if (savedWidgets) {
        try {
          return JSON.parse(savedWidgets);
        } catch (error) {
          console.error('Failed to parse saved widgets:', error);
        }
      }
    }

    // Default widgets
    return [
      {
        id: 'tasks',
        type: 'tasks',
        title: 'Task Manager',
        size: 'large',
        position: { x: 0, y: 0 },
        visible: true,
        order: 0,
        config: { fixedSize: true } // Mark main widget as fixed size
      },
      {
        id: 'pomodoro',
        type: 'pomodoro',
        title: 'Pomodoro Timer',
        size: 'medium',
        position: { x: 0, y: 1 },
        visible: true,
        order: 1,
      },
      {
        id: 'notes',
        type: 'notes',
        title: 'Quick Notes',
        size: 'medium',
        position: { x: 1, y: 1 },
        visible: true,
        order: 2,
      },
      {
        id: 'progress',
        type: 'progress',
        title: 'Progress',
        size: 'small',
        position: { x: 2, y: 1 },
        visible: true,
        order: 3,
      },
    ];
  });

  const [isDragging, setIsDragging] = useState(false);

  // Save widgets to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('biome-widgets', JSON.stringify(widgets));
    }
  }, [widgets]);

  // Calculate available widgets
  const availableWidgets = Object.values(widgetTypes).filter(
    (widgetType) => !widgets.some((w) => w.visible && w.type === widgetType.type)
  );

  // Add widget
  const addWidget = useCallback((type: WidgetType) => {
    const widgetType = widgetTypes[type];
    if (!widgetType) return;

    // Check if widget exists but is hidden
    const existingWidget = widgets.find((w) => w.type === type && !w.visible);
    if (existingWidget) {
      setWidgets((prev) =>
        prev.map((w) =>
          w.id === existingWidget.id ? { ...w, visible: true } : w
        )
      );
      return;
    }

    // Calculate position for new widget
    const maxY = Math.max(...widgets.map((w) => w.position.y), -1);
    const newPosition = { x: 0, y: maxY + 1 };

    // Create new widget
    const newWidget: Widget = {
      id: `${type}-${Date.now()}`,
      type,
      title: widgetType.title,
      size: widgetType.defaultSize,
      position: newPosition,
      visible: true,
      order: widgets.length,
    };

    setWidgets((prev) => [...prev, newWidget]);
  }, [widgets]);

  // Remove widget
  const removeWidget = useCallback((id: string) => {
    // Don't allow removing the task manager
    if (id === 'tasks') return;

    setWidgets((prev) =>
      prev.map((widget) =>
        widget.id === id ? { ...widget, visible: false } : widget
      )
    );
  }, []);

  // Update widget position
  const updateWidgetPosition = useCallback((id: string, position: WidgetPosition) => {
    setWidgets((prev) =>
      prev.map((widget) =>
        widget.id === id ? { ...widget, position } : widget
      )
    );
  }, []);

  // Update widget size
  const updateWidgetSize = useCallback((id: string, size: WidgetSize) => {
    console.log('Updating widget size:', { id, size });
    
    // Create a new array to ensure state update
    const newWidgets = widgets.map(widget => {
      if (widget.id === id) {
        console.log('Found widget to update:', widget);
        // Don't allow resizing the main widget
        if (widget.type === 'tasks') return widget;

        const widgetType = widgetTypes[widget.type];
        // Ensure size is within allowed range
        if (size < widgetType.minSize) size = widgetType.minSize;
        if (size > widgetType.maxSize) size = widgetType.maxSize;
        
        const updatedWidget = {
          ...widget,
          size,
          position: {
            ...widget.position,
            x: 0
          }
        };
        console.log('Updated widget:', updatedWidget);
        return updatedWidget;
      }
      return widget;
    });

    console.log('Setting new widgets state:', newWidgets);
    setWidgets(newWidgets);
  }, [widgets]);

  // Update widget configuration
  const updateWidgetConfig = useCallback((id: string, config: Record<string, any>) => {
    setWidgets((prev) =>
      prev.map((widget) =>
        widget.id === id ? { ...widget, config: { ...widget.config, ...config } } : widget
      )
    );
  }, []);

  // Toggle widget size
  const toggleWidgetSize = useCallback((id: string) => {
    setWidgets((prev) =>
      prev.map((widget) => {
        if (widget.id === id) {
          // Don't allow resizing if widget is marked as fixed size
          if (widget.config?.fixedSize) return widget;

          const widgetType = widgetTypes[widget.type];
          const sizes: WidgetSize[] = ['small', 'medium', 'large'];
          const currentSizeIndex = sizes.indexOf(widget.size);
          const nextSizeIndex = (currentSizeIndex + 1) % sizes.length;
          const nextSize = sizes[nextSizeIndex];
          
          // Ensure size is within allowed range
          if (nextSize < widgetType.minSize) return { ...widget, size: widgetType.minSize };
          if (nextSize > widgetType.maxSize) return { ...widget, size: widgetType.maxSize };
          return { ...widget, size: nextSize };
        }
        return widget;
      })
    );
  }, []);

  const value = {
    widgets,
    availableWidgets,
    addWidget,
    removeWidget,
    updateWidgetPosition,
    updateWidgetSize,
    updateWidgetConfig,
    toggleWidgetSize,
    setWidgets,
    isDragging,
    setIsDragging,
  };

  return (
    <WidgetLayoutContext.Provider value={value}>
      {children}
    </WidgetLayoutContext.Provider>
  );
}

// Hook
export function useWidgetLayout() {
  const context = useContext(WidgetLayoutContext);
  if (context === undefined) {
    throw new Error('useWidgetLayout must be used within a WidgetLayoutProvider');
  }
  return context;
} 