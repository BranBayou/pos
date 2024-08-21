<script setup>
import { onMounted, ref } from 'vue'
import Login from '../Popups/Login.vue'
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css'; // optional for styling
import 'tippy.js/animations/scale.css';

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
        <Login :modalActive="modalActive" @close-modal="toggleModal"/>
        <div class="border border-purple-500 w-6/12 p-5 rounded-xl flex gap-5">  
            <div class="">
                <button @click="toggleModal" ref="myButton" class="flex flex-col items-center"><i class="pi pi-desktop text-3xl text-purple-500"></i><span>Cashier</span></button>
            </div>
            <i class="pi pi-user text-3xl text-purple-500"></i>Cashier Logged out
        </div>
        <div class="border border-purple-500 w-6/12 text-center p-5 rounded-xl flex gap-5 my-5">  
            <button class="text-center mx-auto">
                <i class="pi pi-plus text-3xl text-purple-500 bg-green-50 rounded-full"></i>
            </button>
        </div>
    </div>
</template>

<style scoped>

</style>