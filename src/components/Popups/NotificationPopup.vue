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

// Helper function to calculate the total number of items in a draft
function getTotalItems(draft) {
  return draft.orderItems.reduce((total, item) => total + item.qty, 0);
}

// Helper function to calculate the number of unique SKUs in a draft
function getUniqueSKUs(draft) {
  const uniqueSkus = new Set(draft.orderItems.map(item => item.Sku));
  return uniqueSkus.size;
}

// Function to delete a draft order from the store and localStorage
function deleteDraftOrder(index) {
  orderStore.draftOrders.splice(index, 1); // Remove the draft from the store's draftOrders array
  localStorage.setItem('draftOrders', JSON.stringify(orderStore.draftOrders)); // Update localStorage
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
          <div v-if="orderStore.draftOrders && orderStore.draftOrders.length" @click.stop
            class="flex p-4 my-10 w-10/12 bg-white self-start rounded-2xl">
            <div class="" style="min-width: 50%;">
              <h2 class="font-semibold py-2">Notifications</h2>
            </div>
            <div class="w-full">
              <h1 class="font-semibold py-2">Orders On Hold</h1>
              <ul class="grid grid-cols-2 gap-2 relative">
                <!-- Iterate over each draft order and render it -->
                <li v-for="(draft, index) in orderStore.draftOrders" :key="index"
                  class="collapse rounded-2xl bg-[#f4f5f7] mb-2 mx-2">
                  <!-- Trash icon for deleting the draft -->
                  <i @click="deleteDraftOrder(index)"
                    class="pi pi-trash absolute top-3 right-3 text-3xl cursor-pointer z-50"></i>
                  <div class="collapse-title text-xl font-medium flex justify-center items-center mx-auto">
                    <div class="flex flex-col items-center justify-center gap-4">
                      <!-- Assuming each draft has items, show the first product image from the draft -->
                      <img v-if="draft.orderItems && draft.orderItems[0]?.ImageUrl" @click="handleClick(draft)"
                        :src="`https://replicagunsca.b-cdn.net/images/products/small/${draft.orderItems[0].ImageUrl}`"
                        class="rounded-lg" alt="product-img" />
                      <div>
                        <!-- Display the total price of the draft order -->
                        <!-- <p class="font-semibold" v-if="draft.orderItems && draft.orderItems.length">
            ${{ draft.orderItems.reduce((total, item) => total + (item.Price * item.qty), 0).toFixed(2) }}
          </p> -->
                        <!-- Optional: Show discount information if present -->
                        <!-- <p v-if="draft.orderItems[0]?.discountPercentage" class="text-sm">
            {{ draft.orderItems[0].discountPercentage }}% discount applied
          </p> -->
                      </div>
                      <!-- Display the total number of items and unique SKUs -->
                      <div class="flex gap-2">
                        <p @click="handleClick(draft)" class="text-sm font-semibold">{{ getTotalItems(draft) }} items </p>
                        <p @click="handleClick(draft)" class="text-sm font-semibold">{{ getUniqueSKUs(draft)}} SKUs</p>
                      </div>
                      <p @click="handleClick(draft)" class="text-base font-medium">{{ new
                        Date(draft.timestamp).toLocaleString() }}</p>
                    </div>
                  </div>

                  <!-- Display details of each product in the draft -->
                  <div class="collapse-content">
                    <ul class="ml-6">
                      <li v-for="(item, itemIndex) in draft.orderItems" :key="itemIndex"
                        class="flex justify-between items-center mb-2">
                        <!-- Image, Quantity, Name, and Price of each product -->
                        <div class="flex items-center gap-4">
                          <img v-if="item.ImageUrl"
                            :src="`https://replicagunsca.b-cdn.net/images/products/small/${item.ImageUrl}`"
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
          </div>
          <p v-else class="bg-white my-10 h-20 px-20 flex justify-center items-center rounded-2xl font-semibold">No
            drafts available</p>
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
