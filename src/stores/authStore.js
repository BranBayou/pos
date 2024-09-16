import { defineStore } from 'pinia';
import axios from 'axios';
import { ref } from 'vue';
import { useToast } from 'vue-toastification';

export const useAuthStore = defineStore('auth', () => {
  // Cashier State
  const isUserLoggedIn = ref(localStorage.getItem('token') ? true : false);
  const currentUser = ref(localStorage.getItem('currentUser') || ''); // Track the cashier's name
  const userRole = ref(localStorage.getItem('userRole') || ''); // Track the cashier's role
  const token = ref(localStorage.getItem('token') || null); // Track the cashier's token
  
  // Manager State
  const isManagerLoggedIn = ref(localStorage.getItem('managerToken') ? true : false);
  const managerUser = ref(localStorage.getItem('managerUser') || ''); // Track the manager's name
  const managerRole = ref(localStorage.getItem('managerRole') || ''); // Track the manager's role
  const managerToken = ref(localStorage.getItem('managerToken') || null); // Track the manager's token

  const usersList = ref([]); // List of users (cashiers)
  const managerUsersList = ref([]);
  const customersList = ref([]); // List of customers
  const selectedCustomer = ref(null);

  const isLogoutConfirmationVisible = ref(false);
  const isAddManagerApprovalRequest = ref(false);
  const isCashierLoginInput = ref(true); // Login input type state
  const isAddBehaviourPopup = ref(false);
  const isAddItemPopup = ref(false);
  const isManagerLoginPopupVisible = ref(false);
  const isAddSalesPopupVisible = ref(false);
  const isAddCustomerPopupVisible = ref(false);
  const isCheckoutPopupVisible = ref(false);

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

  // Fetch Managers Function
  async function fetchManager() {
    const toast = useToast();
    try {
      const response = await axios.get('http://localhost:3131/branchusers');
      const managers = response.data.filter(user => user.role === 'Manager');
      managerUsersList.value = managers;
      console.log('Fetched Manager Users:', managerUsersList.value);
    } catch (error) {
      toast.error('Failed to load users', error.message);
      console.error('Failed to load users:', error.message);
    }
  }

  // Fetch Customers Function
  async function fetchCustomers() {
    const toast = useToast();
    try {
      const response = await axios.get('http://localhost:3131/customers');
      customersList.value = response.data;
      console.log('Fetched Customers:', customersList.value);
    } catch (error) {
      toast.error('Failed to load customers', error.message);
      console.error('Failed to load customers:', error.message);
    }
  }

  // Login API function for both cashier and manager
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

      // If cashier logs in
      if (role === 'Cashier') {
        localStorage.setItem('token', authToken);
        localStorage.setItem('currentUser', username);
        localStorage.setItem('userRole', role);
        token.value = authToken;
        currentUser.value = username;
        userRole.value = role;
        isUserLoggedIn.value = true;
      }

      // If manager logs in
      if (role === 'Manager') {
        localStorage.setItem('managerToken', authToken);
        localStorage.setItem('managerUser', username);
        localStorage.setItem('managerRole', role);
        managerToken.value = authToken;
        managerUser.value = username;
        managerRole.value = role;
        isManagerLoggedIn.value = true;
      }

      toast.success(`Welcome back ${username}`);
      console.log('Current User:', currentUser.value, 'Role:', userRole);
    } catch (error) {
      toast.error('Login failed!');
      console.error('Login failed:', error.response?.data?.error || error.message);
      throw error;
    }
  }

  // Logout Function
  function logout(role) {
    if (role === 'Cashier') {
      // Only log out the cashier
      isUserLoggedIn.value = false;
      currentUser.value = '';
      userRole.value = '';
      token.value = null;
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('userRole');
    } else if (role === 'Manager') {
      // Only log out the manager
      isManagerLoggedIn.value = false;
      managerUser.value = '';
      managerRole.value = '';
      managerToken.value = null;
      localStorage.removeItem('managerToken');
      localStorage.removeItem('managerUser');
      localStorage.removeItem('managerRole');
    }
  }
  
  // Toggle Login input type
  function toggleLoginInput() {
    isCashierLoginInput.value = !isCashierLoginInput.value;
  }

  // Toggle Manager login popup
  function toggleManagerLoginPopup() {
    isManagerLoginPopupVisible.value = !isManagerLoginPopupVisible.value;
    console.log('Show login popup:', isManagerLoginPopupVisible.value);
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

  // Toggle Add sales popup
  function toggleAddSalesPopup () {
    isAddSalesPopupVisible.value = !isAddSalesPopupVisible.value;
    console.log('Show sales popup:', isAddSalesPopupVisible.value);
  }

  // Toggle Add customer popup

  function toggleAddCustomerPopup () {
    isAddCustomerPopupVisible.value = !isAddCustomerPopupVisible.value;
    console.log('Show Customers popup:', !isAddSalesPopupVisible.value);
  }

   // Function to set selected customer
   const setSelectedCustomer = (customer) => {
     selectedCustomer.value = customer;
   };

   //
   function toggleCheckoutPopup () {
     isCheckoutPopupVisible.value =!isCheckoutPopupVisible.value;
     console.log('Show checkout popup:', !isCheckoutPopupVisible.value);
   }

  return {
    isUserLoggedIn,
    currentUser,
    userRole,
    token,
    usersList,
    isManagerLoggedIn,
    managerUser,
    managerRole,
    managerToken,
    managerUsersList,
    customersList, 
    fetchCashiers,
    fetchManager,
    fetchCustomers,
    login,
    logout,
    isCashierLoginInput,
    toggleLoginInput,
    isLogoutConfirmationVisible,
    toggleAddBehaviourPopup,
    isAddBehaviourPopup,
    isAddItemPopup,
    toggleAddItemPopup,
    isAddManagerApprovalRequest,
    toggleAddManagerApprovalRequest,
    isManagerLoginPopupVisible,
    toggleManagerLoginPopup,
    isAddSalesPopupVisible,
    toggleAddSalesPopup,
    isAddCustomerPopupVisible,
    toggleAddCustomerPopup,
    selectedCustomer,
    setSelectedCustomer,
    isCheckoutPopupVisible,
    toggleCheckoutPopup
  };
});

