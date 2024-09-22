<script setup>
import { useAuthStore } from '@/stores/authStore';
import { useProductStore } from '@/stores/productsStore';
import { useOrderStore } from '@/stores/OrderStore';
import { ref, computed } from 'vue';
import { useToast } from 'vue-toastification';

const toast = useToast();

const authStore = useAuthStore();
const orderStore = useOrderStore();


function saveOrderAsDraft() {
  orderStore.saveOrderAsDraft();
  toast.success('Order saved as draft!');
}

</script>

<template>
    <i 
     :disabled="!(authStore.isUserLoggedIn || authStore.isManagerLoggedIn)"
     :class="{ 'opacity-50 cursor-not-allowed': !(authStore.isUserLoggedIn || authStore.isManagerLoggedIn) }"
     class="pi pi-pause text-center text-purple-500"
     style="font-size: 1.875rem;"
     @click="saveOrderAsDraft"
    ></i>
</template>
