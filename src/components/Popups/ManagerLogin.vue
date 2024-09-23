<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import Select from 'primevue/select';
import Password from 'primevue/password';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();
const toast = useToast();
const selectedUserId = ref(null); // Now track by id, not the whole object
const password = ref(''); // Password input

// Fetch managers when the modal opens
onMounted(async () => {
  try {
    await authStore.fetchManager(); // Fetch managers using the store function
    
    // Check if the managerUsersList is populated
    console.log('MGR' ,authStore.managerUsersList);
    
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
  try {
    const selectedUser = authStore.managerUsersList.find(user => user.id === selectedUserId.value);
    const userIdValue = selectedUser?.id;
    const passwordValue = password.value;

    if (!userIdValue || !passwordValue) {
      toast.error('Username or password is missing');
      return;
    }

    // Call the login function from the authStore
    await authStore.login(userIdValue, password.value);

    // Reset and close the modal after successful login
    password.value = '';
    authStore.toggleManagerLoginPopup(); // Close popup after login
    toast.success('Manager logged in successfully!');
  } catch (error) {
    toast.error('Manager login failed');
    console.error('Manager login failed:', error);
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
            </div>
            <button @click="loginManager" class="mt-8 bg-purple-500 text-white py-2 px-6 rounded-2xl hover:bg-purple-700">
              Login
            </button>
            <button @click="authStore.toggleManagerLoginPopup" class="mt-8 bg-weather-primary rounded-2xl text-white bg-purple-500 hover:bg-purple-400 hover:text-white py-2 px-6">
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
