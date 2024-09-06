<script setup>
import { ref, nextTick } from 'vue';
import { useOrderStore } from '@/stores/OrderStore';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale.css';

// Get the order store
const orderStore = useOrderStore();

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

// Handle input to limit quantity within the allowed range
const handleInput = (item) => {
  if (item.qty > item.MaxQty) {
    item.qty = item.MaxQty;
  }
  if (item.qty < 1) {
    item.qty = 1;
  }
};

// Handle input for price to accept decimals and prevent negative numbers
const handlePriceInput = (item) => {
  if (item.Price < 0) {
    item.Price = 0;
  }
  // Automatically rounds the price to 2 decimal places
  item.Price = parseFloat(item.Price).toFixed(2);
};

// Use nextTick to ensure the DOM is updated before initializing tippy
nextTick(() => {
  tippy('#storeQuantity', {
    content: 'In Store Quantity',
  });
});
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
      <div class="collapse-title text-xl font-medium flex justify-between items-center">
        <!-- Show the quantity in the badge -->
        <span class="absolute top-0 left-0 border-2 bg-purple-100 rounded-full flex items-center justify-center font-semibold w-5 h-5 text-center m-1 p-1">
          {{ item.qty }}
        </span>
        <div class="flex items-center gap-4">
          <img 
            :src="`https://replicagunsca.b-cdn.net/images/products/small/${item.ImageUrl}`"
            class="w-14 rounded-lg"
            alt="product-img"
          >
          <p>{{ item.Name }}</p>
        </div>

        <!-- Total Price (Price * Quantity), this will react to price changes -->
        <p>${{ (item.Price * item.qty).toFixed(2) }}</p>
      </div>

      <div class="collapse-content flex bg-white">
        <div class="collapse-left w-6/12">
          <div class="flex items-center space-x-2 w-full justify-center gap-5 pt-6">
            <!-- Minus Button -->
            <Button 
              class="pi pi-minus p-button-rounded p-2 font-extrabold" 
              @click="orderStore.decrementOrderItem(item)" 
              style="font-size: 20px;" 
            />

            <!-- Input Number for Quantity -->
            <input
              type="number"
              class="text-center no-arrows border-2 rounded-lg py-1"
              v-model.number="item.qty"  
              :min="1"                  
              :max="item.MaxQty"         
              @input="handleInput(item)"
            />

            <!-- Plus Button -->
            <Button 
              class="pi pi-plus p-button-rounded font-extrabold p-2" 
              @click="orderStore.incrementOrderItem(item)" 
              style="font-size: 20px;" 
            />
          </div>

          <p class="flex items-center space-x-2 w-full justify-center py-5">SKU: {{ item.Sku }}</p>

          <div class="flex items-center justify-center gap-5">
            <span id="storeQuantity" class="flex flex-col items-center">
              <i class="pi pi-shop" style="font-size: 32px;"></i>
              <p>{{ item.MaxQty }}</p>
            </span>
            <span class="flex flex-col items-center">
              <i class="pi pi-user bg-purple-200 p-3 rounded-full" style="font-size: 20px;"></i>
              <p class="">No Sales Person</p>
            </span>
          </div>
        </div>

        <div class="w-6/12 pt-6 flex flex-col items-center">
          <span class="flex items-center justify-start gap-2">
            <i class="pi pi-dollar" style="font-size: 24px;"></i>
            <!-- Editable Price Input -->
            <input 
              type="number" 
              step="0.01" 
              class="border-2 rounded-lg w-20 text-center py-1"
              v-model.number="item.Price"  
              :min="0"               
              @input="handlePriceInput(item)"
            />
          </span>

          <span class="flex items-center justify-start py-5 gap-2">
            <i class="pi pi-percentage" style="font-size: 24px;"></i>
            <p class="border-2 rounded-lg w-20 text-center py-1">0</p>
          </span>

          <span class="flex items-center justify-start">
            <i style="font-size: 24px;"></i>
            <p class="border-2 rounded-lg w-28 text-center py-1">0</p>
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
