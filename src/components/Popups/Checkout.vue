<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useOrderStore } from '@/stores/OrderStore';

const authStore = useAuthStore();
const orderStore = useOrderStore();

const totalAmount = computed(() => orderStore.getOrderTotal);
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-outer">
      <div 
        v-show="authStore.isCheckoutPopupVisible"
        @click="authStore.toggleCheckoutPopup"
        class="absolute w-full bg-black bg-opacity-30 h-screen top-0 left-0 flex justify-center px-8"
      >
        <Transition name="modal-inner" class="rounded-2xl">
          <div
            v-if="authStore.isCheckoutPopupVisible"
            @click.stop
            class="fixed top-10 z-50 flex items-center justify-center bg-black bg-opacity-30 w-10/12"
          >
            <div class="bg-white rounded-2xl shadow-lg p-6 w-full">
              <h1 class="font-semibold text-[24px]">Checkout</h1>
              <div class="flex flex-col ">
                <div class="flex gap-3">
                  <button class="w-24 border-2 px-5 rounded-xl">
                    <img src="/american-express.svg" alt="">
                  </button>
                  <button class="w-24 border-2 px-5 rounded-xl">
                    <img src="/mastercard.svg" alt="">
                  </button>
                  <button class="w-24 border-2 px-5 rounded-xl">
                    <img src="/paypal.svg" alt="">
                  </button>
                  <button class="w-24 border-2 px-5 rounded-xl">
                    <img src="/visa.svg" alt="">
                  </button>
                  <button class="w-24 border-2 px-5 rounded-xl">
                    <img src="/cash.svg" alt="">
                  </button>
                </div>
                <p>Left amount: <span></span></p>
                
                <p>Total: <span>{{ totalAmount }}</span></p>
              </div>
              <div class="">
                <!-- Recipt section -->
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