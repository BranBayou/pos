<script setup>
import { useOrderStore } from '@/stores/OrderStore';
import { computed } from 'vue';

// Access the order store
const orderStore = useOrderStore();

// Computed values for order total, GST, and PST
const gstAmount = computed(() => orderStore.getGstAmount.toFixed(2));
const pstAmount = computed(() => orderStore.getPstAmount.toFixed(2));
</script>

<template>
    <div class="">
        <div class="flex items-center justify-between rounded-2xl shadow-lg mx-3 my-2 py-4 px-3">
            <p>GST</p>
            <p>${{ gstAmount }}</p>
        </div>
        <div class="flex items-center justify-between rounded-2xl shadow-lg mx-3 my-2 py-4 px-3">
            <p>PST</p>
            <p>${{ pstAmount }}</p>
        </div>
    </div>
</template>

<style scoped>
/* Add your styles here */
</style>
