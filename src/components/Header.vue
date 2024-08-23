<script setup>
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();


</script>

<template> 
    <div 
     :disabled="!authStore.isLoggedIn"
     class="grid grid-cols-12 gap-4 items-center mt-5 p-5 shadow-lg rounded-2xl"
     :class="{ 'opacity-50 cursor-not-allowed': !authStore.isLoggedIn }"
     >
        <div class="flex items-center gap-1 col-span-10 bg-gray-100 py-2 px-4 rounded-3xl">
            <i class="pi pi-barcode text-3xl text-purple-500"></i>
            <input type="text" name="" id="" class="bg-gray-100 border-0 outline-none p-2 rounded-lg w-full"
        placeholder="Scan QR Code, Type SKU or Name of item">
        </div>
        <i class="pi pi-bell text-3xl text-center text-purple-500 col-span-1"></i>
        <i class="pi pi-cog text-3xl text-center text-purple-500 col-span-1"></i>
    </div>

</template>

<style scoped>

</style>