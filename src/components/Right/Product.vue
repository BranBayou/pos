<script setup>
import { ref, nextTick, onMounted, watch } from 'vue';
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
  items: {
    type: Array,
    required: true,
  },
});

const isOpen = ref(Array(props.items.length).fill(false));
const showCommentPopup = ref(false);  // Control to show AddComment popup
const selectedItemForComment = ref(null);  // Track the selected item for which the comment is being added
const backupDiscountPercentage = ref(null);  // Backup discount percentage

function toggleAccordion(index) {
  isOpen.value[index] = !isOpen.value[index];
}

onMounted(() => {
  props.items.forEach(item => {
    if (!item.OriginalPrice) {
      item.OriginalPrice = item.Price;
    }
  });
});

const originalValues = ref({});

// Handle Price Input and update in the store
const handlePriceInput = (item) => {
  if (item.Price <= 0) {
    item.Price = item.OriginalPrice;
  }

  orderStore.updateDiscountPercentage(item, ((item.OriginalPrice - item.Price) / item.OriginalPrice * 100).toFixed(2));
};

const handleDiscountInput = (item) => {
  if (item.discountPercentage < 0) {
    item.discountPercentage = 0;
  }
  if (item.discountPercentage > 100) {
    item.discountPercentage = 100;
  }

  orderStore.updateDiscountPercentage(item, item.discountPercentage);
};

const storeOriginalValue = (key, item) => {
  if (!originalValues.value[item.Name]) {
    originalValues.value[item.Name] = {};
  }
  originalValues.value[item.Name][key] = item[key];
};

const checkValueChanged = (key, item) => {
  if (item[key] !== originalValues.value[item.Name]?.[key]) {
    checkManagerPermission(item);  // Trigger if value has changed
  }
};

// Trigger comment popup when manager approval is needed
const checkManagerPermission = function(item) {
  if (authStore.managerRole !== 'Manager') {
    backupDiscountPercentage.value = item.discountPercentage;  // Backup the current discount
    authStore.toggleAddManagerApprovalRequest();
    selectedItemForComment.value = item;  // Store the item for later comment
  } else {
    showCommentPopup.value = true;  // Show the AddComment popup
    selectedItemForComment.value = item;  // Set the selected item for the comment
  }
};

// Watch for manager login status and show comment popup
watch(() => authStore.isManagerLoggedIn, (newVal) => {
  if (newVal && selectedItemForComment.value) {
    selectedItemForComment.value.discountPercentage = backupDiscountPercentage.value;  // Restore the discount percentage
    showCommentPopup.value = true;  // Automatically show the comment popup after login
  }
});

// Handle the comment submission and approval
const handleCommentSubmitted = (data) => {
  console.log('Comment Submitted:', data);
  // Add logic here to handle discount approval after the comment is submitted
  showCommentPopup.value = false;
};

// Reset discount percentage if approval is not granted
watch(() => authStore.isAddManagerApprovalRequest, (newVal) => {
  if (!newVal) {
    props.items.forEach(item => {
      item.discountPercentage = 0;
      item.Price = item.OriginalPrice.toFixed(2);
    });
  }
});

nextTick(() => {
  tippy('#storeQuantity', {
    content: 'In Store Quantity',
  });
});
</script>

<template>
  <AddManagerApprovalRequest />
  <AddSales />
  <CommentPopup v-if="showCommentPopup" :item="selectedItemForComment" @commentSubmitted="handleCommentSubmitted" @close="showCommentPopup = false" />
  <div class="w-[95%] relative mx-auto flex flex-col gap-2">
    <div v-for="(item, index) in items" :key="index" class="collapse bg-base-200 rounded-2xl shadow-xl">
      <input type="checkbox" :checked="isOpen[index]" @change="toggleAccordion(index)" />
      <div class="collapse-title text-xl font-medium flex justify-between items-center">
        <span
          class="absolute top-0 left-0 border-2 bg-purple-100 rounded-full flex items-center justify-center font-semibold w-5 h-5 text-center m-1 p-1">
          {{ item.qty }}
        </span>
        <div class="flex items-center gap-4">
          <img :src="`https://replicagunsca.b-cdn.net/images/products/small/${item.ImageUrl}`" class="w-14 rounded-lg"
            alt="product-img" />
          <p class="text-base font-semibold">{{ item.Name }}</p>
        </div>
        <div>
          <p class="font-semibold">${{ (item.Price * item.qty).toFixed(2) }}</p>
          <p v-if="item.discountPercentage" class="text-sm">{{ item.discountPercentage }}% discount applied</p>
        </div>
      </div>

      <div class="collapse-content flex bg-white">
        <div class="collapse-left w-6/12 flex flex-col justify-between">
          <div class="flex items-center space-x-2 w-full justify-center gap-5 pt-6">
            <Button class="pi pi-minus p-button-rounded p-2 font-extrabold" @click="orderStore.decrementOrderItem(item)"
              style="font-size: 20px;" />
            <input type="number" class="text-center no-arrows border-2 rounded-lg py-1" v-model.number="item.qty"
              :min="1" :max="item.MaxQty" @input="handleInput(item)" />
            <Button class="pi pi-plus p-button-rounded font-extrabold p-2" @click="orderStore.incrementOrderItem(item)"
              style="font-size: 20px;" />
          </div>
          <p class="flex items-center space-x-2 w-full justify-center py-5">SKU: {{ item.Sku }}</p>

          <div class="flex items-center justify-center gap-5">
            <span id="storeQuantity" class="flex flex-col items-center">
              <i class="pi pi-shop" style="font-size: 32px;"></i>
              <p>{{ item.MaxQty }}</p>
            </span>
            <button 
             @click="authStore.toggleAddSalesPopup"
             class="flex flex-col items-center"
            >
              <i class="pi pi-user bg-purple-200 p-3 rounded-full" style="font-size: 20px;"></i>
              <p>{{ orderStore.selectedSalesPerson ? orderStore.selectedSalesPerson.name : 'No Salesperson Selected' }}</p>
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
              @blur="checkValueChanged('Price', item)"   
            />
          </span>
          
          <span class="flex items-center justify-start py-5 gap-2">
            <i class="pi pi-percentage" style="font-size: 24px;"></i>
            <input 
              type="number" 
              class="border-2 rounded-lg w-28 text-center py-1"
              v-model.number="item.discountPercentage" 
              :min="0" 
              :max="100" 
              @focus="storeOriginalValue('discountPercentage', item)"  
              @input="handleDiscountInput(item)"
              @blur="checkValueChanged('discountPercentage', item)"  
            />
          </span>

          <!-- Editable GST input, default set to 0.5 -->
          <span class="flex items-center justify-start gap-2">
            <p class="font-semibold">GST</p>
            <input type="number" class="border-2 rounded-lg w-28 text-center py-1" v-model.number="orderStore.state.gst"
              :min="0" :max="100" />
          </span>

          <!-- PST Input -->
          <span class="flex items-center justify-start gap-2 pt-5">
            <p class="font-semibold">PST</p>
            <input type="number" class="border-2 rounded-lg w-28 text-center py-1" v-model.number="orderStore.state.pst"
              :min="0" :max="100" />
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
