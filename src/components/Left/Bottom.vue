<script setup>
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();

</script>

<template>
    <div class="border shadow-lg w-full rounded-2xl flex items-center content-between gap-5 my-5 px-5">
        <div class="flex gap-5">
            <p class="font-semibold">Items: 0</p>
            <p class="font-semibold">Skus: 0</p>
        </div>
        <button
         :disabled="!authStore.isUserLoggedIn"
         class="font-semibold border border-purple-500 hover:bg-purple-700 bg-purple-500 w-72 text-center p-5 rounded-xl flex justify-center gap-5 my-5 ml-auto text-white"
         :class="{ 'opacity-50 cursor-not-allowed': !authStore.isUserLoggedIn }"
        >
            Checkout
        </button>
    </div>
</template>

<style scoped>

</style>