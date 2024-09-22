<script setup>
import { useAuthStore } from '@/stores/authStore';
import BarcodeInput from '@/components/Header/BarcodeInput.vue';
import Notification from './Header/Notification.vue';
import Draft from './Header/Draft.vue';
import Settings from './Header/Settings.vue';
const authStore = useAuthStore();

</script>

<template> 
    <div class="grid grid-cols-12 gap-4 items-center mt-5 p-5 bg-white rounded-2xl relative">
        <div class="flex items-center gap-1 col-span-9 bg-gray-100 py-2 px-4 rounded-3xl">
            <i
             :disabled="!(authStore.isUserLoggedIn || authStore.isManagerLoggedIn)"
             :class="{ 'opacity-50 cursor-not-allowed': !(authStore.isUserLoggedIn || authStore.isManagerLoggedIn) }"
             class="pi pi-barcode text-purple-500"
             style="font-size: 1.875rem;"
            ></i>
            <BarcodeInput />
        </div>
        <div class="col-span-1 text-center">
            <Draft />
        </div>
        <div class="col-span-1 text-center">
            <Notification />
        </div>
        <div class="col-span-1 text-center">
            <Settings />
        </div>
    </div>

</template>

<style scoped>

</style>