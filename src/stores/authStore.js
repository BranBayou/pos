import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
    // LoggedIn State
    const isLoggedIn = ref(false);

    function login() {
        isLoggedIn.value = true;
    }

    function logout() {
        isLoggedIn.value = false;
    }

    return { isLoggedIn, login, logout };
});
