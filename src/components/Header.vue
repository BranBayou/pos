<script setup>
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();


</script>

<template> 
    <div class="grid grid-cols-12 gap-4 items-center mt-5 p-5 shadow-lg rounded-2xl">
        <div class="flex items-center gap-1 col-span-10 bg-gray-100 py-2 px-4 rounded-3xl">
            <i
             :disabled="!authStore.isLoggedIn"
             class="pi pi-barcode text-3xl text-purple-500"
             :class="{ 'opacity-50 cursor-not-allowed': !authStore.isLoggedIn }"
            ></i>
            <input 
             :disabled="!authStore.isLoggedIn"
             type="text" name="" id="" class="bg-gray-100 border-0 outline-none p-2 rounded-lg w-full"
             :class="{ 'opacity-50 cursor-not-allowed': !authStore.isLoggedIn }"
             placeholder="Scan QR Code, Type SKU or Name of item">
        </div>
        <i
         :disabled="!authStore.isLoggedIn" 
         class="pi pi-bell text-3xl text-center text-purple-500 col-span-1"
         :class="{ 'opacity-50 cursor-not-allowed': !authStore.isLoggedIn }"
        ></i>
        <i 
         :disabled="!authStore.isLoggedIn" 
         class="pi pi-cog text-3xl text-center text-purple-500 col-span-1"
         :class="{ 'opacity-50 cursor-not-allowed': !authStore.isLoggedIn }"
        ></i>
    </div>

</template>

<style scoped>

</style>