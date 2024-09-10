<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import axios from 'axios';
import Select from 'primevue/select';
import Password from 'primevue/password';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();
const toast = useToast();
const usersList = ref([]); // List of managers
const selectedUser = ref(null);
const password = ref('');

// Fetch manager users on modal open
onMounted(async () => {
  try {
    const response = await axios.get('http://localhost:3131/branchusers');
    const managers = response.data.filter(user => user.role === 'Manager');
    usersList.value = managers;
  } catch (error) {
    toast.error('Failed to load manager users');
    console.error('Error loading manager users:', error);
  }
});

// Function to handle manager login
const loginManager = async () => {
  try {
    const usernameValue = selectedUser.value?.username;
    const passwordValue = password.value;

    if (!usernameValue || !passwordValue) {
      toast.error('Username or password is missing');
      return;
    }

    const response = await axios.post('http://localhost:3131/login', {
      username: usernameValue,
      password: passwordValue
    });

    const { token, role } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('currentUser', usernameValue);
    localStorage.setItem('userRole', role);
    authStore.login(usernameValue, role);

    toast.success(`Manager ${usernameValue} logged in successfully`);

    password.value = '';
    managerModalActive.value = false; // Close the modal after successful login
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
                    <Select v-model="selectedUser" :options="usersList" optionLabel="username" placeholder="Manager Login" class="w-full py-3" />
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
              <button @click="managerModalActive = false" class="mt-8 bg-weather-primary rounded-2xl text-white bg-purple-500 hover:bg-purple-400 hover:text-white py-2 px-6">
                Close
              </button>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </template>
  

  