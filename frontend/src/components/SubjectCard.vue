<template>
  <div 
    class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 cursor-pointer border border-gray-200"
    @click="$emit('select', item)"
  >
    <div class="text-sm font-semibold text-blue-600 mb-1">Группа: {{ item.groupName }}</div>
    <h3 class="text-lg font-bold text-gray-900">{{ item.subjectName }}</h3>
  </div>
</template>

<script setup>
defineProps({
  item: {
    type: Object,
    required: true
  }
});

defineEmits(['select']);
</script>