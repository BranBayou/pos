<script setup>
import { ref, nextTick, onMounted } from 'vue';
import { useOrderStore } from '@/stores/OrderStore';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale.css';

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

// Store the original price on component mount
onMounted(() => {
  props.items.forEach(item => {
    if (!item.OriginalPrice) {
      item.OriginalPrice = item.Price; // Store the original price
    }
  });
});

// Handle price input and calculate the discount percentage
const handlePriceInput = (item) => {
  if (item.Price < 0) {
    item.Price = 0;
  }
  item.Price = parseFloat(item.Price).toFixed(2);

  // Calculate the discount percentage based on the original price
  item.discountPercentage = ((item.OriginalPrice - item.Price) / item.OriginalPrice * 100).toFixed(2);
};

// Handle discount percentage input and adjust the price
const handleDiscountInput = (item) => {
  if (item.discountPercentage < 0) {
    item.discountPercentage = 0;
  }
  if (item.discountPercentage > 100) {
    item.discountPercentage = 100;
  }

  // Adjust the price based on the discount percentage
  item.Price = (item.OriginalPrice * (1 - item.discountPercentage / 100)).toFixed(2);
};

const checkManagerPermission = function() {
  console.log('Manager triggerd');
}

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
      <input 
        type="checkbox" 
        :checked="isOpen[index]" 
        @change="toggleAccordion(index)"
      />
      <div class="collapse-title text-xl font-medium flex justify-between items-center">
        <span class="absolute top-0 left-0 border-2 bg-purple-100 rounded-full flex items-center justify-center font-semibold w-5 h-5 text-center m-1 p-1">
          {{ item.qty }}
        </span>
        <div class="flex items-center gap-4">
          <img 
            :src="`https://replicagunsca.b-cdn.net/images/products/small/${item.ImageUrl}`"
            class="w-14 rounded-lg"
            alt="product-img"
          >
          <p class="text-base font-semibold">{{ item.Name }}</p>
        </div>
        <div class="">
          <p class="font-semibold">${{ (item.Price * item.qty).toFixed(2) }}</p>
          <p 
           v-if="item.discountPercentage"
           class="text-sm"
          >
           {{ item.discountPercentage }}% discount applied
          </p>
        </div>
      </div>

      <div class="collapse-content flex bg-white">
        <div class="collapse-left w-6/12">
          <div class="flex items-center space-x-2 w-full justify-center gap-5 pt-6">
            <Button 
              class="pi pi-minus p-button-rounded p-2 font-extrabold" 
              @click="orderStore.decrementOrderItem(item)" 
              style="font-size: 20px;" 
            />

            <input
              type="number"
              class="text-center no-arrows border-2 rounded-lg py-1"
              v-model.number="item.qty"  
              :min="1"                  
              :max="item.MaxQty"         
              @input="handleInput(item)"
            />

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
          <!-- Price input -->
          <input 
            type="number" 
            class="border-2 rounded-lg w-20 text-center py-1"
            v-model.number="item.Price"  
            :min="0"
            @input="handlePriceInput(item)"
            @blur="checkManagerPermission(item, 'price')" 
          />
        </span>

        <span class="flex items-center justify-start py-5 gap-2">
          <i class="pi pi-percentage" style="font-size: 24px;"></i>
          <!-- Discount percentage input -->
          <input 
            type="number" 
            class="border-2 rounded-lg w-28 text-center py-1" 
            v-model.number="item.discountPercentage"  
            :min="0"
            :max="100"
            @input="handleDiscountInput(item)"
            @blur="checkManagerPermission(item, 'discount')"
          />
        </span>
          <span class="flex items-center justify-start gap-2">
            <p class="font-semibold">GST</p>
            <p class="border-2 rounded-lg w-28 text-center py-1">0</p>
          </span>
          <span class="flex items-center justify-start gap-2">
            <p class="font-semibold">PST</p>
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
