<script setup>
import { useAuthStore } from '@/stores/authStore';
import { useOrderStore } from '@/stores/OrderStore';
import Product from './Product.vue';

const authStore = useAuthStore();
const orderStore = useOrderStore();

</script>

<template>
  <div v-if="(authStore.isUserLoggedIn || authStore.isManagerLoggedIn)">
    <!-- Check if there are any order items -->
    <div v-if="orderStore.getOrderItems.orderItems.length > 0" class="flex justify-center items-center gap-2 py-5">
      <!-- Pass the entire state as props to Product component -->
      <Product :order="orderStore.getOrderItems" />
    </div>
    <div v-else class="flex items-center justify-center gap-4 pt-4">
      <h4 class="text-xl font-semibold">No Items!</h4>
      <i class="pi pi-exclamation-triangle text-yellow-500" style="font-size: 1.5rem;"></i>
    </div>
  </div>
</template>

