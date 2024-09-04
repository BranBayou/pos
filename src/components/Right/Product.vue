<script setup>
import { ref } from 'vue';

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
});

// Create a reactive state to track which accordion is open
const isOpen = ref(Array(props.items.length).fill(false));

function toggleAccordion(index) {
  isOpen.value[index] = !isOpen.value[index];
}
</script>

<template>
    <div class="w-[95%] mx-auto flex flex-col gap-2">
      <div 
        v-for="(item, index) in items" 
        :key="index" 
        class="collapse bg-base-200 rounded-2xl shadow-xl"
      >
        <!-- Bind the checked attribute dynamically -->
        <input 
          type="checkbox" 
          :checked="isOpen[index]" 
          @change="toggleAccordion(index)"
        />
        <div class="collapse-title text-xl font-medium flex justify-between">
          <img :src="item.imageUrl" alt="product-img">
          <h2>{{ item.Name }}</h2>
          <p>${{ item.Price }}</p>
        </div>
        <div class="collapse-content">
          <p>hello</p>
        </div>
      </div>
    </div>
  </template>
  

<style scoped>
/* Your styles here */
</style>
