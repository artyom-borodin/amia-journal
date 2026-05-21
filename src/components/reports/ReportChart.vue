<template>
  <div class="chart-container">
    <Chart
      type="bar"
      :data="chartData"
      :options="chartOptions"
      class="h-30rem"
    />
  </div>
</template>

<script setup>
import { computed } from "vue";
import Chart from "primevue/chart";
import { APP_CONSTANTS } from "../../config/constants";

const props = defineProps({
  data: Array,
});

const chartData = computed(() => {
  return {
    labels: props.data.map((item) => item.full_name),
    datasets: [
      {
        label: APP_CONSTANTS.UI.LABELS.AVERAGE_MARK,
        backgroundColor: APP_CONSTANTS.CHART_COLORS.MARKS,
        data: props.data.map((item) => item.average_mark),
      },
      {
        label: APP_CONSTANTS.UI.LABELS.TOTAL_ABSENCES,
        backgroundColor: APP_CONSTANTS.CHART_COLORS.ABSENCES,
        data: props.data.map((item) => item.absences_count),
      },
    ],
  };
});

const chartOptions = {
  maintainAspectRatio: false,
  aspectRatio: APP_CONSTANTS.CHART_CONFIG.ASPECT_RATIO,
  plugins: {
    legend: {
      labels: { color: APP_CONSTANTS.CHART_COLORS.TEXT },
    },
  },
  scales: {
    x: {
      ticks: { color: APP_CONSTANTS.CHART_COLORS.TEXT },
      grid: { color: APP_CONSTANTS.CHART_COLORS.GRID },
    },
    y: {
      ticks: { color: APP_CONSTANTS.CHART_COLORS.TEXT },
      grid: { color: APP_CONSTANTS.CHART_COLORS.GRID },
    },
  },
};
</script>
