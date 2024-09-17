<script setup>
import { useAuthStore } from '@/stores/authStore';
import { useOrderStore } from '@/stores/OrderStore';
import { computed } from 'vue';

const authStore = useAuthStore();
const orderStore = useOrderStore();

// Computed values for order total, GST, PST, and Discount
const gstAmount = computed(() => orderStore.getGstAmount);
const pstAmount = computed(() => orderStore.getPstAmount);

</script>

<template>
    <div v-if="(authStore.isUserLoggedIn || authStore.isManagerLoggedIn)" class="flex flex-col justify-end" style="min-height: 50%;">
        <div class="flex items-center justify-between rounded-2xl bg-[#f4f5f7] mx-3 my-2 py-4 px-3">
            <p class="">Overall Discount</p>
            <p class="">0%</p>
        </div>
        <div>
            <div class="flex items-center justify-between rounded-2xl bg-[#f4f5f7] mx-3 my-2 py-4 px-3">
                <p class="">GST</p>
                <p class="">${{ gstAmount.toFixed(2) }}</p>
            </div>
            <div class="flex items-center justify-between rounded-2xl bg-[#f4f5f7] mx-3 my-2 py-4 px-3">
                <p class="">PST</p>
                <p class="">${{ pstAmount.toFixed(2) }}</p>
            </div>
        </div>
        <div class="flex items-center justify-between rounded-2xl bg-[#f4f5f7] mx-3 my-2 py-4 px-3">
            <p class="">Total</p>
            <p class="">${{ orderStore.getOrderTotal }}</p>
        </div>
    </div>
</template>
