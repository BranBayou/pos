<script setup>
import { useAuthStore } from '@/stores/authStore';
import { computed } from 'vue';

// Don't touch emit as requested
const emit = defineEmits(['walkInCustomer']);

// Get access to the store
const authStore = useAuthStore();

// Use computed to ensure selectedCustomer is reactive
const selectedCustomer = computed(() => authStore.selectedCustomer);

// Function to handle walk-in customer
const handleWalkInCustomer = () => {
  emit('walkInCustomer');
};
</script>

<template>
    <div>
        <button
         @click="handleWalkInCustomer" 
         class="border shadow-lg text-center p-5 rounded-2xl flex gap-5 my-3 w-full">
            <span class="flex items-center gap-5 text-center cursor-pointer">
                <div class="flex items-center">
                    <img class="w-14 h-14" src="/walking.png" alt="Walking Image">
                    <i class="pi pi-user text-purple-500 bg-purple-100 p-4 rounded-full" style="font-size: 1.875rem;"></i>
                </div>
                <!-- Check if a customer is selected and show name and phone or fallback to 'Select Customer' -->
                <p 
                 v-if="selectedCustomer"
                 class="flex flex-col"
                >
                    <span>{{ selectedCustomer.name }}</span>  
                    <span>{{ selectedCustomer.phone }}</span>
                </p>
                <span v-else>Select Customer</span>
            </span>
        </button>
    </div>
</template>


<style scoped>

</style>