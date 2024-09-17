<script setup>
import { reactive, onMounted } from 'vue'
import Header from './components/Header.vue'
import { RouterView } from 'vue-router';
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';
import RingBarsSpinner from 'vue-global-loader/RingBarsSpinner.vue'
import { useProductStore } from '@/stores/productsStore';

const store = useProductStore();

onMounted(() => {
    store.fetchProducts();
});

</script>

<template>
    <section class="h-screen px-4 relative bg-[#f4f5f7]">
        <div class="container-xl lg:container m-auto">

            <!-- Show Loading Spinner while loading is true -->
            <div v-if="store.isLoading" class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center text-gray-500 py-6">
                <RingBarsSpinner style="width: 60px;" />
                <!--<i class="pi pi-spin pi-spinner text-green-500" style="font-size: 2rem"></i>-->
                <!-- <PulseLoader /> -->
                <p class="mt-4">Loading... {{ store.loadingPercentage }}%</p>
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
