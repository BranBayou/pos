import { ref, reactive, computed, onMounted } from 'vue';
import { defineStore } from 'pinia';

export const useOrderStore = defineStore('orders', () => {
  const state = reactive({
    orderItems: [],
    gst: 5, // GST default value
    pst: 7, 
    overallDiscount: ref(0),
  });

  const selectedSalesPerson = ref(null);

  function setSelectedSalesPerson(salesPerson) {
    selectedSalesPerson.value = salesPerson; 
  }

  function applySalesPersonToAllItems(salesPerson) {
    // Apply the selected salesperson to all items in the order
    state.orderItems.forEach((item) => {
      item.salesPerson = salesPerson;
    });
  }

  // Helper function to save the current orderItems to localStorage
  function saveOrderItemsToLocalStorage() {
    localStorage.setItem('orderItems', JSON.stringify(state.orderItems));
  }

  // Helper function to load orderItems from localStorage
  function loadOrderItemsFromLocalStorage() {
    const savedItems = JSON.parse(localStorage.getItem('orderItems'));
    if (savedItems) {
      state.orderItems = savedItems;
    }
  }

  // Add an order item to the list or increment the quantity if it exists
  function addOrderItem(item) {
    const existingItem = state.orderItems.find(orderItem =>
      orderItem.id === item.id && orderItem.Sku === item.Sku && orderItem.Price === item.Price
    );
  
    if (existingItem) {
      existingItem.qty++;
    } else {
      const newItem = {
        ...item,
        qty: 1,
        discountPercentage: item.discountPercentage || 0, // Ensure discount is tracked
        OriginalPrice: item.Price, // Track original price for discount calculations
        salesPerson: selectedSalesPerson.value // Assign the selected salesperson to the item
      };
  
      // Apply the overall discount to the newly added item if it exists
      if (state.overallDiscount && state.overallDiscount > 0) {
        newItem.Price = (newItem.OriginalPrice * (1 - state.overallDiscount / 100)).toFixed(2);
        newItem.discountPercentage = state.overallDiscount; // Apply the overall discount percentage
      }
  
      state.orderItems.push(newItem);
    }

    // Save the updated orderItems to localStorage
    saveOrderItemsToLocalStorage();
  }

  // Increment quantity of a specific order item
  function incrementOrderItem(item) {
    const existingItem = state.orderItems.find(orderItem =>
      orderItem.id === item.id && orderItem.Sku === item.Sku
    );
    if (existingItem && existingItem.qty < existingItem.MaxQty) {
      existingItem.qty++;
      saveOrderItemsToLocalStorage(); // Save after incrementing
    }
  }

  // Decrement quantity of a specific order item or delete it if quantity is 1
  function decrementOrderItem(item) {
    const existingItem = state.orderItems.find(orderItem =>
      orderItem.id === item.id && orderItem.Sku === item.Sku
    );
    if (existingItem && existingItem.qty > 1) {
      existingItem.qty--;
      saveOrderItemsToLocalStorage(); // Save after decrementing
    } else if (existingItem && existingItem.qty === 1) {
      deleteOrderItem(existingItem);
    }
  }

  // Delete a specific order item from the list
  function deleteOrderItem(item) {
    const index = state.orderItems.findIndex(orderItem =>
      orderItem.id === item.id && orderItem.Sku === item.Sku
    );
    if (index !== -1) {
      state.orderItems.splice(index, 1);
      saveOrderItemsToLocalStorage(); // Save after deleting
    }
  }

  // Update the discount percentage for a specific order item
  function updateDiscountPercentage(item, discountPercentage) {
    const existingItem = state.orderItems.find(orderItem =>
      orderItem.id === item.id && orderItem.Sku === item.Sku
    );
    if (existingItem) {
      existingItem.discountPercentage = discountPercentage;
      existingItem.Price = (existingItem.OriginalPrice * (1 - discountPercentage / 100)).toFixed(2);
    }
  }

  // Reset the discount percentage for a specific order item
  function resetDiscount(item) {
    const existingItem = state.orderItems.find(orderItem =>
      orderItem.id === item.id && orderItem.Sku === item.Sku
    );
    if (existingItem) {
      existingItem.discountPercentage = 0; // Reset discount to 0
      existingItem.Price = existingItem.OriginalPrice; // Restore original price
    }
  }

  // Get the total discount percentage of all items
  const getTotalDiscountPercentage = computed(() => {
    if (state.orderItems.length === 0) return 0;
    return state.orderItems.reduce((totalDiscount, item) => {
      return totalDiscount + parseFloat(item.discountPercentage || 0);
    }, 0) / state.orderItems.length;
  });

  // Get all order items
  const getOrderItems = computed(() => state.orderItems);

  // Get the total price of the order
  const getOrderTotal = computed(() => {
    return state.orderItems.reduce((total, item) => {
      return total + (item.Price * item.qty);
    }, 0);
  });

  // Get the total GST amount
  const getGstAmount = computed(() => {
    return getOrderTotal.value * (state.gst / 100);
  });

  // Get the total PST amount
  const getPstAmount = computed(() => {
    return getOrderTotal.value * (state.pst / 100);
  });

  function applyOverallDiscount(discountPercentage) {
    state.overallDiscount = discountPercentage;
    state.orderItems.forEach(item => {
      item.discountPercentage = discountPercentage; // Set the discountPercentage for the item
      item.Price = (item.OriginalPrice * (1 - discountPercentage / 100)).toFixed(2); // Recalculate the price
    });
  }

  onMounted(() => {
    loadOrderItemsFromLocalStorage();
  });

  const draftOrders = ref([]); // Store the fetched draft orders reactively
  //
  function saveOrderAsDraft() {
    const draft = { ...state.orderItems, timestamp: Date.now() };
    draftOrders.value.push(draft); // Update the reactive draftOrders array

    // Save the updated draft orders to localStorage for persistence
    localStorage.setItem('draftOrders', JSON.stringify(draftOrders.value));

    // Clear the current active order
    state.orderItems = [];
  }

  // Fetch the draft orders from localStorage and update the reactive array
  function fetchDraftOrders() {
    const savedDrafts = JSON.parse(localStorage.getItem('draftOrders')) || [];
    draftOrders.value = savedDrafts; // Update the reactive draftOrders array
    return draftOrders.value;
  }
  
  function loadDraftOrder(draftOrder) {
    state.orderItems = draftOrder; // Load the draft order as active
  }

  const showDraftList = ref(false); // Toggle state

  // Toggle the draft list visibility
  function toggleDraftList() {
    showDraftList.value = !showDraftList.value;
    console.log('order notification toggeled');
  }
  
  return {
    state,
    addOrderItem,
    incrementOrderItem,
    decrementOrderItem,
    deleteOrderItem,
    updateDiscountPercentage,
    resetDiscount, 
    getTotalDiscountPercentage,
    getOrderItems,
    getOrderTotal,
    getGstAmount,
    getPstAmount,
    selectedSalesPerson,
    setSelectedSalesPerson,
    applySalesPersonToAllItems,
    applyOverallDiscount,
    saveOrderAsDraft,
    fetchDraftOrders,
    loadDraftOrder,
    showDraftList,
    toggleDraftList,
    draftOrders,
  };
});
