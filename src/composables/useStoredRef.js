import { ref, watch } from "vue";
import { storageUtils } from "../utils/storageUtils";

export function useStoredRef(storageKey, initialValue = null) {
  const state = ref(storageUtils.getJSON(storageKey) ?? initialValue);

  watch(state, (value) => {
    if (value == null) {
      storageUtils.removeItem(storageKey);
    } else {
      storageUtils.setJSON(storageKey, value);
    }
  });

  return state;
}
