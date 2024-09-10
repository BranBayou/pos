import { defineStore } from 'pinia';
import axios from 'axios';
import { ref } from 'vue';
import { useToast } from 'vue-toastification';

export const useAuthStore = defineStore('auth', () => {
  // State
  const isUserLoggedIn = ref(localStorage.getItem('token') ? true : false);
  const currentUser = ref(localStorage.getItem('currentUser') || ''); // Track the current user's name
  const userRole = ref(localStorage.getItem('userRole') || ''); // Track the current user's role
  const token = ref(localStorage.getItem('token') || null); // Track the token
  const usersList = ref([]); // List of users (cashiers)
  const managerUsersList = ref([]);
  
  const isLogoutConfirmationVisible = ref(false);
  const isAddManagerApprovalRequest = ref(false);
  const isCashierLoginInput = ref(true); // Login input type state
  const isAddBehaviourPopup = ref(false);
  const isAddItemPopup = ref(false);
  const isManagerLoginPopupVisible = ref(false);

  // Fetch Cashiers Function
  async function fetchCashiers() {
    const toast = useToast();
    try {
      const response = await axios.get('http://localhost:3131/branchusers');
      const cashiers = response.data.filter(user => user.role === 'Cashier');
      usersList.value = cashiers;
      console.log('Fetched Cashier Users:', usersList.value);
    } catch (error) {
      toast.error('Failed to load users', error.message);
      console.error('Failed to load users:', error.message);
    }
  }

  async function fetchManager() {
    const toast = useToast();
    try {
      const response = await axios.get('http://localhost:3131/branchusers');
      const cashiers = response.data.filter(user => user.role === 'Manager');
      managerUsersList.value = cashiers;
      console.log('Fetched Manager Users:', managerUsersList.value);
    } catch (error) {
      toast.error('Failed to load users', error.message);
      console.error('Failed to load users:', error.message);
    }
  }

  // Login Api Function
  async function login(username, password, storeId) {
    const toast = useToast();
    try {
      const response = await axios.post('http://localhost:3131/login', {
        username,
        password,
      }, {
        headers: {
          'store-id': storeId,
        }
      });

      const { token: authToken, role } = response.data;
      localStorage.setItem('token', authToken);
      localStorage.setItem('currentUser', username);
      localStorage.setItem('userRole', role);

      token.value = authToken;
      currentUser.value = username;
      userRole.value = role;
      isUserLoggedIn.value = true;

      toast.success(`Welcome back ${username}`);
      console.log('Current User:', currentUser.value, 'Role:', userRole.value);
    } catch (error) {
      toast.error('Login failed!');
      console.error('Login failed:', error.response?.data?.error || error.message);
      throw error;
    }
  }

  // Logout Function
  function logout() {
    isUserLoggedIn.value = false;
    currentUser.value = ''; // Clear the current user's name
    userRole.value = ''; // Clear the current user's role
    token.value = null; // Clear the token
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole'); // Clear the role
  }

  // Toggle Login input type
  function toggleLoginInput() {
    isCashierLoginInput.value = !isCashierLoginInput.value;
  }

  // Toggle Add behaviour popup
  function toggleAddBehaviourPopup() {
    isAddBehaviourPopup.value = !isAddBehaviourPopup.value;
    console.log('Show popup:', isAddBehaviourPopup.value);
  }

  // Toggle Add item popup
  function toggleAddItemPopup() {
    isAddItemPopup.value = !isAddItemPopup.value;
    console.log('Show popup:', isAddItemPopup.value);
  }

  // Toggle Manager approval request popup
  function toggleAddManagerApprovalRequest() {
    isAddManagerApprovalRequest.value = !isAddManagerApprovalRequest.value;
    console.log('Show mng request popup:', isAddManagerApprovalRequest.value);
  }

  function toggleManagerLoginPopup() {
    isManagerLoginPopupVisible.value = !isManagerLoginPopupVisible.value;
    console.log('Show login popup:', isManagerLoginPopupVisible.value);
  }

  return {
    isUserLoggedIn,
    currentUser,
    userRole,
    token,
    usersList,
    managerUsersList,
    fetchCashiers,
    fetchManager,
    login,
    logout,
    isCashierLoginInput,
    toggleLoginInput,
    isLogoutConfirmationVisible,
    isAddBehaviourPopup,
    toggleAddBehaviourPopup,
    isAddItemPopup,
    toggleAddItemPopup,
    isAddManagerApprovalRequest,
    toggleAddManagerApprovalRequest,
    isManagerLoginPopupVisible,
    toggleManagerLoginPopup
  };
});
