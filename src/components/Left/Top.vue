<script setup>
import { onMounted, ref } from 'vue'
import Login from '../Popups/Login.vue'
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css'; // optional for styling
import 'tippy.js/animations/scale.css';

import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();

// Modal control for Login
const modalActive = ref(null);
const toggleModal = () => {
    modalActive.value =!modalActive.value;
}

// Tooltip for login button
const myButton = ref(null);
onMounted(() => {
    tippy(myButton.value, {
        content: "Login",
        placement: 'top',
        animation: 'fade',
    });
});

</script>

<template>
    <div class="my-7">
        <Login 
         @close-modal="toggleModal"
         :modalActive="modalActive"
         />
        <div class="flex items-center border shadow-lg w-6/12 p-5 rounded-2xl gap-5">  
            <div class="">
                <button class="flex flex-col items-center"><img style="width: 35px;" src="/cashier.png" alt=""><span>Cashier</span></button>
            </div>
            <i @click="toggleModal" ref="myButton" class="pi pi-user text-purple-500 bg-purple-100 p-4 rounded-full cursor-pointer" style="font-size: 1.875rem;"></i>Cashier Logged out
        </div>
        <button class="border shadow-lg w-6/12 text-center p-5 rounded-2xl flex gap-5 my-5">
            <span class="text-center mx-auto cursor-pointer">
                <i 
                 :disabled="!authStore.isLoggedIn" 
                 class="pi pi-plus text-purple-500 bg-purple-100 p-4 rounded-full"
                 :class="{ 'opacity-50 cursor-not-allowed': !authStore.isLoggedIn }"
                 style="font-size: 1.875rem;"
                ></i>
            </span>
        </button>
    </div>
</template>

<style scoped>

</style>