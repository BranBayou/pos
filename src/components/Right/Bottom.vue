<script setup>
import { useAuthStore } from '@/stores/authStore';
import { useOrderStore } from '@/stores/OrderStore';

const authStore = useAuthStore();
import { computed } from 'vue';

const orderStore = useOrderStore();

// Computed values for order total, GST, and PST
const gstAmount = computed(() => orderStore.getGstAmount);
const pstAmount = computed(() => orderStore.getPstAmount);
</script>

<template>
    <div v-if="authStore.isUserLoggedIn" class="flex flex-col justify-end" style="min-height: 50%;">
        <div class="flex items-center justify-between rounded-2xl shadow-lg mx-3 my-2 py-4 px-3">
            <p class="font-semibold">% Overall Discount</p>
            <p class="font-semibold">0%</p>
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

<style scoped>

</style>