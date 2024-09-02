<script setup>
import { useAuthStore } from '@/stores/authStore';
import AddItem from '../Popups/AddItem.vue'


const authStore = useAuthStore();


</script>

<template>
    <div>
        <button @click="authStore.toggleAddItemPopup" class="border shadow-lg w-full text-center p-5 rounded-2xl flex gap-5 my-3">
            <span class=" cursor-pointer flex items-center gap-10">
                <i class="pi pi-search text-purple-500 bg-purple-100 p-4 rounded-full" style="font-size: 1.875rem;"></i>Items Search
            </span>
        </button>
        <AddItem />
    </div>
</template>

<style scoped>

</style>