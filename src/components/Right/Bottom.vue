<script setup>
import { useOrderStore } from '@/stores/OrderStore';
import { computed } from 'vue';

const orderStore = useOrderStore();

// Computed values for order total, GST, and PST
const gstAmount = computed(() => orderStore.getGstAmount);
const pstAmount = computed(() => orderStore.getPstAmount);
</script>

<template>
    <div class="flex flex-col justify-end" style="min-height: 50%;">
        <div class="flex items-center justify-between rounded-2xl shadow-lg mx-3 my-2 py-4 px-3">
            <p>% Overall Discount</p>
            <p>0%</p>
        </div>
        <div>
            <div class="flex items-center justify-between rounded-2xl shadow-lg mx-3 my-2 py-4 px-3">
                <p>GST</p>
                <p>${{ gstAmount.toFixed(2) }}</p>
            </div>
            <div class="flex items-center justify-between rounded-2xl shadow-lg mx-3 my-2 py-4 px-3">
                <p>PST</p>
                <p>${{ pstAmount.toFixed(2) }}</p>
            </div>
        </div>
        <div class="flex items-center justify-between rounded-2xl shadow-lg mx-3 my-2 py-4 px-3">
            <p>Total</p>
            <p>${{ orderStore.getOrderTotal }}</p>
        </div>
    </div>
</template>

<style scoped>

</style>