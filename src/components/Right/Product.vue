<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useOrderStore } from '@/stores/OrderStore';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale.css';
import AddManagerApprovalRequest from '../Popups/AddManagerApprovalRequest.vue';
import CommentPopup from '../Popups/CommentPopup.vue';
import AddSales from '../Popups/AddSalesPerson.vue';

const authStore = useAuthStore();
const orderStore = useOrderStore();

// Props
const props = defineProps({
  order: {
    type: Object,
    required: true
  }
});

// Reactive variables
const isOpen = ref(Array(props.order.orderItems.length).fill(false));
const showCommentPopup = ref(false);
const selectedItemForComment = ref(null);
const backupDiscountPercentage = ref(null);
const selectedItemForSalesmen = ref(null);

function toggleAccordion(index) {
  isOpen.value[index] = !isOpen.value[index];
}

const handleAddSales = (item) => {
  selectedItemForSalesmen.value = item; 
  authStore.toggleAddSalesPopup();
};


// Computed property to check if overall discount is applied
const isOverallDiscountApplied = computed(() => props.order.overallDiscount > 0);

// Handle quantity changes and remove item if quantity is zero
function handleInput(item) {
  if (item.Qty > item.MaxQty) {
    item.Qty = item.MaxQty;
  }
  if (item.Qty === 0) {
    orderStore.deleteOrderItem(item);
  }
}

// Store the original values of an item for validation
const originalValues = ref({});

const storeOriginalValue = (key, item) => {
  if (!originalValues.value[item.ItemId]) {
    originalValues.value[item.ItemId] = {};
  }
  if (originalValues.value[item.ItemId][key] === undefined) {
    originalValues.value[item.ItemId][key] = item[key];
  }
};

const checkValueChanged = (key, item) => {
  const originalValue = parseFloat(originalValues.value[item.ItemId]?.[key] || 0);
  const currentValue = parseFloat(item[key] || 0);

  // Only trigger manager permission if the value has changed
  if (currentValue !== originalValue) {
    checkManagerPermission(item);
  }
};



// Handle price input and recalculate discount based on the original price
const handlePriceInput = (item) => {
  if (item.Price < 0) {
    item.Price = 0; // Prevent negative prices
  } else if (item.Price > item.OriginalPrice) {
    item.Price = item.OriginalPrice; // Cap the price to original
  }
  
  // Avoid applying discount while user is typing
  const discount = ((1 - item.Price / item.OriginalPrice) * 100).toFixed(2);
  item.Discount = discount > 0 ? discount : 0;

  // Delay store update until blur event
};


// Handle discount input and recalculate the price based on the original price
const handleDiscountInput = (item) => {
  if (item.Discount < 0) item.Discount = 0;
  if (item.Discount > 100) item.Discount = 100;
  item.Price = (item.OriginalPrice * (1 - item.Discount / 100)).toFixed(2);
  orderStore.updateDiscountPercentage(item, item.Discount);
};

// Watch for overall discount changes to update item prices in real time
watch(() => props.order.overallDiscount, () => {
  props.order.orderItems.forEach(item => {
    item.Price = (item.OriginalPrice * (1 - props.order.overallDiscount / 100)).toFixed(2);
  });
});

// Check for manager permission to approve the discount
const checkManagerPermission = (item) => {
  if (authStore.managerRole !== 'Manager') {
    backupDiscountPercentage.value = item.Discount;
    authStore.toggleAddManagerApprovalRequest();
    selectedItemForComment.value = item;
  } else {
    showCommentPopup.value = true;
    selectedItemForComment.value = item;
  }
};

// Watch for manager login and show comment popup if necessary
watch(() => authStore.isManagerLoggedIn, (newVal) => {
  if (newVal && selectedItemForComment.value) {
    selectedItemForComment.value.Discount = backupDiscountPercentage.value;
    showCommentPopup.value = true;
  }
});

// Initialize isOpen array when items change
watch(() => props.order.orderItems, (newItems) => {
  isOpen.value = newItems.map(() => false);
});

nextTick(() => {
  tippy('#storeQuantity', {
    content: 'In Store Quantity',
  });
});

const gstRate = computed({
  get() {
    return orderStore.state.taxes.find(tax => tax.type === 'GST').rate;
  },
  set(value) {
    // Update GST rate in the store
    orderStore.updateGstRate(value);  
  }
})
const pstRate = computed({
  get() {
    return orderStore.state.taxes.find(tax => tax.type === 'PST').rate;
  },
  set(value) {
    // Update PST rate in the store
    orderStore.updatePstRate(value);  
  }
});

</script>

<template>
  <AddManagerApprovalRequest 
   :item="selectedItemForComment" 
  />
  <AddSales :item="selectedItemForSalesmen" />
  <CommentPopup 
    v-if="showCommentPopup" 
    :item="selectedItemForComment" 
    @commentSubmitted="handleCommentSubmitted" 
    @close="showCommentPopup = false" 
  />
  <div class="w-[95%] relative mx-auto flex flex-col gap-2">
    <div v-for="(item, index) in order.orderItems" :key="index" class="collapse rounded-2xl bg-[#f4f5f7]">
      <input type="checkbox" :checked="isOpen[index]" @change="toggleAccordion(index)" />
      <div class="collapse-title text-md font-medium flex justify-between items-center p-0 px-3">
        <span class="absolute top-0 left-0 border-2 bg-purple-200 rounded-full flex items-center justify-center w-5 h-5 text-center text-black m-1 p-1">
          {{ item.Qty }}
        </span>
        <div class="flex items-center gap-4">
          <img :src="`https://replicagunsca.b-cdn.net/images/products/small/${item.ItemImage}`" class="w-14 rounded-lg"
            alt="product-img" />
          <p class="text-base font-medium">{{ item.ItemName }}</p>
        </div>
        <div class="flex flex-col items-end">
          <p class="font-medium">${{ (item.Price * item.Qty).toFixed(2) }}</p>
          <!-- Show discount percentage dynamically based on overall discount -->
          <p v-if="item.Discount" class="text-sm">
            {{ `${item.Discount} % discount applied` }}
          </p>
          <p v-if="order.overallDiscount" class="text-sm">
            {{ `${order.overallDiscount} % overall discount applied` }}
          </p>
        </div>
      </div>

      <div class="collapse-content flex bg-white">
        <div class="collapse-left w-6/12 flex flex-col justify-between">
          <div class="flex items-center space-x-2 w-full justify-center gap-5 pt-6">
            <Button class="pi pi-minus p-button-rounded p-2 font-extrabold hover:bg-purple-100 hover:rounded-lg" 
              @click="orderStore.decrementOrderItem(item)" style="font-size: 20px;" 
            />
            <input 
              type="number" 
              class="text-center no-arrows border-2 rounded-lg py-1" 
              v-model.number="item.Qty"
              :min="1" 
              :max="item.MaxQty" 
              @input="handleInput(item)" 
            />
            <Button class="pi pi-plus p-button-rounded font-extrabold p-2 hover:bg-purple-100 hover:rounded-lg" 
              @click="orderStore.incrementOrderItem(item)" style="font-size: 20px;" 
            />
          </div>
          <p class="flex items-center space-x-2 w-full justify-center py-5">SKU: {{ item.Sku }}</p>

          <div class="flex items-center justify-center gap-5">
            <span id="storeQuantity" class="flex flex-col items-center">
              <i class="pi pi-shop" style="font-size: 32px;"></i>
              <p>{{ item.MaxQty }}</p>
            </span>
            <button 
              @click="handleAddSales(item)"
              class="flex flex-col items-center"
            >
              <i class="pi pi-user bg-purple-200 p-3 rounded-full" style="font-size: 20px;"></i>
              <p>{{ item.SalesPersonId ? item.SalesPersonId.name : 'No Salesperson Selected' }}</p>
            </button>

          </div>
        </div>

        <div class="w-6/12 pt-6 flex flex-col items-center">
          <!-- Price and Discount Input -->
          <span class="flex items-center justify-start gap-2">
            <i class="pi pi-dollar" style="font-size: 24px;"></i>
            <input 
  type="number" 
  class="border-2 rounded-lg w-28 text-center py-1" 
  v-model.number="item.Price" 
  :min="0" 
  @focus="storeOriginalValue('Price', item)"  
  @input="handlePriceInput(item)" 
  @blur="() => {
    item.Price = parseFloat(item.Price).toFixed(2);
    checkValueChanged('Price', item); // Proper comparison before triggering
    orderStore.updateDiscountPercentage(item, item.Discount);
  }"
  :disabled="isOverallDiscountApplied"
  :class="{
    'bg-purple-500 opacity-30 text-white cursor-not-allowed': isOverallDiscountApplied,
    'bg-white': !isOverallDiscountApplied
  }"
/>

          </span>
          
          <span class="flex items-center justify-start py-5 gap-2">
            <i class="pi pi-percentage" style="font-size: 24px;"></i>
            <input 
              type="number" 
              class="border-2 rounded-lg w-28 text-center py-1"
              v-model.number="item.Discount" 
              :min="0" 
              :max="100" 
              @focus="storeOriginalValue('Discount', item)"  
              @input="handleDiscountInput(item)"
              @blur="checkValueChanged('Discount', item)" 
              :disabled="isOverallDiscountApplied"
              :class="{
                'bg-purple-500 opacity-30 text-white cursor-not-allowed': isOverallDiscountApplied,
                'bg-white': !isOverallDiscountApplied
              }" 
            />
          </span>

          <!-- Editable GST input, default set to 5% -->
         <span class="flex items-center justify-start gap-2">
           <p class="font-semibold">GST</p>
           <input 
             type="number" 
             class="border-2 rounded-lg w-28 text-center py-1" 
             v-model.number="gstRate" 
             @input="updateGstRate(gstRate)" 
             :min="0" 
             :max="100"
           />
         </span>
     
         <!-- PST Input, default set to 7% -->
         <span class="flex items-center justify-start gap-2 pt-5">
           <p class="font-semibold">PST</p>
           <input 
             type="number" 
             class="border-2 rounded-lg w-28 text-center py-1" 
             v-model.number="pstRate" 
             @input="updatePstRate(pstRate)" 
             :min="0" 
             :max="100"
           />
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
