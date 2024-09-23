<script setup>
import { ref } from 'vue';
import { useOrderStore } from '@/stores/OrderStore';

const props = defineProps({
  draftOrders: Array
});

// Get order store
const orderStore = useOrderStore();

// Function to load a draft order
function loadDraftOrder(draft) {
  orderStore.loadDraftOrder(draft); // This calls the function to load the draft in the store
}

function handleClick(draft) {
  loadDraftOrder(draft); // Pass the selected draft to loadDraftOrder
  orderStore.toggleDraftList(); // Close the draft list after loading the draft
}

</script>

<template>
    <Teleport to="body">
      <Transition name="modal-outer">
        <!-- Use orderStore.showDraftList to control visibility -->
        <div v-show="orderStore.showDraftList" @click="orderStore.toggleDraftList"
          class="absolute w-full bg-black bg-opacity-30 h-screen top-0 left-0 flex justify-center px-8">
  
          <Transition name="modal-inner">
            <!-- Prevent popup from closing when clicking inside -->
            <div v-if="draftOrders && draftOrders.length" @click.stop class="flex flex-col p-4 my-10 w-5/12 bg-white self-start rounded-2xl">
              <h1 class="font-semibold">Draft Orders</h1>
              <ul>
                <!-- Iterate over each draft order and render it -->
                <li v-for="(draft, index) in draftOrders" :key="index" class="collapse rounded-2xl bg-[#f4f5f7] mb-2">
                  <div @click="handleClick(draft)" class="collapse-title text-xl font-medium flex justify-between items-center">
                    <div class="flex items-center gap-4">
                      <!-- Assuming each draft has items, show the first product image from the draft -->
                      <img v-if="draft.orderItems && draft.orderItems[0]?.ImageUrl"
                        :src="`https://replicagunsca.b-cdn.net/images/products/small/${draft.orderItems[0].ImageUrl}`" 
                        class="w-14 rounded-lg" alt="product-img" />
                      <p class="text-base font-semibold">Draft Order #{{ index + 1 }} - {{ new Date(draft.timestamp).toLocaleString() }}</p>
                    </div>
                    <div>
                      <!-- Display the total price of the draft order -->
                      <p class="font-semibold" v-if="draft.orderItems && draft.orderItems.length">
                        ${{ draft.orderItems.reduce((total, item) => total + (item.Price * item.qty), 0).toFixed(2) }}
                      </p>
                      <!-- Optional: Show discount information if present -->
                      <p v-if="draft.orderItems[0]?.discountPercentage" class="text-sm">
                        {{ draft.orderItems[0].discountPercentage }}% discount applied
                      </p>
                    </div>
                  </div>
  
                  <!-- Display details of each product in the draft -->
                  <div class="collapse-content">
                    <ul class="ml-6">
                      <li v-for="(item, itemIndex) in draft.orderItems" :key="itemIndex" class="flex justify-between items-center mb-2">
                        <!-- Image, Quantity, Name, and Price of each product -->
                        <div class="flex items-center gap-4">
                          <img v-if="item.ImageUrl" :src="`https://replicagunsca.b-cdn.net/images/products/small/${item.ImageUrl}`" 
                            class="w-10 rounded-lg" alt="product-img" />
                          <div>
                            <p class="text-base font-semibold">{{ item.Name }}</p>
                            <p class="text-sm text-gray-600">Qty: {{ item.qty }}</p>
                          </div>
                        </div>
                        <p class="font-semibold">${{ (item.Price * item.qty).toFixed(2) }}</p>
                      </li>
                    </ul>
                  </div>
                </li>
              </ul>
            </div>
  
            <p v-else>No drafts available</p>
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

  .custom-input::placeholder {
    color: gray;
  }
</style>
