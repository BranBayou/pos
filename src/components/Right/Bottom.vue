<script setup>
import { useAuthStore } from '@/stores/authStore';
import { useOrderStore } from '@/stores/OrderStore';
import AddManagerApprovalRequest from '../Popups/AddManagerApprovalRequest.vue';
import CommentPopup from '../Popups/CommentPopup.vue';
import { computed, ref, watch } from 'vue';

const authStore = useAuthStore();
const orderStore = useOrderStore();

const showCommentPopup = ref(false);  // Control to show AddComment popup

const previousDiscount = ref(orderStore.state.overallDiscount);
const backupOverallDiscount = ref(orderStore.state.overallDiscount);

// Computed values for order total, GST, PST, and Discount
const gstAmount = computed(() => orderStore.getGstAmount);
const pstAmount = computed(() => orderStore.getPstAmount);

// Handle overall discount input with necessary checks
const handleOverallDiscountInput = (discount) => {
  const discountValue = parseFloat(discount);

  // Prevent negative discounts
  if (discountValue < 0 || isNaN(discountValue)) {
    orderStore.state.overallDiscount = 0; // Reset to 0 if negative or invalid
    return; // Do nothing if invalid value
  }

  // Check if the discount has changed
  if (discountValue === previousDiscount.value) {
    return; // Do nothing if no changes
  }

  // If the user is not a manager, ask for manager approval
  if (!authStore.isManagerLoggedIn) {
    backupOverallDiscount.value = previousDiscount.value; // Backup the current discount
    authStore.toggleAddManagerApprovalRequest(); // Trigger manager approval request
    return; // Do not apply the discount without manager approval
  }

  // Apply the overall discount and update the previous value
  orderStore.applyOverallDiscount(discountValue);
  previousDiscount.value = discountValue;
};

// Reset overall discount if manager approval is denied
watch(() => authStore.isAddManagerApprovalRequest, (newVal) => {
  if (!newVal) {
    orderStore.applyOverallDiscount(backupOverallDiscount.value); // Restore backup if approval denied
  }
});
</script>

<template>
    <div v-if="(authStore.isUserLoggedIn || authStore.isManagerLoggedIn)" class="flex flex-col justify-end" style="min-height: 50%;">

      <AddManagerApprovalRequest />
      <CommentPopup v-if="showCommentPopup" :item="selectedItemForComment" @commentSubmitted="handleCommentSubmitted" @close="showCommentPopup = false" />
      
      <div class="flex items-center justify-between rounded-2xl bg-[#f4f5f7] mx-3 my-2 py-4 px-3">
        <p>Overall Discount</p>
        <input 
          type="number" 
          v-model.number="orderStore.state.overallDiscount" 
          @input="handleOverallDiscountInput($event.target.value)" 
          placeholder="Overall Discount (%)"
          min="0" 
          class="text-center w-20 rounded-lg"
        />
      </div>
      <div>
        <div class="flex items-center justify-between rounded-2xl bg-[#f4f5f7] mx-3 my-2 py-4 px-3">
          <p>GST</p>
          <p>${{ gstAmount.toFixed(2) }}</p>
        </div>
        <div class="flex items-center justify-between rounded-2xl bg-[#f4f5f7] mx-3 my-2 py-4 px-3">
          <p>PST</p>
          <p>${{ pstAmount.toFixed(2) }}</p>
        </div>
      </div>
      <div class="flex items-center justify-between rounded-2xl bg-[#f4f5f7] mx-3 my-2 py-4 px-3">
        <p>Total</p>
        <p>Total Price: ${{ orderStore.getOrderTotal.toFixed(2) }}</p>
      </div>
    </div>
  </template>
  
<style  scoped>
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style>