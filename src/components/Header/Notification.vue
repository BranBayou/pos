<script setup>
import { useAuthStore } from '@/stores/authStore';
import { useOrderStore } from '@/stores/OrderStore';
import { computed } from 'vue';
import { useToast } from 'vue-toastification';
import NotificationPopup from '../Popups/NotificationPopup.vue'; // Import NotificationPopup

const toast = useToast();

const authStore = useAuthStore();
const orderStore = useOrderStore();

// Compute the number of draft orders
const draftCount = computed(() => orderStore.fetchDraftOrders().length);
</script>

<template>
  <div class="relative">
    <!-- Notification Icon to toggle the draft list -->
    <i
      :disabled="!(authStore.isUserLoggedIn || authStore.isManagerLoggedIn)"
      :class="{ 'opacity-50 cursor-not-allowed': !(authStore.isUserLoggedIn || authStore.isManagerLoggedIn) }"
      class="pi pi-bell text-center text-purple-500 cursor-pointer"
      style="font-size: 1.875rem;"
      @click="orderStore.toggleDraftList"
    ></i>

    <!-- Badge to show the number of drafts -->
    <span v-if="draftCount > 0"
      class="absolute top-0 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full"
      style="transform: translate(50%, -50%);"
    >
      {{ draftCount }}
    </span>

    <!-- NotificationPopup to show drafts if orderStore.showDraftList is true -->
    <NotificationPopup v-if="orderStore.showDraftList" :draftOrders="orderStore.fetchDraftOrders()" />
  </div>
</template>

<style scoped>
/* Add any scoped styles for the parent component here */
</style>
