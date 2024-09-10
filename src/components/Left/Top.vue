<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue';
import Login from '../Popups/Login.vue';
import LogoutConfirmation from '../Popups/LogoutConfirmation.vue';
import OpenDrawer from './OpenDrawer.vue';
import ItemsSearch from './ItemsSearchButton.vue';
import AddBehavior from '../Popups/AddBehavior.vue';
import AddComment from './AddCommentButton.vue';
import AddManagerApproval from './AddManagerApprovalButton.vue';
import WalkInCustomer from './WalkInCustomerButton.vue';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale.css';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();

// Modal control for Login
const modalActive = ref(null);
const toggleModal = () => {
  modalActive.value = !modalActive.value;
};

const toggleisLogoutConfirmationVisible = () => {
  authStore.isLogoutConfirmationVisible = !authStore.isLogoutConfirmationVisible;
};

// Handle login/logout logic
const handleAuthAction = () => {
  if (authStore.isUserLoggedIn) {
    toggleisLogoutConfirmationVisible();
  } else {
    toggleModal();
    authStore.fetchCashiers();
  }
};

// Tooltip for login button
const myButton = ref(null);
let tooltipInstance = null;

onMounted(() => {
  tooltipInstance = tippy(myButton.value, {
    content: authStore.isUserLoggedIn ? 'Logout' : 'Login',
    placement: 'top',
    animation: 'fade',
  });
});

// Watch for changes in the user's logged-in status and update tooltip content
watch(() => authStore.isUserLoggedIn, (newValue) => {
  if (tooltipInstance) {
    tooltipInstance.setContent(newValue ? 'Logout' : 'Login');
  }
});

// State for buttons moved from the child component
const movedButtons = ref([]);

const moveButtonToParent = (buttonName) => {
  // Find the button by name and move it to the parent component's array
  const buttonIndex = buttons.value.findIndex(button => button.name === buttonName);
  if (buttonIndex !== -1) {
    const [button] = buttons.value.splice(buttonIndex, 1);
    movedButtons.value.push(button);
  }
};

// Initial buttons array
const buttons = ref([
  { name: 'AddComment', component: AddComment },
  { name: 'AddManagerApproval', component: AddManagerApproval },
  { name: 'WalkInCustomer', component: WalkInCustomer },
]);

// Countdown and inactivity logic
const countdown = ref(60); // Start countdown from 60 seconds
let countdownInterval = null;

const startCountdown = () => {
  clearInterval(countdownInterval);
  countdown.value = 60; // Reset countdown to 60 seconds

  countdownInterval = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value -= 1; // Decrease by 1 every second
    } else {
      clearInterval(countdownInterval);
      authStore.logout(); // Trigger logout when countdown reaches zero
    }
  }, 1000000000);
};

// Reset countdown on user interaction
const resetCountdown = () => {
  startCountdown(); // Restart countdown when there's user activity
};

// Watch for login status and manage countdown accordingly
watch(() => authStore.isUserLoggedIn, (isLoggedIn) => {
  if (isLoggedIn) {
    startCountdown(); // Start countdown if the user is logged in
    window.addEventListener('mousemove', resetCountdown);
    window.addEventListener('keydown', resetCountdown);
  } else {
    clearInterval(countdownInterval); // Stop countdown on logout
    countdown.value = 60; // Reset countdown display to 60
    window.removeEventListener('mousemove', resetCountdown);
    window.removeEventListener('keydown', resetCountdown);
  }
});

onMounted(() => {
  if (authStore.isUserLoggedIn) {
    startCountdown(); // Start countdown if the user is logged in
    window.addEventListener('mousemove', resetCountdown);
    window.addEventListener('keydown', resetCountdown);
  }
});

onUnmounted(() => {
  // Clean up interval and event listeners when component unmounts
  clearInterval(countdownInterval);
  window.removeEventListener('mousemove', resetCountdown);
  window.removeEventListener('keydown', resetCountdown);
});
</script>

<template>
  <div class="my-7 grid grid-cols-2 gap-4 overflow-y-auto" style="max-height: 450px;">
    <LogoutConfirmation />
    <Login 
      @close-modal="toggleModal"
      :modalActive="modalActive"
    />
    <div class="relative flex items-center border shadow-lg w-full p-5 rounded-2xl gap-5 my-3">  
      <div>
        <button class="flex flex-col items-center">
          <img style="width: 30px;" src="/cashier.png" alt="">
          <span class="font-semibold">{{ authStore.isUserLoggedIn ? authStore.userRole : 'Cashier' }}</span>
        </button>
      </div>
      <i @click="handleAuthAction" ref="myButton" class="pi pi-user text-purple-500 bg-purple-100 p-4 rounded-full cursor-pointer" style="font-size: 1.875rem;"></i>
      <span class="font-medium">{{ authStore.isUserLoggedIn ? authStore.currentUser : 'Logged out' }}</span>

      <!-- Countdown Timer -->
      <span v-if="authStore.isUserLoggedIn" class="absolute bottom-2 right-2 flex items-center gap-2">
        <p>{{ countdown }}</p>
        <i class="pi pi-clock" style="font-size: 20px;"></i>
      </span>
    </div>

    <!-- When Manager Logs In Show -->
    <div v-show="authStore.isManagerLoggedIn" class="relative flex items-center border shadow-lg w-full p-5 rounded-2xl gap-5 my-3">  
      <div>
        <button class="flex flex-col items-center">
          <img style="width: 30px;" src="/manager.svg" alt="Manager Image">
          <span class="font-semibold">{{ authStore.isManagerLoggedIn ? authStore.managerRole : 'Manager' }}</span>
        </button>
      </div>
      <i @click="handleAuthAction" ref="myButton" class="pi pi-user text-purple-500 bg-purple-100 p-4 rounded-full cursor-pointer" style="font-size: 1.875rem;"></i>
      <span class="font-medium">{{ authStore.isManagerLoggedIn ? authStore.managerUser : 'Logged out' }}</span>
    
      <!-- Countdown Timer -->
      <span v-if="authStore.isManagerLoggedIn" class="absolute bottom-2 right-2 flex items-center gap-2">
        <p>{{ countdown }}</p>
        <i class="pi pi-clock" style="font-size: 20px;"></i>
      </span>
    </div>

    
    <ItemsSearch v-if="authStore.isUserLoggedIn" />
    <OpenDrawer v-if="authStore.isUserLoggedIn" />
    
    <AddBehavior @moveButtonToParent="moveButtonToParent"/>

    <!-- Render moved buttons -->
    <div v-for="button in movedButtons" :key="button.name">
      <component :is="button.component" class="" />
    </div>

    <button
      :disabled="!authStore.isUserLoggedIn" 
      @click="authStore.toggleAddBehaviourPopup"
      class="border shadow-lg w-full text-center p-5 rounded-2xl flex gap-5 my-3 cursor-pointer">
      <span class="text-center mx-auto cursor-pointer">
        <i 
          class="pi pi-plus text-purple-500 bg-purple-100 p-4 rounded-full"
          :class="{ 'opacity-50 cursor-not-allowed': !authStore.isUserLoggedIn }"
          style="font-size: 1.875rem;"
        ></i>
      </span>
    </button>
  </div>
</template>

<style scoped>

</style>