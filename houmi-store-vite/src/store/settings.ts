
import { create } from "zustand";
import type { Settings } from "@/types";
import { phpFetch } from "@/lib/php-client";

interface SettingsState {
  settings: Settings | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setSettings: (settings: Settings) => void;
  fetchSettings: () => Promise<void>;
  updateExchangeRate: (rate: number) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  isLoading: false,
  error: null,

  setSettings: (settings: Settings) => {
    set({ settings });
  },

  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await phpFetch("admin/settings/get.php");
      
      if (!response.ok) {
        throw new Error("Failed to fetch settings");
      }
      
      const data = await response.json();
      set({ settings: data.settings, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unknown error",
        isLoading: false,
      });
    }
  },

  updateExchangeRate: async (rate: number) => {
    set({ isLoading: true, error: null });

    try {
      const response = await phpFetch("admin/settings/update.php", {
        method: "PUT",
        body: JSON.stringify({ exchangeRateUsdToVes: rate }),
      });

      if (!response.ok) {
        throw new Error("Failed to update exchange rate");
      }

      const data = await response.json();
      set({ settings: data.settings, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unknown error",
        isLoading: false,
      });
    }
  },
}));





