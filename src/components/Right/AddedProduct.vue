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
    <div v-else>
      <h2>No Orders!</h2>
    </div>
  </div>
</template>

<style scoped>
/* Add any scoped styles here */
</style>
