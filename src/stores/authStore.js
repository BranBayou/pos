import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
    // LoggedIn State
    const isUserLoggedIn = ref(false);
    const currentUser = ref(''); // Track the current user's name

    function login(username) {
        isUserLoggedIn.value = true;
        currentUser.value = username; // Set the current user's name
        console.log('Current User:', currentUser.value); // Debugging log
    }

    function logout() {
        isUserLoggedIn.value = false;
        currentUser.value = ''; // Clear the current user's name
        localStorage.removeItem('token'); // Clear the token
    }

    //
    const isCashierLogin = ref(true);

    const toggleLogin = () => {
        isCashierLogin.value = !isCashierLogin.value;
    };

    return {
        isUserLoggedIn,
        currentUser, // Export currentUser
        login,
        logout,
        isCashierLogin,
        toggleLogin
    };
});

