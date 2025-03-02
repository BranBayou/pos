import { defineStore } from 'pinia';
import axios from 'axios';
import { ref } from 'vue';
import { useToast } from 'vue-toastification';

export const useAuthStore = defineStore('auth', () => {
  // Cashier State
  const isUserLoggedIn = ref(localStorage.getItem('token') ? true : false);
  const currentUser = ref(localStorage.getItem('currentUser') || '');
  const userRole = ref(localStorage.getItem('userRole') || ''); 
  const token = ref(localStorage.getItem('token') || null);
  
  // Manager State
  const isManagerLoggedIn = ref(localStorage.getItem('managerToken') ? true : false);
  const managerUser = ref(localStorage.getItem('managerUser') || ''); 
  const managerRole = ref(localStorage.getItem('managerRole') || ''); 
  const managerToken = ref(localStorage.getItem('managerToken') || null); 

  const usersList = ref([]);
  const managerUsersList = ref([]);
  const customersList = ref([]);
  const selectedCustomer = ref(null);

  const isLogoutConfirmationVisible = ref(false);
  const isAddManagerApprovalRequest = ref(false);
  const isCashierLoginInput = ref(true); 
  const isAddBehaviourPopup = ref(false);
  const isAddItemPopup = ref(false);
  const isManagerLoginPopupVisible = ref(false);
  const isAddSalesPopupVisible = ref(false);
  const isAddCustomerPopupVisible = ref(false);
  const isCheckoutPopupVisible = ref(false);
  const showCommentsModal = ref(false); 
  

  const isAddCommentButtonMoved = ref(false);
  const isAddManagerApprovalButtonMoved = ref(false);
  const isWalkInCustomerButtonMoved = ref(false)


  const storeId = 'R-qbuRxyn0iAi2dvDVSA6g';

  // Fetch Cashier
  async function fetchCashiers() {
    const toast = useToast();
    try {
      const response = await axios.get('/api/Users/BranchUsers', {
        headers: {
          'store-id': storeId // Pass the storeId as a header
        }
      });
      const cashiers = response.data.filter(user => user.role === 'Cashier');
      usersList.value = cashiers;
    } catch (error) {
      toast.error('Failed to load users', error.message);
    }
  }

  // Fetch Managers 
  async function fetchManager() {
    const toast = useToast();
    try {
      const response = await axios.get('/api/Users/BranchUsers', {
        headers: {
          'store-id': storeId // Pass the storeId as a header
        }
      });
      const managers = response.data.filter(user => user.role === 'Manager');
      managerUsersList.value = managers;
    } catch (error) {
      toast.error('Failed to load users', error.message);
    }
  }

  // Login API function for both cashier and manager
  async function login(userId, pin) {
    const toast = useToast();
    try {
      const response = await axios.post('/api/Users/Login', {
        userId, 
        pin,    
      }, {
        headers: {
          'store-id': storeId,
        }
      });
      
      const { jwt: authToken, role, fullName } = response.data || {}; 
      
      if (!authToken || !role || !fullName) {
        throw new Error('Invalid response from server');
      }
  
      // Allow login only for Cashier or Manager
      if (role !== 'Cashier' && role !== 'Manager') {
        throw new Error('Unauthorized role');
      }
  
      // If cashier logs in
      if (role === 'Cashier') {
        localStorage.setItem('token', authToken);
        localStorage.setItem('currentUser', fullName);
        localStorage.setItem('userRole', role);
        token.value = authToken;
        currentUser.value = fullName;
        userRole.value = role;
        isUserLoggedIn.value = true;
        toast.success(`Welcome back, ${fullName}`);
      }
    
      // If manager logs in
      if (role === 'Manager') {
        localStorage.setItem('managerToken', authToken);
        localStorage.setItem('managerUser', fullName);
        localStorage.setItem('managerRole', role);
        managerToken.value = authToken;
        managerUser.value = fullName;
        managerRole.value = role;
        isManagerLoggedIn.value = true;
        toast.success(`Welcome back, ${fullName}`);
      }
  
      console.log('Current User:', currentUser.value, 'Role:', userRole.value);
    } catch (error) {
      if (error.message === 'Unauthorized role') {
        toast.error('You are not authorized to log in.');
      } else {
        toast.error('Login failed!');
      }
      console.error('Login failed:', error.response?.data?.errors || error.message);
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
      fetchCashiers();
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

  // authStore.js or similar file
  function setLastUser(lastUser) {
    // Ensure the role is correctly set based on the last user
    currentUser.value = lastUser.currentUser || ''; 
    managerUser.value = lastUser.managerUser || '';
    userRole.value = lastUser.userRole || '';
    managerRole.value = lastUser.managerRole || '';
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

   // handle toggle toggle checkout popup
   function toggleCheckoutPopup () {
     isCheckoutPopupVisible.value =!isCheckoutPopupVisible.value;
     console.log('Show checkout popup:', !isCheckoutPopupVisible.value);
   }

   // handle toggle show comment modal
   function toggleShowCommentsModal () {
     showCommentsModal.value = !showCommentsModal.value;
     console.log('Show comments modal:', !showCommentsModal.value);
   }

   function toggleAddCommentButtonMoved () {
     isAddCommentButtonMoved.value =!isAddCommentButtonMoved.value;
   }

   function toggleAddManagerApprovalButtonMoved () {
     isAddManagerApprovalButtonMoved.value =!isAddManagerApprovalButtonMoved.value;
   }

   function toggleWalkInCustomerButtonMoved () {
     isWalkInCustomerButtonMoved.value =!isWalkInCustomerButtonMoved.value;
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
    // fetchCustomers,
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
    toggleCheckoutPopup,
    showCommentsModal,
    toggleShowCommentsModal,
    isAddCommentButtonMoved,
    toggleAddCommentButtonMoved,
    isAddManagerApprovalButtonMoved,
    toggleAddManagerApprovalButtonMoved,
    isWalkInCustomerButtonMoved,
    toggleWalkInCustomerButtonMoved,
    setLastUser,
  };
});

