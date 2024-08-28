<script setup>
import { reactive, onMounted } from 'vue'
import Header from './components/Header.vue'
import { RouterView } from 'vue-router';
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';
import RingBarsSpinner from 'vue-global-loader/RingBarsSpinner.vue'


import axios from 'axios'

const state = reactive({
    products: [],
    isLoading: true,
    loadingPercentage: 0 
})

onMounted(async () => {
    const startTime = Date.now(); // Record the start time

    try {
        const response = await axios.get('http://localhost:3131/products');
        state.products = response.data;
        // console.log(state.products);

        const elapsedTime = Date.now() - startTime; // Calculate the elapsed time

        // Start a timer to increment the loadingPercentage after connection is made
        const loadingInterval = setInterval(() => {
            if (state.loadingPercentage < 100) {
                state.loadingPercentage += 1;
            }
        }, elapsedTime / 100); // Adjust the interval based on actual loading time

        setTimeout(() => {
            clearInterval(loadingInterval);
            state.loadingPercentage = 100; // Jump to 100% when loading is complete
            state.isLoading = false;
        }, elapsedTime); // Use the actual elapsed time as the timeout duration
    } catch (error) {
        console.error('Error fetching products:', error);
        state.loadingPercentage = 0; // Keep loading percentage at 0 on error
        state.isLoading = true; // Keep the loading spinner
    }
})

</script>

<template>
    <section class="h-screen px-4 relative">
        <div class="container-xl lg:container m-auto">

            <!-- Show Loading Spinner while loading is true -->
            <div v-if="state.isLoading" class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center text-gray-500 py-6">
                <RingBarsSpinner style="width: 60px;" />
                <!--<i class="pi pi-spin pi-spinner text-green-500" style="font-size: 2rem"></i>-->
                <!-- <PulseLoader /> -->
                <p class="mt-4">Loading... {{ state.loadingPercentage }}%</p>
            </div>

            <!-- Product listing when done loading -->
            <div v-else class="">
                <div class="h-screen flex flex-col">
                        <Header />
                        <RouterView />
                </div>
            </div>
        </div>
    </section>
</template>
