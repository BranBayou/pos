<script setup>
import { useAuthStore } from '@/stores/authStore';
import { useOrderStore } from '@/stores/OrderStore';
import ManagerLoginPopup from './ManagerLogin.vue';

const orderStore = useOrderStore();

const authStore = useAuthStore();

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  gstRate: {
    type: Number,
    required: true,
  },
  pstRate: {
    type: Number,
    required: true,
  },
});

// Function to handle click and toggle popups correctly
const handleCancel = () => {
  authStore.toggleAddManagerApprovalRequest();

  // Reset the discount and tax rates if approval is canceled
  if (props.item) {
    orderStore.resetDiscount(props.item);
    orderStore.resetTaxRate(props.item, 'GST');
    orderStore.resetTaxRate(props.item, 'PST');
  }
};

const handleClick = () => {
  if (authStore.isAddManagerApprovalRequest) {
    authStore.toggleAddManagerApprovalRequest();
  }
  authStore.toggleManagerLoginPopup();
};
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-outer">
      <div class="">
        <ManagerLoginPopup
         :item="props.item"
        />
        <div v-show="authStore.isAddManagerApprovalRequest" class="absolute w-full bg-black bg-opacity-30 h-screen top-0 left-0 flex justify-center px-8">
          <Transition name="modal-inner" class="rounded-2xl">
            <div v-if="authStore.isAddManagerApprovalRequest" class="fixed top-44 z-50 flex items-center justify-center bg-black bg-opacity-50 w-2/5">
              <div class="bg-white rounded-2xl shadow-lg p-6 w-full">
                <!-- Manager Login Popup Component -->
                <i @click="handleCancel" class="pi pi-times-circle w-full text-right" style="font-size: 24px;"></i>
                <h3 class="text-lg font-semibold mb-4 text-center">Manager is required to approve this Discount</h3>
                <div class="flex justify-end gap-4 w-full">
                  <button 
                    class="bg-purple-500 text-white px-4 py-2 hover:bg-purple-700 rounded-xl mx-auto"
                    @click="handleClick"
                  >
                    Manager Override
                  </button>
                </div>
              </div>
            </div>
          </Transition>
        </div>
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