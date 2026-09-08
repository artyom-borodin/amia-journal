<template>
  <div class="layout-wrapper">
    <NavBar />
    <main class="dashboard-main">
      <h1 class="dashboard-title">{{ APP_CONSTANTS.UI.DASHBOARD_TITLE }}</h1>

      <div v-if="continueLabel" class="continue-container">
        <Button
          :label="continueLabel"
          icon="pi pi-history"
          severity="success"
          class="continue-btn"
          @click="goTo(APP_CONSTANTS.ROUTES.JOURNAL)"
        />
      </div>

      <div class="cards-container">
        <Button
          v-for="card in dashboardCards"
          :key="card.route"
          :label="card.label"
          :icon="card.icon"
          :severity="card.severity"
          :disabled="card.disabled"
          class="dashboard-btn"
          @click="goTo(card.route)"
        />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import NavBar from "../components/NavBar.vue";
import { APP_CONSTANTS } from "../config/constants";
import { useDictionaryStore } from "../store/dictionaryStore";
import { storageUtils } from "../utils/storageUtils";

const router = useRouter();
const dictionaryStore = useDictionaryStore();

const lastGroupId = ref(null);
const lastSubjectId = ref(null);

const continueLabel = computed(() => {
  if (lastGroupId.value == null || lastSubjectId.value == null) return "";
  const groupName =
    (dictionaryStore.dicts.groups || []).find((g) => g.id === lastGroupId.value)
      ?.group_name || "";
  const subjectName =
    dictionaryStore.dictsMap.subjects[lastSubjectId.value]?.subject_name || "";
  const place = [groupName, subjectName]
    .filter(Boolean)
    .join(APP_CONSTANTS.FORMATTING.SEPARATOR);
  if (!place) return "";
  return `${APP_CONSTANTS.UI.LABELS.CONTINUE}: ${place}`;
});

const dashboardCards = [
  {
    route: APP_CONSTANTS.ROUTES.JOURNAL,
    label: APP_CONSTANTS.UI.LABELS.JOURNAL,
    icon: "pi pi-book",
    severity: null,
  },
  {
    route: APP_CONSTANTS.ROUTES.REPORTS,
    label: APP_CONSTANTS.UI.LABELS.REPORTS,
    icon: "pi pi-chart-bar",
    severity: "info",
  },
  {
    route: APP_CONSTANTS.ROUTES.ATTENDANCE,
    label: APP_CONSTANTS.UI.LABELS.ATTENDANCE,
    icon: "pi pi-calendar-times",
    severity: "warning",
  },
];

const goTo = (route) => {
  router.push(route);
};

onMounted(async () => {
  await dictionaryStore.fetchDictionaries();
  lastGroupId.value = storageUtils.getJSON(
    APP_CONSTANTS.STORAGE_KEYS.JOURNAL_GROUP,
  );
  lastSubjectId.value = storageUtils.getJSON(
    APP_CONSTANTS.STORAGE_KEYS.JOURNAL_SUBJECT,
  );
});
</script>
