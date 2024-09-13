<script setup>
import { onMounted, onUnmounted, computed, ref, watch } from 'vue';
import Login from '../Popups/Login.vue';
import LogoutConfirmation from '../Popups/LogoutConfirmation.vue';
import OpenDrawer from './OpenDrawer.vue';
import ItemsSearch from './ItemsSearchButton.vue';
import AddBehavior from '../Popups/AddBehavior.vue';
import AddComment from './AddCommentButton.vue';
import AddManagerApproval from './AddManagerApprovalButton.vue';
import WalkInCustomer from './WalkInCustomerButton.vue';
import ManagerLogin from '../Popups/ManagerLogin.vue';
import Comments from '../Popups/Comments.vue';
import msgIcon from '/message.svg';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale.css';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();
const showCommentsModal = ref(false); // State to control the display of Comments modal

const logoutRole = ref(null); // Track which role is triggering logout confirmation

// Modal control for Login
const modalActive = ref(null);
const toggleModal = () => {
  modalActive.value = !modalActive.value;
};

const toggleisLogoutConfirmationVisible = (role) => {
  logoutRole.value = role; // Set the role for logout confirmation
  authStore.isLogoutConfirmationVisible = !authStore.isLogoutConfirmationVisible;
};

// Handle login/logout logic
const handleAuthAction = (role) => {
  if (role === 'Cashier' && authStore.isUserLoggedIn) {
    toggleisLogoutConfirmationVisible('Cashier');
  } else if (role === 'Manager' && authStore.isManagerLoggedIn) {
    toggleisLogoutConfirmationVisible('Manager');
  } else {
    toggleModal();
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
const countdown = ref(60);
let countdownInterval = null;

const startCountdown = () => {
  clearInterval(countdownInterval);
  countdown.value = 60;

  countdownInterval = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value -= 1;
    } else {
      clearInterval(countdownInterval);
      authStore.logout();
    }
  }, 1000000000);
};

const resetCountdown = () => {
  startCountdown();
};

const handleManagerApproval = () => {
  console.log('Manager approval triggered successfully!');
  authStore.toggleManagerLoginPopup();
};

const handleWalkInCustomer = () => {
  console.log('Walk-in customer triggered successfully!');
};

const handleCommentAdded = () => {
  console.log('Comment added successfully!');
};

// Watch for login status and manage countdown accordingly
watch(() => authStore.isUserLoggedIn, (isLoggedIn) => {
  if (isLoggedIn) {
    startCountdown();
    window.addEventListener('mousemove', resetCountdown);
    window.addEventListener('keydown', resetCountdown);
  } else {
    clearInterval(countdownInterval);
    countdown.value = 60;
    window.removeEventListener('mousemove', resetCountdown);
    window.removeEventListener('keydown', resetCountdown);
  }
});

onMounted(() => {
  if (authStore.isUserLoggedIn) {
    startCountdown();
    window.addEventListener('mousemove', resetCountdown);
    window.addEventListener('keydown', resetCountdown);
  }
});

onUnmounted(() => {
  clearInterval(countdownInterval);
  window.removeEventListener('mousemove', resetCountdown);
  window.removeEventListener('keydown', resetCountdown);
});
</script>

<template>
  <div class="my-7 grid grid-cols-2 gap-4 overflow-y-auto" style="max-height: 450px;">
    <LogoutConfirmation v-if="authStore.isLogoutConfirmationVisible" :role="logoutRole" />

    <Login @close-modal="toggleModal" :modalActive="modalActive" />

    <ManagerLogin />

    <!-- Cashier Section -->
    <div class="relative flex items-center border shadow-lg w-full p-5 rounded-2xl gap-5 my-3">  
      <div>
        <button class="flex flex-col items-center">
          <img style="width: 30px;" src="/cashier.png" alt="">
          <span class="font-semibold">{{ authStore.isUserLoggedIn ? authStore.userRole : 'Cashier' }}</span>
        </button>
      </div>
      <i @click="handleAuthAction('Cashier')" ref="myButton" class="pi pi-user text-purple-500 bg-purple-100 p-4 rounded-full cursor-pointer" style="font-size: 1.875rem;"></i>
      <span class="font-medium">{{ authStore.isUserLoggedIn ? authStore.currentUser : 'Logged out' }}</span>

      <!-- Countdown Timer -->
      <span v-if="authStore.isUserLoggedIn" class="absolute bottom-2 right-2 flex items-center gap-2">
        <p>{{ countdown }}</p>
        <i class="pi pi-clock" style="font-size: 20px;"></i>
      </span>
    </div>

    <!-- Manager Section -->
    <div v-show="authStore.isManagerLoggedIn" class="relative flex items-center border shadow-lg w-full p-2 rounded-2xl gap-5 my-3">  
      <div>
        <button class="flex flex-col items-center">
          <img style="width: 30px;" src="/manager.svg" alt="Manager Image">
          <span class="font-semibold">{{ authStore.isManagerLoggedIn ? authStore.managerRole : 'Manager' }}</span>
        </button>
      </div>
      <i @click="handleAuthAction('Manager')" ref="myButton" class="pi pi-user text-purple-500 bg-purple-100 p-4 rounded-full cursor-pointer" style="font-size: 1.875rem;"></i>
      <span class="font-medium">{{ authStore.isManagerLoggedIn ? authStore.managerUser : 'Logged out' }}</span>

      <img :src="msgIcon" class="rounded-md cursor-pointer" alt="" @click="showCommentsModal = true">
    </div>

    <ItemsSearch v-if="authStore.isUserLoggedIn" />
    <OpenDrawer v-if="authStore.isUserLoggedIn" />

    <AddBehavior @moveButtonToParent="moveButtonToParent" />

    <!-- Render moved buttons -->
    <div v-for="button in movedButtons" :key="button.name">
      <component
        :is="button.component"
        @commentAdded="handleCommentAdded"
        @managerApproval="handleManagerApproval"
        @walkInCustomer="handleWalkInCustomer"
      />
    </div>

    <button
      :disabled="!authStore.isUserLoggedIn" 
      @click="authStore.toggleAddBehaviourPopup"
      class="border shadow-lg w-full text-center p-5 rounded-2xl flex gap-5 my-3 cursor-pointer">
      <span class="text-center mx-auto cursor-pointer">
        <i class="pi pi-plus text-purple-500 bg-purple-100 p-4 rounded-full" :class="{ 'opacity-50 cursor-not-allowed': !authStore.isUserLoggedIn }" style="font-size: 1.875rem;"></i>
      </span>
    </button>

    <!-- Comments Modal -->
    <Comments v-if="showCommentsModal" @close="showCommentsModal = false" />
  </div>
</template>



<style scoped>

</style>