<script setup>
import { useAuthStore } from '@/stores/authStore';
import { useOrderStore } from '@/stores/OrderStore';
import Checkout from '../Popups/Checkout.vue';
import { computed } from 'vue';
import { useToast } from 'vue-toastification';
const toast = useToast();

const orderStore = useOrderStore();
const authStore = useAuthStore();

// Total items calculation, returning 0 if not logged in
const totalItems = computed(() => {
  if (authStore.isUserLoggedIn || authStore.isManagerLoggedIn) {
    return Array.isArray(orderStore.state.orderItems)
      ? orderStore.state.orderItems.reduce((total, item) => total + item.Qty, 0)
      : 0;
  } else {
    return 0;  // Return 0 if not logged in
  }
});

// Total skus calculation, returning 0 if not logged in
const totalSkus = computed(() => {
  if (authStore.isUserLoggedIn || authStore.isManagerLoggedIn) {
    if (Array.isArray(orderStore.state.orderItems)) {
      const skus = orderStore.state.orderItems.map(item => item.ItemId);
      return new Set(skus).size;
    }
  }
  return 0;  // Return 0 if not logged in
});

// Handle checkout popup
function handleCheckoutPopup() {
  if (totalItems.value > 0) {
    authStore.toggleCheckoutPopup(); 
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