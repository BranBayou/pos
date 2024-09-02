import { defineStore } from 'pinia';
import axios from 'axios';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
    // State
    const isUserLoggedIn = ref(false);
    const currentUser = ref(''); // Track the current user's name
    const userRole = ref(''); // Track the current user's role
    const isLogoutConfirmationVisible = ref(false);

    // Login Function
    function login(username, role) {
        isUserLoggedIn.value = true;
        currentUser.value = username; // Set the current user's name
        userRole.value = localStorage.getItem('userRole')
        console.log('Current User:', currentUser.value, 'Role:', userRole.value); // Debugging log
    }

    // Logout Function
    function logout() {
        isUserLoggedIn.value = false;
        currentUser.value = ''; // Clear the current user's name
        userRole.value = ''; // Clear the current user's role
        localStorage.removeItem('token'); // Clear the token
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userRole'); // Clear the role
    }

    // Login input type state
    const isCashierLoginInput = ref(true);

    const toggleLoginInput = () => {
        isCashierLoginInput.value = !isCashierLoginInput.value;
    };

    // Add behaviour state
    const isAddBehaviourPopup = ref(false);

    const toggleAddBehaviourPopup = () => {
        isAddBehaviourPopup.value = !isAddBehaviourPopup.value;
        console.log('Show popup:', isAddBehaviourPopup.value);
    };

    // Add Item state
    const isAddItemPopup = ref(false);
    
    const toggleAddItemPopup = () => {
        isAddItemPopup.value = !isAddItemPopup.value;
        console.log('Show popup:', isAddItemPopup.value);
    };

    return {
        isUserLoggedIn,
        currentUser,
        userRole, // Export userRole
        login,
        logout,
        isCashierLoginInput,
        toggleLoginInput,
        isLogoutConfirmationVisible,
        isAddBehaviourPopup,
        toggleAddBehaviourPopup,
        isAddItemPopup,
        toggleAddItemPopup
    };
});
