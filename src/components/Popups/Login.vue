<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore'; // Now using the combined store
import { useToast } from 'vue-toastification';
import Select from 'primevue/select';
import Password from 'primevue/password';
import InputText from 'primevue/inputtext';
import casherImg from '/cashier.png';
import qrCode from '/qr-code.svg';

const authStore = useAuthStore(); // For login, fetching users, toggling, and state management
const selectedUser = ref(null); // Holds the selected user for Cashier login
const username = ref(''); // For manager login (manual entry)
const password = ref(''); // Holds the password (PIN)
const toast = useToast();
const emit = defineEmits(['close-modal']); // To close the modal after login

defineProps({
  modalActive: {
    type: Boolean,
    default: false,
  }
});

onMounted(() => {
  // If the user is already logged in, no need to fetch users
  if (authStore.token && authStore.currentUser) {
    console.log('User session restored:', authStore.currentUser);
  } else {
    // Fetch Cashiers if the user is not logged in yet
    authStore.fetchCashiers();
    authStore.fetchManager();
  }
});

const login = async () => {
  let userId;

  // If cashier login mode, use the selectedUser's id
  if (authStore.isCashierLoginInput) {
    userId = selectedUser.value?.id;
  } 
  // If manager login mode, find the manager by fullName in managerUsersList
  else {
    const manager = authStore.managerUsersList.find(user => user.fullName === username.value);
    if (manager) {
      userId = manager.id;  // Get the manager's ID from the matched manager object
    }
  }

  const pin = password.value;

  // Validation: Ensure both userId and pin are provided and PIN is exactly 6 digits
  if (!userId || !pin || pin.length !== 6 || isNaN(pin)) {
    toast.error('Please enter a valid 6-digit PIN');
    console.error('Invalid PIN format or missing user ID');
    return;
  }

  try {
    // Use the login function from the store, which uses the API call
    await authStore.login(userId, pin, authStore.storeId);

    // Close modal after successful login
    emit('close-modal');
    
    // Reset inputs
    username.value = '';
    password.value = '';
    selectedUser.value = null;
  } catch (error) {
    console.error('Login failed:', error);
    if (error.response?.data?.errors) {
      toast.error(error.response.data.errors.join(', ')); // Show errors if they exist
    } else {
      toast.error('Login failed');
    }
  }
};

const clearLastCharacter = () => {
  password.value = password.value.slice(0, -1);
};


// Handle password input for numeric keypad
const handlePasswordInput = (num) => {
  if (password.value.length < 6) {
    password.value += num; 
  }
  if (password.value.length === 6) {
    // Check if the PIN is valid before triggering login
    if (password.value.length === 6 && !isNaN(password.value)) {
      login();
    } else {
      toast.error('Please enter a valid 6-digit PIN');
      password.value = ''; // Clear invalid PIN for re-entry
    }
  }
};


</script>

<template>
  <Teleport to="body">
    <Transition name="modal-outer">
      <div v-show="modalActive" class="absolute w-full bg-black bg-opacity-30 h-screen top-0 left-0 flex justify-center px-8">
        <Transition name="modal-inner">
          <div v-if="modalActive" class="p-4 bg-white self-start mt-24" style="width: 29%; border-radius: 40px;">
            <div class="grid grid-cols-3 gap-6 place-items-center">
              <div class="w-full col-span-3 space-y-3">
                <!-- Cashier Login -->
                <div v-if="authStore.isCashierLoginInput" class="cashier-login flex gap-x-1 my-1">
                  <div class="card flex justify-center border-2 rounded-2xl w-full px-3">
                    <Select v-model="selectedUser" :options="authStore.usersList" optionLabel="fullName" placeholder="Cashier Login" checkmark :highlightOnSelect="false" class="w-full py-3" />
                  </div>
                  <img
                    title="Switch to barcode login"
                    :src="qrCode"
                    alt="Switch to manager login"
                    class="cursor-pointer bg-purple-100 p-2 rounded-2xl"
                    @click="authStore.toggleLoginInput"
                  />
                </div>

                <!-- Manager Login -->
                <div v-else class="manager-login flex gap-x-1 my-1">
                  <div class="card flex justify-center w-full">
                    <FloatLabel class="border-2 py-3 px-3 w-full rounded-2xl">
                      <i class="pi pi-barcode text-purple-500 pr-2"></i>
                      <InputText id="username" v-model="username" placeholder="Enter Manager Username" />
                    </FloatLabel>
                  </div>
                  <img
                    title="Switch to cashier login"
                    :src="casherImg"
                    alt="Switch to cashier login"
                    class="cursor-pointer bg-purple-100 p-2 rounded-2xl"
                    style="width: 44px;"
                    @click="authStore.toggleLoginInput"
                  />
                </div>

                <!-- Password Input -->
                <div class="flex justify-center items-center gap-2 border-2 rounded-2xl py-3 px-3">
                  <i class="pi pi-lock"></i>
                  <Password v-model="password" @keyup.enter="login" :feedback="false" placeholder="Enter PIN" class="w-full mx-auto" />
                </div>
              </div>

              <!-- Number Buttons for PIN Entry -->
              <button @click="handlePasswordInput(i)" v-for="i in 9" :key="i"
                      class="hover:bg-purple-500 w-12 h-12 border-2 bg-transparent hover:text-white text-16px font-semibold rounded-full transition duration-300 ease-in-out">
                {{ i }}
              </button>

              <!-- Clear Button -->
              <button @click="clearLastCharacter"
                      class="hover:bg-purple-500 w-12 h-12 border-2 bg-transparent hover:text-white text-16px font-semibold rounded-full transition duration-300 ease-in-out">
                <i class="pi pi-delete-left"></i>
              </button>

              <!-- Zero Button -->
              <button @click="handlePasswordInput(0)"
                      class="hover:bg-purple-500 w-12 h-12 border-2 bg-transparent hover:text-white text-16px font-semibold rounded-full transition duration-300 ease-in-out">
                0
              </button>

              <!-- Submit Button -->
              <button @click="login" type="submit"
                      class="hover:bg-purple-500 w-12 h-12 border-2 bg-transparent hover:text-white text-16px font-semibold rounded-full transition duration-300 ease-in-out">
                <i class="pi pi-check"></i>
              </button>
            </div>

            <!-- Close Modal Button -->
            <button @click="$emit('close-modal')"
                    class="mt-8 bg-purple-500 hover:bg-purple-400 text-white py-2 px-6 rounded-2xl">
              Close
            </button>
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
