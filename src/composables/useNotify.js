import { useToast } from "primevue/usetoast";
import { APP_CONSTANTS } from "../config/constants";

export function useNotify() {
  const toast = useToast();

  const notifySuccess = (message) => {
    toast.add({
      severity: "success",
      summary: APP_CONSTANTS.UI.NOTIFY.SUCCESS_SUMMARY,
      detail: message,
      life: APP_CONSTANTS.NOTIFY.LIFE_MS,
    });
  };

  return { notifySuccess };
}
