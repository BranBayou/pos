<script setup>
import { useAuthStore } from '@/stores/authStore';
const emit = defineEmits(['managerApproval']);

const handleManagerApproval = () => {
  emit('managerApproval');
};
const authStore = useAuthStore();

</script>

<template>
    <div>
        <button 
         @click="handleManagerApproval"
         class="bg-white text-center p-5 rounded-2xl flex gap-5 my-3 w-full"
        >
            <span class="flex items-center gap-10 text-center cursor-pointer">
                <i class="pi pi-user text-purple-500 bg-purple-100 p-4 rounded-full" style="font-size: 1.875rem;"></i>Add Manager Approvals
            </span>
        </button>
    </div>
</template>

<style scoped>

</style>