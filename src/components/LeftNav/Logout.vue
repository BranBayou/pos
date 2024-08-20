<script setup>
import { ref } from 'vue'
import Login from '../Popups/Login.vue'

const modalActive = ref(null);
const toggleModal = () => {
    modalActive.value =!modalActive.value;
}

</script>

<template>
    <div class="my-7">
        <Login :modalActive="modalActive" @close-modal="toggleModal"/>
        <div class="border border-purple-500 w-fit p-5 rounded-xl flex gap-5">  
            <div class="">
                <i @click="toggleModal" class="pi pi-desktop text-3xl text-purple-500 flex flex-col"></i>
                <p>Cashier</p>
            </div>
            <i class="pi pi-user text-3xl text-purple-500"></i>Cashier Logged out
        </div>
        <div class="border border-purple-500 w-72 text-center p-5 rounded-xl flex gap-5 my-5">  
            <button class="text-center mx-auto">
                <i class="pi pi-plus text-3xl text-purple-500 bg-green-50 rounded-full"></i>
            </button>
        </div>
    </div>
</template>

<style scoped>

</style>