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
          <div class="w-6/12">
            <InputNumber 
              v-model="value" 
              showButtons 
              buttonLayout="horizontal" 
              :min="0" 
              :max="99"
              style="text-align: center !important;" 
              class="custom-input-number"
            >
              <template #incrementbuttonicon>
                  <span class="pi pi-plus" />
              </template>
              <template #decrementbuttonicon>
                  <span class="pi pi-minus" />
              </template>
            </InputNumber>
            <p>SKU {{ item.Sku }}</p>
            <div class="flex items-center justify-between">
                <span class="flex flex-col">
                    <i class="pi pi-shop"></i>
                    {{ item.MaxQty }}
                </span>
                <span class="flex flex-col items-center">
                    <i class="pi pi-user"></i>
                    <p>Sales Person</p>
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
          </div>
        </div>
      </div>
    </div>
  </template>
  

<style scoped>
.p-inputwrapper-filled .p-inputtext {
    width: 30px;
    text-align: center;
}
</style>
