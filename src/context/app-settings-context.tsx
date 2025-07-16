import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

// App settings interface
export interface AppSettings {
  advancedMode: boolean;
  theme: "light" | "dark" | "advanced";
}

// Default settings
const DEFAULT_APP_SETTINGS: AppSettings = {
  advancedMode: false,
  theme: "light",
};

// App settings storage key
const APP_SETTINGS_STORAGE_KEY = "muslim_task_manager_app_settings";

// Context type definition
interface AppSettingsContextType {
  settings: AppSettings;
  toggleAdvancedMode: () => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
}

// Create the context
const AppSettingsContext = createContext<AppSettingsContextType | null>(null);

// Hook for using the context
export const useAppSettings = () => {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error(
      "useAppSettings must be used within an AppSettingsProvider",
    );
  }
  return context;
};

// Helper functions for storage
const getAppSettings = (): AppSettings => {
  if (typeof window === "undefined") return DEFAULT_APP_SETTINGS;

  const settingsJson = localStorage.getItem(APP_SETTINGS_STORAGE_KEY);
  if (!settingsJson) return DEFAULT_APP_SETTINGS;

  try {
    return { ...DEFAULT_APP_SETTINGS, ...JSON.parse(settingsJson) };
  } catch (error) {
    console.error("Failed to parse app settings from localStorage", error);
    return DEFAULT_APP_SETTINGS;
  }
};

const saveAppSettings = (settings: AppSettings): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(APP_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
};

// Function to play toggle sound
const playToggleSound = (isAdvanced: boolean) => {
  if (typeof window === "undefined") return;

  const frequency = isAdvanced ? 520 : 440; // Hz
  const duration = 0.15; // seconds

  try {
    const audioContext = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gainNode.gain.value = 0.1;

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();

    // Fade out
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + duration,
    );

    // Stop after duration
    setTimeout(() => {
      oscillator.stop();
    }, duration * 1000);
  } catch (error) {
    console.error("Failed to play sound:", error);
  }
};

// Provider component
export const AppSettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<AppSettings>(getAppSettings());

  // Save settings to localStorage whenever they change
  useEffect(() => {
    saveAppSettings(settings);

    // Apply theme class to body when settings change
    if (typeof window !== "undefined") {
      const body = document.body;
      body.classList.remove("theme-light", "theme-dark", "theme-advanced");
      body.classList.add(`theme-${settings.theme}`);
    }
  }, [settings]);

  // Toggle advanced mode
  const toggleAdvancedMode = () => {
    const newAdvancedMode = !settings.advancedMode;

    // Play toggle sound
    playToggleSound(newAdvancedMode);

    // Update settings
    setSettings((prev) => ({
      ...prev,
      advancedMode: newAdvancedMode,
      theme: newAdvancedMode ? "advanced" : "light",
    }));

    // Add animation class to body
    if (typeof window !== "undefined") {
      const body = document.body;
      body.classList.add("mode-transition");
      setTimeout(() => {
        body.classList.remove("mode-transition");
      }, 1000); // Match this with the CSS animation duration
    }
  };

  // Update settings
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
    }));
  };

  return (
    <AppSettingsContext.Provider
      value={{
        settings,
        toggleAdvancedMode,
        updateSettings,
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
};
