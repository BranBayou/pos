<script setup>
import { useAuthStore } from '@/stores/authStore';
const emit = defineEmits(['commentAdded']);

const authStore = useAuthStore();

const handleCommentAdded = () => {
  emit('commentAdded');
};


</script>

<template>
    <div>
        <button
         @click="handleCommentAdded"
         class="bg-white text-center p-5 rounded-2xl flex gap-5 my-3 w-full">
            <span class="flex items-center gap-10 text-center cursor-pointer">
                <i class="pi pi-envelope text-purple-500 bg-purple-100 p-4 rounded-full" style="font-size: 1.875rem;"></i> Add Comment
            </span> 
        </button>
    </div>
</template>

<style scoped>

</style>