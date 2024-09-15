<script setup>
import { useAuthStore } from '@/stores/authStore';
import { useOrderStore } from '@/stores/OrderStore';
import { computed } from 'vue';

const orderStore = useOrderStore();
const authStore = useAuthStore();

// Computed properties to calculate total items and unique SKUs
const totalItems = computed(() => {
  return orderStore.getOrderItems.reduce((total, item) => total + item.qty, 0);
});

const totalSkus = computed(() => {
  const skus = orderStore.getOrderItems.map(item => item.Sku);
  return new Set(skus).size; // Using Set to get unique SKUs
});
</script>

<template>
  <div class="border shadow-lg w-full rounded-2xl flex items-center content-between gap-5 my-5 px-5">
    <div class="flex gap-5">
      <p class="font-semibold">Items: {{ totalItems }}</p>
      <p class="font-semibold">Skus: {{ totalSkus }}</p>
    </div>
    <button
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