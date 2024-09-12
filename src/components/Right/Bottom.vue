<script setup>
import { useAuthStore } from '@/stores/authStore';
import { useOrderStore } from '@/stores/OrderStore';
import { computed } from 'vue';

const authStore = useAuthStore();
const orderStore = useOrderStore();

// Computed values for order total, GST, PST, and Discount
const gstAmount = computed(() => orderStore.getGstAmount);
const pstAmount = computed(() => orderStore.getPstAmount);
const discountPercentage = computed(() => orderStore.getTotalDiscountPercentage);
</script>

<template>
    <div v-if="(authStore.isUserLoggedIn || authStore.isManagerLoggedIn)" class="flex flex-col justify-end" style="min-height: 50%;">
        <div class="flex items-center justify-between rounded-2xl shadow-lg mx-3 my-2 py-4 px-3">
            <p class="font-semibold">Overall Discount</p>
            <p class="font-semibold">{{ discountPercentage }}%</p>
        </div>
        <div>
            <div class="flex items-center justify-between rounded-2xl shadow-lg mx-3 my-2 py-4 px-3">
                <p class="font-semibold">GST</p>
                <p class="font-semibold">${{ gstAmount.toFixed(2) }}</p>
            </div>
            <div class="flex items-center justify-between rounded-2xl shadow-lg mx-3 my-2 py-4 px-3">
                <p class="font-semibold">PST</p>
                <p class="font-semibold">${{ pstAmount.toFixed(2) }}</p>
            </div>
        </div>
        <div class="flex items-center justify-between rounded-2xl shadow-lg mx-3 my-2 py-4 px-3">
            <p class="font-semibold">Total</p>
            <p class="font-semibold">${{ orderStore.getOrderTotal }}</p>
        </div>
    </div>
</template>
