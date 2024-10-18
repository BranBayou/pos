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
import AddCustomer from '../Popups/AddCusotmer.vue'
import msgIcon from '/message.svg';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale.css';
import { useAuthStore } from '@/stores/authStore';
import { useOrderStore } from '@/stores/OrderStore';

const authStore = useAuthStore();
const orderStore = useOrderStore();

const logoutRole = ref(null); 

// Modal control for Login
const modalActive = ref(null);
const toggleModal = () => {
  modalActive.value = !modalActive.value;

  if (modalActive.value) {
    // Retrieve the last user from localStorage
    const lastUser = JSON.parse(localStorage.getItem('lastUser'));
    if (lastUser) {
      // Call the setLastUser method with the stored data
      authStore.setLastUser(lastUser);
    }
  }
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

      // Save last user to localStorage before logging out
      localStorage.setItem('lastUser', JSON.stringify({
        currentUser: authStore.currentUser,
        userRole: authStore.userRole,
        managerUser: authStore.managerUser,
        managerRole: authStore.managerRole,
      }));

      // Perform the logout
      authStore.logout(authStore.userRole); 
      authStore.logout(authStore.managerRole);
    }
  }, 1000);
};



const resetCountdown = () => {
  startCountdown();
};

const handleManagerApproval = () => {
  authStore.toggleManagerLoginPopup();
  console.log('Manager approval triggered successfully!');
};

const handleWalkInCustomer = () => {
  authStore.toggleAddCustomerPopup();
  console.log('Walk-in customer triggered successfully!');
};

const handleCommentAdded = () => {
  authStore.toggleShowCommentsModal();
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

const hasEmptyComment = ref(false); // Reactive tracking for empty comments
const getAllComments = ref([]); // Reactive array for all comments

// Function to update the comments and check for empty commentText
const updateComments = () => {
  const storedState = JSON.parse(localStorage.getItem('newOrder')) || {};
  getAllComments.value = storedState.comments || [];
  hasEmptyComment.value = getAllComments.value.some(comment => !comment.text.trim());
};


// Call updateComments on mounted and when comments are saved
onMounted(() => {
  updateComments();
});
window.addEventListener('comment-saved', updateComments);

</script>

<template>
  <div class="my-7 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-y-auto" style="max-height: 450px;">
    <LogoutConfirmation v-if="authStore.isLogoutConfirmationVisible" :role="logoutRole" />

    <Login @close-modal="toggleModal" :modalActive="modalActive" />

    <ManagerLogin />

    <AddCustomer />
    
    <!-- Cashier Section -->
    <div class="relative flex items-center bg-white w-full p-5 rounded-2xl gap-5 my-3">  
      <div>
        <button class="flex flex-col items-center">
          <img style="width: 30px;" src="/cashier.png" alt="">
          <span class="font-semibold">{{ authStore.isUserLoggedIn ? authStore.userRole : 'Cashier' }}</span>
        </button>
      </div>
      <i @click="handleAuthAction('Cashier')" ref="myButton" class="pi pi-user text-purple-500 bg-purple-100 p-4 rounded-full cursor-pointer" style="font-size: 1.875rem;"></i>
      <span class="font-medium">{{ authStore.isUserLoggedIn ? authStore.currentUser : 'Logged out' }}</span>

      <!-- Countdown Timer -->
      <span v-if="authStore.isUserLoggedIn && countdown <= 10" class="absolute bottom-2 right-2 flex items-center gap-2">
        <p>{{ countdown }}</p>
        <i class="pi pi-clock" style="font-size: 20px;"></i>
      </span>
    </div>

    <!-- Manager Section -->
    <div v-show="authStore.isManagerLoggedIn" class="relative flex items-center justify-start lg:justify-center bg-white w-full py-2 px-2 gap-3 rounded-2xl my-3">  
      <div>
        <button class="flex flex-col items-center">
          <img style="width: 30px;" src="/manager.svg" alt="Manager Image">
          <span class="font-semibold">{{ authStore.isManagerLoggedIn ? authStore.managerRole : 'Manager' }}</span>
        </button>
      </div>
      <i @click="handleAuthAction('Manager')" ref="myButton" class="pi pi-user text-purple-500 bg-purple-100 p-4 rounded-full cursor-pointer" style="font-size: 1.875rem;"></i>
      <span class="font-medium">{{ authStore.isManagerLoggedIn ? authStore.managerUser : 'Logged out' }}</span>

      <img 
        v-if="orderStore.state.comments.length > 0"
        :src="msgIcon" 
        :class="hasEmptyComment ? 'bg-red-400' : 'bg-green-400'" 
        class="rounded-md cursor-pointer p-2" 
        alt="Comment Icon" 
        @click="authStore.toggleShowCommentsModal"
      />
    </div>

    <ItemsSearch v-if="authStore.isUserLoggedIn" />
    <OpenDrawer v-if="authStore.isUserLoggedIn" />
    <AddBehavior />
    <AddComment 
     v-if="authStore.isAddCommentButtonMoved"
     @click="handleCommentAdded"
    />
    <AddManagerApproval 
     v-if="authStore.isAddManagerApprovalButtonMoved" 
     @click="handleManagerApproval" 
    />
    <WalkInCustomer 
     v-if="authStore.isWalkInCustomerButtonMoved || orderStore.state.customer.name != ''"
     @click="handleWalkInCustomer" 
    />
    <button
      :disabled="!(authStore.isUserLoggedIn || authStore.isManagerLoggedIn)"
      @click="authStore.toggleAddBehaviourPopup"
      class="bg-white w-full text-center p-5 rounded-2xl flex gap-5 my-3 cursor-pointer">
      <span class="text-center mx-auto cursor-pointer">
        <i class="pi pi-plus text-purple-500 bg-purple-100 p-4 rounded-full" :class="{ 'opacity-50 cursor-not-allowed': !(authStore.isUserLoggedIn || authStore.isManagerLoggedIn) }" style="font-size: 1.875rem;"></i>
      </span>
    </button>

    <!-- Comments Modal -->
    <Comments v-if="authStore.showCommentsModal" @close="authStore.toggleShowCommentsModal" />
  </div>
</template>



<style scoped>

</style>