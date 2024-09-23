<script setup>
import { useAuthStore } from '@/stores/authStore';
import { useOrderStore } from '@/stores/OrderStore';
import { ref, computed, onMounted, nextTick } from 'vue';
import { useToast } from 'vue-toastification';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale.css';

const toast = useToast();

const authStore = useAuthStore();
const orderStore = useOrderStore();

function saveOrderAsDraft() {
  orderStore.saveOrderAsDraft();
}

onMounted(async () => {
  await nextTick(); // Ensure the DOM is rendered before initializing the tooltip
  tippy('#draftTooltip', {
    content: 'Draft',
    animation: 'scale',
  });
});
</script>


<template>
    <div class="" id="draftTooltip">
        <i 
      :disabled="!(authStore.isUserLoggedIn || authStore.isManagerLoggedIn)"
      :class="{ 'opacity-50 cursor-not-allowed': !(authStore.isUserLoggedIn || authStore.isManagerLoggedIn) }"
      class="pi pi-pause text-center text-purple-500 cursor-pointer"
      
      style="font-size: 1.875rem;"
      @click="saveOrderAsDraft"
    ></i>
    </div>
</template>
  
