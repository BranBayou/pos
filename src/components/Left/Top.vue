<script setup>
import { onMounted, ref, watch } from 'vue';
import Login from '../Popups/Login.vue';
import LogoutConfirmation from '../Popups/LogoutConfirmation.vue';
import OpenDrawer from './OpenDrawer.vue';
import ItemsSearch from './ItemsSearchButton.vue';
import AddBehavior from '../Popups/AddBehavior.vue';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale.css';

import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();

// Modal control for Login
const modalActive = ref(null);
const toggleModal = () => {
    modalActive.value = !modalActive.value;
};

const toggleisLogoutConfirmationVisible = () => {
    authStore.isLogoutConfirmationVisible = !authStore.isLogoutConfirmationVisible;
};

// Handle login/logout logic
const handleAuthAction = () => {
    if (authStore.isUserLoggedIn) {
        toggleisLogoutConfirmationVisible();
    } else {
        toggleModal(); // Show login modal
    }
};

// Tooltip for login button
const myButton = ref(null);
let tooltipInstance = null;

onMounted(() => {
    tooltipInstance = tippy(myButton.value, {
        content: authStore.isUserLoggedIn ? 'Logout' : 'Login',
        placement: 'top',
        animation: 'fade',
    });
});

// Watch for changes in the user's logged-in status and update tooltip content
watch(() => authStore.isUserLoggedIn, (newValue) => {
    if (tooltipInstance) {
        tooltipInstance.setContent(newValue ? 'Logout' : 'Login');
    }
});

// State for buttons moved from the child component
</script>

<template>
    <div class="my-7 grid grid-cols-2 gap-4">
        <LogoutConfirmation />
        <Login 
         @close-modal="toggleModal"
         :modalActive="modalActive"
        />
        <div class="flex items-center border shadow-lg w-full p-5 rounded-2xl gap-5">  
            <div>
                <button class="flex flex-col items-center">
                    <img style="width: 35px;" src="/cashier.png" alt="">
                    <span>Cashier</span>
                </button>
            </div>
            <i @click="handleAuthAction" ref="myButton" class="pi pi-user text-purple-500 bg-purple-100 p-4 rounded-full cursor-pointer" style="font-size: 1.875rem;"></i>
            <span>{{ authStore.isUserLoggedIn ? authStore.currentUser : 'Logged out' }}</span>
        </div>
        
        <ItemsSearch v-if="authStore.isUserLoggedIn" />
        <OpenDrawer v-if="authStore.isUserLoggedIn" />
        
        <AddBehavior/>
        
        <button
         @click="authStore.toggleAddBehaviourPopup"
         class="border shadow-lg w-full text-center p-5 rounded-2xl flex gap-5 my-5">
            <span class="text-center mx-auto cursor-pointer">
                <i 
                 :disabled="!authStore.isUserLoggedIn" 
                 class="pi pi-plus text-purple-500 bg-purple-100 p-4 rounded-full"
                 :class="{ 'opacity-50 cursor-not-allowed': !authStore.isUserLoggedIn }"
                 style="font-size: 1.875rem;"
                ></i>
            </span>
        </button>
    </div>
</template>

<style scoped>

</style>