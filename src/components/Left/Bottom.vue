<script setup>
import { useAuthStore } from '@/stores/authStore';
import { useOrderStore } from '@/stores/OrderStore';
import Checkout from '../Popups/Checkout.vue';
import { computed } from 'vue';
import { useToast } from 'vue-toastification';
const toast = useToast();

const orderStore = useOrderStore();
const authStore = useAuthStore();

const totalItems = computed(() => {
  // Ensure that orderItems is always treated as an array
  return Array.isArray(orderStore.getOrderItems) 
    ? orderStore.getOrderItems.reduce((total, item) => total + item.qty, 0) 
    : 0;
});

const totalSkus = computed(() => {
  if (Array.isArray(orderStore.getOrderItems)) {
    const skus = orderStore.getOrderItems.map(item => item.Sku);
    return new Set(skus).size; // Using Set to get unique SKUs
  }
  return 0;
});


// Function to handle checkout popup visibility
function handleCheckoutPopup() {
  if (totalItems.value > 0) {
    authStore.toggleCheckoutPopup(); // Only show the popup if there are items in the cart
  } else {
    toast.error('Please add order items before checking out.');
  }
}
</script>

<template>
  <div class="bg-white w-full rounded-2xl flex items-center content-between gap-5 my-5 px-5">
    <Checkout />
    <div class="flex gap-5">
      <p class="font-semibold">Items: {{ totalItems }}</p>
      <p class="font-semibold">Skus: {{ totalSkus }}</p>
    </div>
    <button
      @click="handleCheckoutPopup"
      :disabled="!(authStore.isUserLoggedIn || authStore.isManagerLoggedIn)"
      class="font-semibold border border-purple-500 hover:bg-purple-700 bg-purple-500 w-72 text-center p-5 rounded-xl flex justify-center gap-5 my-5 ml-auto text-white"
      :class="{ 'opacity-50 cursor-not-allowed': !(authStore.isUserLoggedIn || authStore.isManagerLoggedIn) }"
    >
      Checkout
    </button>
  </div>
</template>



<style scoped>

</style>