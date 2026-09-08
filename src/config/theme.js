import Aura from "@primevue/themes/aura";
import { definePreset } from "@primevue/themes";

const ACADEMY_BLUE = {
  50: "#eef3fa",
  100: "#d8e4f2",
  200: "#b3cbe4",
  300: "#84a9d4",
  400: "#5b8ac2",
  500: "#3d6fb0",
  600: "#2f5b9b",
  700: "#274c82",
  800: "#24416c",
  900: "#223a5c",
  950: "#16263d",
};

export const AcademyPreset = definePreset(Aura, {
  semantic: {
    primary: ACADEMY_BLUE,
  },
});
