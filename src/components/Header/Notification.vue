<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useOrderStore } from '@/stores/OrderStore';
import { useToast } from 'vue-toastification';
import NotificationPopup from '../Popups/NotificationPopup.vue'; // Import NotificationPopup
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale.css';

const toast = useToast();
const authStore = useAuthStore();
const orderStore = useOrderStore();

// Reactive variable to store draft orders, fetched once
const draftOrders = ref([]);

// Fetch draft orders once on component mount
onMounted(() => {
  // draftOrders.value = orderStore.fetchDraftOrders();

  tippy('#notiTooltip', {
    content: 'Notifications',
    animation: 'scale',
  });
});

// Compute the number of draft orders
const draftCount = computed(() => draftOrders.value.length);
</script>

<template>
  <div class="relative cursor-pointer" id="notiTooltip" @click="orderStore.toggleDraftList">
    <!-- Notification Icon to toggle the draft list -->
    <i
      :disabled="!(authStore.isUserLoggedIn || authStore.isManagerLoggedIn)"
      :class="{ 'opacity-50 cursor-not-allowed': !(authStore.isUserLoggedIn || authStore.isManagerLoggedIn) }"
      class="pi pi-bell text-center text-purple-500"
      style="font-size: 1.875rem;"
    ></i>

    <!-- Badge to show the number of drafts -->
    <span v-if="draftCount > 0 && authStore.isUserLoggedIn"
      class="absolute top-0 right-3 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full"
      style="transform: translate(50%, -50%);"
    >
      {{ draftCount }}
    </span>

    <!-- NotificationPopup to show drafts if orderStore.showDraftList is true -->
    <NotificationPopup v-if="orderStore.showDraftList" :draftOrders="draftOrders" />
  </div>
</template>

  
