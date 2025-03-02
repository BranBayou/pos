<script setup>
import { useAuthStore } from '@/stores/authStore';
import { useProductStore } from '@/stores/productsStore';
import { useOrderStore } from '@/stores/OrderStore';
import { ref, computed } from 'vue';
import { useToast } from 'vue-toastification';

const toast = useToast();

const authStore = useAuthStore();
const store = useProductStore();
const orderStore = useOrderStore();
const searchQuery = ref('');

const filteredProducts = computed(() => {
    const query = searchQuery.value.trim();

    if (!query) {
        return [];
    }

    const uniqueProducts = new Map();

    // Filter products where at least one barcode exactly matches the query
    const result = store.products.filter(product => {
        const isUnique = !uniqueProducts.has(product.Sku);
        
        if (isUnique && product.Barcodes.includes(query)) {
            uniqueProducts.set(product.Sku, true);
            return true;
        }
        return false;
    });

    // Limit results to a maximum of 5 items
    return result.slice(0, 5);
});

// Function to clear the input field
function clearSearch() {
    searchQuery.value = '';
}

function handleClick(product) {
  orderStore.addOrderItem(product);
  toast.success('Item added');
  searchQuery.value = '';
}

function handleEnterKey() {
    if (filteredProducts.value.length > 0) {
        const firstProduct = filteredProducts.value[0];
        handleClick(firstProduct);
    }
}
</script>

<template>
    <div class="relative w-full">
        <input 
            v-model="searchQuery" 
            :disabled="!(authStore.isUserLoggedIn || authStore.isManagerLoggedIn)" 
            type="text"
            name="barcode-search" 
            id="barcode-search"
            class="bg-gray-100 border-0 outline-none p-2 rounded-lg w-full pr-10"
            :class="{ 'opacity-50 cursor-not-allowed': !(authStore.isUserLoggedIn || authStore.isManagerLoggedIn) }"
            placeholder="Scan or Enter Barcode"
            @keydown.enter="handleEnterKey"
        >

        <!-- Clear Button (X) -->
        <button v-if="searchQuery" @click="clearSearch"
            class="absolute right-2 top-2 text-gray-500 hover:text-gray-700">
            <i class="pi pi-times"></i>
        </button>
    </div>

    <div v-if="searchQuery.value && filteredProducts.length === 0">
        <p>No products found.</p>
    </div>

    <div v-else-if="filteredProducts.length > 0"
        class="absolute top-full left-0 overflow-y-auto w-full bg-white shadow-xl rounded-2xl z-50"
        style="max-height: 620px;">
        <table class="min-w-full bg-white border border-gray-200">
            <thead>
                <tr class="border-b bg-gray-100">
                    <th class="py-2 px-4 text-left text-gray-600 font-medium">Image</th>
                    <th class="py-2 px-4 text-left text-gray-600 font-medium">Product Name</th>
                    <th class="py-2 px-4 text-left text-gray-600 font-medium">SKU</th>
                    <th class="py-2 px-4 text-left text-gray-600 font-medium">Max Qty</th>
                    <th class="py-2 px-4 text-left text-gray-600 font-medium">Price</th>
                </tr>
            </thead>
            <tbody>
                <tr @click="handleClick(product)" v-for="product in filteredProducts" :key="product.Sku"
                    class="border-t cursor-pointer hover:bg-gray-50">
                    <td class="py-1 px-4">
                        <img :src="`https://replicagunsca.b-cdn.net/images/products/small/${product.ImageUrl}`"
                            alt="Product Image" class="w-16 h-16 object-cover">
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