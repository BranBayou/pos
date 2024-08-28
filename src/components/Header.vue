<script setup>
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();


</script>

<template> 
    <div class="grid grid-cols-12 gap-4 items-center mt-5 p-5 shadow-lg rounded-2xl">
        <div class="flex items-center gap-1 col-span-10 bg-gray-100 py-2 px-4 rounded-3xl">
            <i
             :disabled="!authStore.isUserLoggedIn"
             class="pi pi-barcode text-purple-500"
             :class="{ 'opacity-50 cursor-not-allowed': !authStore.isUserLoggedIn }"
             style="font-size: 1.875rem;"
            ></i>
            <input 
             :disabled="!authStore.isUserLoggedIn"
             type="text" name="" id="" class="bg-gray-100 border-0 outline-none p-2 rounded-lg w-full"
             :class="{ 'opacity-50 cursor-not-allowed': !authStore.isUserLoggedIn }"
             placeholder="Scan QR Code, Type SKU or Name of item">
        </div>
        <i
         :disabled="!authStore.isUserLoggedIn" 
         class="pi pi-bell text-center text-purple-500 col-span-1"
         :class="{ 'opacity-50 cursor-not-allowed': !authStore.isUserLoggedIn }"
         style="font-size: 1.875rem;"
        ></i>
        <i 
         :disabled="!authStore.isUserLoggedIn" 
         class="pi pi-cog text-center text-purple-500 col-span-1"
         :class="{ 'opacity-50 cursor-not-allowed': !authStore.isUserLoggedIn }"
         style="font-size: 1.875rem;"
        ></i>
    </div>

</template>

<style scoped>

</style>