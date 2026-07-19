import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SavedPropertiesState {
  savedByUser: Record<string, string[]>;
  toggleSaved: (userKey: string, propertyId: string) => boolean;
}

export const useSavedPropertiesStore = create<SavedPropertiesState>()(
  persist(
    (set) => ({
      savedByUser: {},
      toggleSaved: (userKey, propertyId) => {
        let isNowSaved = false;
        set((state) => {
          const current = state.savedByUser[userKey] ?? [];
          isNowSaved = !current.includes(propertyId);
          return {
            savedByUser: {
              ...state.savedByUser,
              [userKey]: isNowSaved
                ? [...current, propertyId]
                : current.filter((id) => id !== propertyId),
            },
          };
        });
        return isNowSaved;
      },
    }),
    { name: "propertyark-saved-properties" },
  ),
);
