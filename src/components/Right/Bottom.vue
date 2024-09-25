<script setup>
import { useAuthStore } from '@/stores/authStore';
import { useOrderStore } from '@/stores/OrderStore';
import AddManagerApprovalRequest from '../Popups/AddManagerApprovalRequest.vue';
import CommentPopup from '../Popups/CommentPopup.vue';
import { computed, ref, watch, onMounted } from 'vue';

const authStore = useAuthStore();
const orderStore = useOrderStore();

const showCommentPopup = ref(false);  // Control to show AddComment popup
const selectedItemForComment = ref(null); // Placeholder for selected item (in this case, overall discount)

// Local state to control the discount input field, defaulting to 0
const overallDiscountInput = ref(0);

// Backup and track previous overall discount values
const previousDiscount = ref(orderStore.state.overallDiscount);
const backupOverallDiscount = ref(orderStore.state.overallDiscount);

// Computed values for order total, GST, PST, and Discount
const gstAmount = computed(() => orderStore.getGstAmount);
const pstAmount = computed(() => orderStore.getPstAmount);

// Save overall discount to local storage
const saveOverallDiscountToLocalStorage = (discount) => {
  localStorage.setItem('overallDiscount', discount);
};

// Load overall discount from local storage on mount
const loadOverallDiscountFromLocalStorage = () => {
  const savedDiscount = localStorage.getItem('overallDiscount');
  if (savedDiscount) {
    orderStore.applyOverallDiscount(parseFloat(savedDiscount));
    previousDiscount.value = parseFloat(savedDiscount);
    overallDiscountInput.value = parseFloat(savedDiscount); // Set the input value to the loaded discount
  }
};

// Handle overall discount input with necessary checks
const handleOverallDiscountInput = (discount) => {
  const discountValue = parseFloat(discount);

  // Prevent negative discounts
  if (discountValue < 0 || isNaN(discountValue)) {
    orderStore.applyOverallDiscount(0); // Reset to 0 if negative or invalid
    saveOverallDiscountToLocalStorage(0); // Save reset value to local storage
    overallDiscountInput.value = 0; // Clear the input field (reset to 0)
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

  // Show the comment popup for manager to provide a reason
  selectedItemForComment.value = { 
    Name: 'Overall Discount', 
    discountPercentage: discountValue, 
    OriginalPrice: null 
  };
  showCommentPopup.value = true; // Show comment popup for manager comment
};

// Handle comment submission for overall discount
const handleCommentSubmitted = (comment) => {
  if (comment.trim()) {
    // Apply the overall discount and update the previous value
    orderStore.applyOverallDiscount(selectedItemForComment.value.discountPercentage);
    previousDiscount.value = selectedItemForComment.value.discountPercentage;
    saveOverallDiscountToLocalStorage(selectedItemForComment.value.discountPercentage); // Save to local storage

    // Reset overall discount input to 0 after applying the discount
    overallDiscountInput.value = 0; 
  } else {
    // If no comment, reset the discount to the backup value
    orderStore.applyOverallDiscount(backupOverallDiscount.value);
    saveOverallDiscountToLocalStorage(backupOverallDiscount.value); // Save reset value to local storage
    overallDiscountInput.value = 0; // Reset input field to 0
  }
  showCommentPopup.value = false; // Close the comment popup
};

// Reset overall discount if manager approval is denied
watch(() => authStore.isAddManagerApprovalRequest, (newVal) => {
  if (!newVal) {
    orderStore.applyOverallDiscount(backupOverallDiscount.value); // Restore backup if approval denied
    saveOverallDiscountToLocalStorage(backupOverallDiscount.value); // Save to local storage
    overallDiscountInput.value = 0; // Ensure input is reset to 0
  }
});

// Load the saved overall discount when the component is mounted
onMounted(() => {
  loadOverallDiscountFromLocalStorage(); // Load overall discount from local storage
});
</script>


<template>
  <div v-if="(authStore.isUserLoggedIn || authStore.isManagerLoggedIn)" class="flex flex-col justify-end" style="min-height: 50%;">
    <AddManagerApprovalRequest />
    <CommentPopup 
      v-if="showCommentPopup" 
      :item="selectedItemForComment" 
      @commentSubmitted="handleCommentSubmitted" 
      @close="showCommentPopup = false" 
    />

    <div class="flex items-center justify-between rounded-2xl bg-[#f4f5f7] mx-3 my-2 py-4 px-3">
      <p>Overall Discount</p>
      <input 
        type="number" 
        v-model="overallDiscountInput" 
        @blur="handleOverallDiscountInput($event.target.value)" 
        placeholder="Overall Discount (%)"
        min="0" 
        class="text-center w-20 rounded-lg"
      />
    </div>

    <div>
      <div class="flex items-center justify-between rounded-2xl bg-[#f4f5f7] mx-3 my-2 py-4 px-3">
        <p>GST:</p>
        <p>${{ gstAmount.toFixed(2) }}</p>
      </div>
      <div class="flex items-center justify-between rounded-2xl bg-[#f4f5f7] mx-3 my-2 py-4 px-3">
        <p>PST:</p>
        <p>${{ pstAmount.toFixed(2) }}</p>
      </div>
    </div>

    <div class="flex items-center justify-between rounded-2xl bg-[#f4f5f7] mx-3 my-2 py-4 px-3">
      <p>Total:</p>
      <p>${{ orderStore.getOrderTotal.toFixed(2) }}</p>
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