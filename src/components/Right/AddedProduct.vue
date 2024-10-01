<script setup>
import { useAuthStore } from '@/stores/authStore';
import { useOrderStore } from '@/stores/OrderStore';
import Product from './Product.vue';

const authStore = useAuthStore();
const orderStore = useOrderStore();
</script>

<template>
  <div v-if="(authStore.isUserLoggedIn || authStore.isManagerLoggedIn)">
    <div v-if="orderStore.getOrderItems.length > 0" class="flex justify-center items-center gap-2 py-5">
      <Product :items="orderStore.getOrderItems" />
    </div>
    <div v-else class="flex items-center justify-center gap-4 pt-4">
      <h4 class="text-xl font-semibold">No Orders!</h4>
      <i class="pi pi-exclamation-triangle text-yellow-500" style="font-size: 1.5rem;"></i>
    </div>
  </div>
</template>
