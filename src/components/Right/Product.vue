<script setup>
import { ref } from 'vue';
import InputNumber from 'primevue/inputnumber';

const value = ref(50);
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
    <div class="w-[95%] relative mx-auto flex flex-col gap-2">
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
        <div class="collapse-title text-xl font-medium flex justify-between bg-white">
          <span class="absolute top-0 border-2 bg-purple-100 rounded-full w-5 h-5 text-center">1</span>
          <img :src="item.imageUrl" alt="product-img">
          <h2>{{ item.Name }}</h2>
          <p>${{ item.Price }}</p>
        </div>
        <div class="collapse-content flex">
          <div class="collapse-left w-6/12">

            <div class="flex items-center space-x-2">
              <!-- Minus Button -->
              <Button class="pi pi-minus p-button-rounded" @click="decrement" />

              <!-- Input Number -->
              <input
                type="number"
                class="w-10 text-center no-arrows border-2 rounded-lg"
                v-model="value"
                @input="handleInput"
              />

              <!-- Plus Button -->
              <Button class="pi pi-plus p-button-rounded" @click="increment" />
            </div>

            <p>SKU: {{ item.Sku }}</p>

            <div class="flex items-center justify-between">
                <span class="flex flex-col">
                    <i class="pi pi-shop"></i>
                    {{ item.MaxQty }}
                </span>
                <span class="flex flex-col items-center">
                    <i class="pi pi-user bg-purple-200 p-3 rounded-full"></i>
                    <p class="">No Sales Person</p>
                </span>
            </div>
            
          </div>
          <div class="">
            <span class="flex items-center">
                <i class="pi pi-dollar"></i>
                <p>1.99</p>
            </span>
            <span class="flex items-center">
                <i class="pi pi-percentage"></i>
                <p>0</p>
            </span>
            <span>
                <p>0</p>
            </span>
          </div>
        </div>
      </div>
    </div>
  </template>
  

<style scoped>
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}

</style>
