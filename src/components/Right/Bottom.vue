<script setup>
import { useAuthStore } from '@/stores/authStore';
import { useOrderStore } from '@/stores/OrderStore';
import AddManagerApprovalRequest from '../Popups/AddManagerApprovalRequest.vue';
import CommentPopup from '../Popups/CommentPopup.vue';
import { computed, ref, watch } from 'vue';

const authStore = useAuthStore();
const orderStore = useOrderStore();

const showCommentPopup = ref(false);  // Control to show AddComment popup
const selectedItemForComment = ref(null);  // Track the selected overall discount for the comment
const backupOverallDiscount = ref(orderStore.state.overallDiscount);
const pendingApprovalDiscount = ref(null);  // Track if there is a pending approval for the overall discount
const isPopupCanceled = ref(false); // Track if the popup was canceled
const isCommentSubmitted = ref(false); // Track if the comment was successfully submitted

// Computed values for order total, GST, PST, and Discount
const gstAmount = computed(() => orderStore.getGstAmount);
const pstAmount = computed(() => orderStore.getPstAmount);
const orderTotal = computed(() => orderStore.getOrderTotal);

// Handle overall discount input with necessary checks
const handleOverallDiscountInput = (discount) => {
  const discountValue = parseFloat(discount);

  // Prevent negative discounts
  if (discountValue < 0 || isNaN(discountValue)) {
    orderStore.applyOverallDiscount(0); // Reset to 0 if negative or invalid
    return;
  }

  // Check if the discount has changed
  if (discountValue === backupOverallDiscount.value) {
    return; // Do nothing if no changes
  }

  // Backup current discount and set the pending approval discount
  backupOverallDiscount.value = orderStore.state.overallDiscount; // Always back up the current discount
  pendingApprovalDiscount.value = discountValue;  // Set the pending discount

  selectedItemForComment.value = { Name: 'Overall Discount', discountPercentage: discountValue }; // Track the discount for comment

  // If the user is not a manager, ask for manager approval
  if (!authStore.isManagerLoggedIn) {
    authStore.toggleAddManagerApprovalRequest(); // Trigger manager approval request
  } else {
    // If the manager is already logged in, show the comment popup
    showCommentPopup.value = true;
    isPopupCanceled.value = false;  // Reset popup cancel status
    isCommentSubmitted.value = false;  // Reset comment submitted status
  }
};

// Watch for manager login status and show comment popup if needed
watch(() => authStore.isManagerLoggedIn, (newVal) => {
  if (newVal && selectedItemForComment.value) {
    // If the manager logs in, show the comment popup
    showCommentPopup.value = true;
    isPopupCanceled.value = false;  // Reset popup cancel status
    isCommentSubmitted.value = false;  // Reset comment submitted status
  }
});

// Handle the comment submission and approval for the overall discount
const handleCommentSubmitted = (comment) => {
  if (comment.trim()) {
    // Apply the pending overall discount if a valid comment is provided
    if (pendingApprovalDiscount.value !== null) {
      orderStore.applyOverallDiscount(pendingApprovalDiscount.value);  
      backupOverallDiscount.value = pendingApprovalDiscount.value; 
      pendingApprovalDiscount.value = null;  
      isCommentSubmitted.value = true;  
    }
  } else {
    // If no comment is provided, reset the discount to 0
    orderStore.state.overallDiscount = 0;
    isCommentSubmitted.value = false; 
  }

  showCommentPopup.value = false; 
};

// Handle the popup closure (triggered by cancel button)
const handleCommentPopupCancel = () => {
  isPopupCanceled.value = true; 
  showCommentPopup.value = false; 
};


// Disable overall discount if any item has a discount
const isOverallDiscountDisabled = computed(() => {
  return orderStore.state.orderItems.some(item => item.discountPercentage > 0);
});
</script>

<template>
  <div v-if="(authStore.isUserLoggedIn || authStore.isManagerLoggedIn)" class="flex flex-col justify-end" style="min-height: 50%;"> 
    <AddManagerApprovalRequest />
    <CommentPopup 
      v-if="showCommentPopup" 
      :item="selectedItemForComment" 
      @commentSubmitted="handleCommentSubmitted" 
      @close="handleCommentPopupCancel" 
    />

    <div class="flex items-center justify-between rounded-2xl bg-[#f4f5f7] mx-3 my-2 py-4 px-3">
      <p>Overall Discount %</p>
      <input 
        type="number" 
        v-model.number="orderStore.state.overallDiscount" 
        @blur="handleOverallDiscountInput($event.target.value)" 
        placeholder="Overall Discount (%)"
        :min="0"
        class="text-center w-20 rounded-lg transition-colors duration-300"
        :class="{
          'bg-purple-500 opacity-30 text-white cursor-not-allowed': isOverallDiscountDisabled, 
          'bg-white': !isOverallDiscountDisabled 
        }"
        :disabled="isOverallDiscountDisabled"
      />
    </div>

    <div>
      <div class="flex items-center justify-between rounded-2xl bg-[#f4f5f7] mx-3 my-2 py-4 px-3">
        <p>GST %</p>
        <p>${{ gstAmount.toFixed(2) }}</p>
      </div>
      <div class="flex items-center justify-between rounded-2xl bg-[#f4f5f7] mx-3 my-2 py-4 px-3">
        <p>PST %</p>
        <p>${{ pstAmount.toFixed(2) }}</p>
      </div>
    </div>

    <div class="flex items-center justify-between rounded-2xl bg-[#f4f5f7] mx-3 my-2 py-4 px-3">
      <p>Total:</p>
      <p>${{ orderTotal.toFixed(2) }}</p>
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

