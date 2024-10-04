<script setup>
import { useAuthStore } from '@/stores/authStore';
import { useToast } from 'vue-toastification';
const authStore = useAuthStore();
const toast = useToast();

// Accept role as a prop
const props = defineProps({
  role: {
    type: String,
    required: true,
  },
});

const cancelLogout = () => {
  authStore.isLogoutConfirmationVisible = false;
};

const confirmLogout = () => {
  try {
    authStore.logout(props.role); // Use the role passed via prop
    toast.success(`${props.role} logged out successfully`);
    authStore.isLogoutConfirmationVisible = false;
  } catch (error) {
    toast.error(`Failed to log out ${props.role}`);
    console.error('Logout error:', error);
  }
};
</script>


<template>
  <Teleport to="body">
    <Transition name="modal-outer">
      <div
        v-show="authStore.isLogoutConfirmationVisible"
        class="absolute w-full bg-black bg-opacity-30 h-screen top-0 left-0 flex justify-center px-8"
      >
        <Transition name="modal-inner" class="rounded-2xl">
          <div
            v-if="authStore.isLogoutConfirmationVisible"
            class="fixed top-44 z-50 flex items-center justify-center bg-black bg-opacity-50"
          >
            <div class="bg-white rounded-2xl shadow-lg p-6 w-80">
              <h3 class="text-lg font-semibold mb-4">Confirm Logout</h3>
              <p class="text-gray-600 mb-6">Are you sure you want to logout?</p>
              <div class="flex justify-end gap-4">
                <button
                  class="bg-gray-300 text-gray-800 px-4 py-2 hover:bg-gray-400 rounded-xl"
                  @click="cancelLogout"
                >
                  Cancel
                </button>
                <button
                  v-if="props.role === 'Cashier'"
                  class="bg-purple-500 text-white px-4 py-2 hover:bg-purple-700 rounded-xl"
                  @click="confirmLogout"
                >
                  Logout
                </button>
                <button
                  v-if="props.role === 'Manager'"
                  class="bg-purple-500 text-white px-4 py-2 hover:bg-purple-700 rounded-xl"
                  @click="confirmLogout"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>



<style >
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
