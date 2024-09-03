<script setup>
import { useAuthStore } from '@/stores/authStore';
import { useProductStore } from '@/stores/productsStore';
import { useOrderStore } from '@/stores/OrderStore';
import { ref, computed } from 'vue';

const authStore = useAuthStore();
const store = useProductStore();
const orderStore = useOrderStore();
const searchQuery = ref('');

const filteredProducts = computed(() => {
    const query = searchQuery.value.trim().toLowerCase();
    
    if (!query) {
        return []; // Return an empty array if the search query is empty
    }

    // Filter products based on the barcode and limit to the first 5 matches
    return store.products.filter(product => {
        const barcode = product.BarCode ? product.BarCode.toLowerCase() : '';
        return barcode.includes(query);
    }).slice(0, 5); // Return only the first 5 matches
});
</script>


<template>
    <input 
        v-model="searchQuery"
        :disabled="!authStore.isUserLoggedIn"
        type="text" 
        name="barcode-search" 
        id="barcode-search" 
        class="bg-gray-100 border-0 outline-none p-2 rounded-lg w-full"
        :class="{ 'opacity-50 cursor-not-allowed': !authStore.isUserLoggedIn }"
        placeholder="Scan or Enter Barcode"
    >

    <div v-if="searchQuery.value && filteredProducts.length === 0">
        <p>No products found.</p>
    </div>

    <div v-else-if="filteredProducts.length > 0" class="absolute top-full left-0 overflow-y-auto w-full bg-white shadow-xl rounded-2xl" style="max-height: 620px;">
        <table class="min-w-full bg-white border border-gray-200">
            <tbody>
                <tr 
                    @click="orderStore.addOrderItem(product)" 
                    v-for="product in filteredProducts" 
                    :key="product.Sku" 
                    class="border-t cursor-pointer hover:bg-gray-50"
                >
                    <td class="py-1 px-4">
                        <img :src="product.ImageUrl" alt="Product Image" class="w-16 h-16 object-cover">
                    </td>
                    <td class="py-1 px-4">{{ product.Name }}</td>
                    <td class="py-1 px-4">{{ product.Sku }}</td>
                    <td class="py-1 px-4">{{ product.MaxQty }}</td>
                    <td class="py-1 px-4">{{ product.Price }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>






<style scoped>

</style>