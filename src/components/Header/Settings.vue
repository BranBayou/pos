<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useOrderStore } from '@/stores/OrderStore';
import { useToast } from 'vue-toastification';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale.css';

const authStore = useAuthStore();
const orderStore = useOrderStore();

onMounted(() => {
  tippy('#SettingTooltip', {
    content: 'Settings',
    animation: 'scale',
  });
});
</script>

<template>
    <div id="SettingTooltip">
        <i 
         :disabled="!(authStore.isUserLoggedIn || authStore.isManagerLoggedIn)"
         :class="{ 'opacity-50 cursor-not-allowed': !(authStore.isUserLoggedIn || authStore.isManagerLoggedIn) }"
         class="pi pi-cog text-center text-purple-500 cursor-pointer"
         style="font-size: 1.875rem;"
        ></i>
    </div>
</template>

<style scoped>

</style>