import { ref } from "vue";
import { storageUtils } from "../utils/storageUtils";

const HIDE_VALUE = "1";

export function useHelpDialog(storageKey) {
  const showHelpDialog = ref(false);
  let shownThisSession = false;

  const openHelp = () => {
    showHelpDialog.value = true;
  };

  const handleHelpConfirm = (dontShow) => {
    showHelpDialog.value = false;
    if (dontShow) {
      storageUtils.setItem(storageKey, HIDE_VALUE);
    }
  };

  const maybeShowHelp = (hasData) => {
    if (
      !shownThisSession &&
      hasData &&
      storageUtils.getItem(storageKey) !== HIDE_VALUE
    ) {
      shownThisSession = true;
      showHelpDialog.value = true;
    }
  };

  return { showHelpDialog, openHelp, handleHelpConfirm, maybeShowHelp };
}
