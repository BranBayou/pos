<script setup>
import { ref, computed, nextTick, watch } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useProductStore } from '@/stores/productsStore';
import { useOrderStore } from '@/stores/OrderStore';
import { useToast } from 'vue-toastification';

const toast = useToast();
const authStore = useAuthStore();
const store = useProductStore();
const orderStore = useOrderStore();
const searchQuery = ref('');
const searchInput = ref(null);

const filteredProducts = computed(() => {
  if (!store.products || !searchQuery.value) {
    return []; 
  }

  const query = searchQuery.value.toLowerCase();

  const productsMatchingSku = store.products.filter(product => 
    product.Sku && product.Sku.toLowerCase().includes(query)
  ).sort((a, b) => a.Sku.localeCompare(b.Sku));

  const productsMatchingName = store.products.filter(product => 
    product.Name && product.Name.toLowerCase().includes(query)
  ).sort((a, b) => a.Name.localeCompare(b.Name));

  const combinedResults = [...new Set([...productsMatchingSku, ...productsMatchingName])];

  return combinedResults.slice(0, 5);
});

function handleClick(product) {
  orderStore.addOrderItem(product);
  toast.success('Item added');
  searchQuery.value = '';
}

// Clear the input field
function clearSearch() {
  searchQuery.value = '';
}

watch(() => authStore.isAddItemPopup, (newVal) => {
  if (newVal) {
    nextTick(() => {
      searchInput.value?.focus();
    });
  }
});
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-outer">
      <div 
        v-show="authStore.isAddItemPopup"
        @click.self="authStore.toggleAddItemPopup"
        class="absolute w-full bg-black bg-opacity-30 h-screen top-0 left-0 flex justify-center px-8"
      >
        <Transition name="modal-inner" class="rounded-2xl">
          <div v-if="authStore.isAddItemPopup" class="fixed top-10 z-50 flex items-center justify-center bg-black bg-opacity-50 w-10/12">
            <div class="bg-white rounded-2xl shadow-lg p-6 w-full">
              <h1 class="font-semibold text-[24px] pb-4">Search Item</h1>

              <div class="relative w-full">
                <!-- Search Input with Clear Button -->
                <input 
                  ref="searchInput"
                  v-model="searchQuery"
                  type="text" 
                  name="Search product" 
                  id="" 
                  class="bg-gray-100 border-0 outline-none p-2 rounded-lg w-full pr-10"
                  placeholder="Type Search phrase or SKU"
                >
                
                <!-- Clear Button -->
                <button 
                  v-if="searchQuery" 
                  @click="clearSearch"
                  class="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                >
                  <i class="pi pi-times pr-2"></i>
                </button>
              </div>

              <div v-if="store.isLoading">
                <p>Loading: {{ store.loadingPercentage }}%</p>
              </div>

              <div v-else class="overflow-y-auto" style="max-height: 620px;">
                <table class="min-w-full bg-white border border-gray-200">
                  <tbody>
                    <tr @click="handleClick(product)" v-for="product in filteredProducts" :key="product.id" class="border-t cursor-pointer">
                      <td class="py-1 px-4">
                        <img :src="`https://replicagunsca.b-cdn.net/images/products/small/${product.ImageUrl}`" alt="Product Image" class="w-16 h-16 object-cover">
                      </td>
                      <td class="py-1 px-4">{{ product.Name }}</td>
                      <td class="py-1 px-4">{{ product.Sku }}</td>
                      <td class="py-1 px-4">{{ product.MaxQty }}</td>
                      <td class="py-1 px-4">{{ product.Price }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div> 
          </div>        
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>


<style scoped>
.modal-outer-enter-active,
  .modal-outer-leave-active {
    transition: opacity 0.3s cubic-bezier(0.52, 0.02, 0.19, 1.12);
  }

  .modal-outer-enter-from,
  .modal-outer-leave-to {
    opacity: 0;
  }

  .modal-inner-enter-active {
    transition: all 0.3s cubic-bezier(0.52, 0.02, 0.19, 1.12) 0.15s;
  }
  
  .modal-inner-leave-active {
    transition: all 0.3s cubic-bezier(0.52, 0.02, 0.19, 1.12);
  }

  .modal-inner-enter-from {
    opacity: 0;
    transform: scale(0.8);
  }

  .modal-inner-leave-to {
    transform: scale(0.8);
  }
</style>