import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
    // LoggedIn State
    const isUserLoggedIn = ref(false);
    const currentUser = ref(''); // Track the current user's name
    const isLogoutConfirmationVisible = ref(false)


    function login(username) {
        isUserLoggedIn.value = true;
        currentUser.value = username; // Set the current user's name
        console.log('Current User:', currentUser.value); // Debugging log
    }

    function logout() {
        isUserLoggedIn.value = false;
        currentUser.value = ''; // Clear the current user's name
        localStorage.removeItem('token'); // Clear the token
        localStorage.removeItem('currentUser');
    }

    // Login input type state
    const isCashierLoginInput = ref(true);

    const toggleLoginInput = () => {
        isCashierLoginInput.value = !isCashierLoginInput.value;
    };



    return {
        isUserLoggedIn,
        currentUser, // Export currentUser
        login,
        logout,
        isCashierLoginInput,
        toggleLoginInput,
        isLogoutConfirmationVisible
    };
});

