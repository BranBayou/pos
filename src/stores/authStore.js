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

    //
    const isCashierLogin = ref(true);

    const toggleLogin = () => {
        isCashierLogin.value = !isCashierLogin.value;
    };

    return { isLoggedIn,
             login,
             logout,
             isCashierLogin, 
             toggleLogin
           };
    
});
