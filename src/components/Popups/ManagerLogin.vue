<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import Select from 'primevue/select';
import Password from 'primevue/password';
import { useAuthStore } from '@/stores/authStore';
import { useOrderStore } from '@/stores/OrderStore';

const authStore = useAuthStore();
const orderStore = useOrderStore();

const toast = useToast();
const selectedUserId = ref(null);
const password = ref('');

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
});

function handleClose () {
  if (props.item) {
    orderStore.resetDiscount(props.item);
  }
  authStore.toggleManagerLoginPopup(); 
}

// Fetch managers when the modal opens
onMounted(async () => {
  try {
    await authStore.fetchManager(); 

    if (authStore.managerUsersList && authStore.managerUsersList.length === 0) {
      toast.error('No managers available');
    }
  } catch (error) {
    toast.error('Failed to load manager users');
    console.error('Error loading manager users:', error);
  }
});

// Function to handle manager login
const loginManager = async () => {

  if (authStore.isManagerLoggedIn) {
    toast.info('Manager is already logged in');
    return;
  }

  try {
    const selectedUser = authStore.managerUsersList.find(user => user.id === selectedUserId.value);
    const userIdValue = selectedUser?.id;
    const passwordValue = password.value;

    if (!userIdValue || !passwordValue) {
      toast.error('Username or password is missing');
      return;
    }

    await authStore.login(userIdValue, password.value);

    password.value = '';
    authStore.toggleManagerLoginPopup();
  } catch (error) {
    toast.error('Manager login failed');
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

    if (password.value.length === 6 && !isNaN(password.value)) {
      login();
    } else {
      toast.error('Please enter a valid 6-digit PIN');
      password.value = ''; 
    }
  }
};
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-outer">
      <div v-show="authStore.isManagerLoginPopupVisible" class="absolute w-full bg-black bg-opacity-30 h-screen top-0 left-0 flex justify-center px-8">
        <Transition name="modal-inner">
          <div v-if="authStore.isManagerLoginPopupVisible" class="p-4 bg-white self-start mt-24" style="width: 29%; border-radius: 40px;">
            <h3 class="text-lg font-semibold mb-4 text-center">Manager Login</h3>
            <div class="w-full space-y-3">
              <div class="flex gap-x-1 my-1">
                <div class="card flex justify-center border-2 rounded-2xl w-full px-3">
                  <!-- Bind the manager list from the authStore -->
                  <Select 
                    v-model="selectedUserId" 
                    :options="authStore.managerUsersList" 
                    optionLabel="fullName"  
                    optionValue="id"    
                    placeholder="Manager Login" 
                    class="w-full py-3"
                  />
                </div>
              </div>
              <div class="flex justify-center items-center gap-2 border-2 rounded-2xl py-3 px-3">
                <i class="pi pi-lock"></i>
                <Password v-model="password" :feedback="false" placeholder="******" class=" w-full mx-auto" />
              </div>
              <div class="grid grid-cols-3 gap-4">
                <button @click="handlePasswordInput(i)" v-for="i in 9" :key="i"
                        class="mx-auto hover:bg-purple-500 w-12 h-12 border-2 bg-transparent hover:text-white text-16px font-semibold rounded-full transition duration-300 ease-in-out">
                  {{ i }}
                </button>
              </div>

              <div class="grid grid-cols-3 gap-4 mx-auto">
                <button @click="clearLastCharacter"
                      class="mx-auto hover:bg-purple-500 w-12 h-12 border-2 bg-transparent hover:text-white text-16px font-semibold rounded-full transition duration-300 ease-in-out">
                  <i class="pi pi-delete-left"></i>
                </button>
                <button @click="handlePasswordInput(0)"
                      class="mx-auto hover:bg-purple-500 w-12 h-12 border-2 bg-transparent hover:text-white text-16px font-semibold rounded-full transition duration-300 ease-in-out">
                  0
                </button>
                <button @click="loginManager" type="submit"
                      class="mx-auto hover:bg-purple-500 w-12 h-12 border-2 bg-transparent hover:text-white text-16px font-semibold rounded-full transition duration-300 ease-in-out">
                  <i class="pi pi-check"></i>
                </button>
              </div>
              
              
              
            </div>
            <button @click="handleClose" class="mt-8 bg-weather-primary rounded-2xl text-white bg-purple-500 hover:bg-purple-400 hover:text-white py-2 px-6">
              Close
            </button>
            
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>



<style>
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
