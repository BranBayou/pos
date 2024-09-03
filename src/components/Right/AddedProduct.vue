<script setup>
import { useOrderStore } from '@/stores/OrderStore';

const orderStore = useOrderStore();
</script>

<template>
  <div>
    <!-- Check if there are any order items -->
    <div v-if="orderStore.getOrderItems.length > 0">
      <!-- Loop through each order item -->
      <div 
        v-for="(item, index) in orderStore.getOrderItems" 
        :key="index" 
        class="flex items-center justify-between rounded-2xl shadow-xl m-3 py-5 px-3"
      >
        <img :src="item.imageUrl" alt="product-img">
        <h2>{{ item.Name }}</h2>
        <p>${{ item.Price }}</p>
      </div>
    </div>
    <!-- Display a message if there are no orders -->
    <div v-else class="flex justify-center items-center gap-2 py-5">
      <h2 class="text-3xl">No Orders!</h2>
      <i class="pi pi-exclamation-triangle text-purple-500" style="font-size: 1.5rem;"></i>
    </div>
  </div>
</template>

<style scoped>
/* Add any scoped styles here */
</style>
