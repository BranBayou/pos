import { ref, reactive, computed, onMounted } from 'vue';
import { defineStore } from 'pinia';
import { useToast } from 'vue-toastification';

const toast = useToast();

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

  // Apply the selected salesperson to all items in the order
  function applySalesPersonToAllItems(salesPerson) {
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
    const savedDiscount = localStorage.getItem('overallDiscount'); // Load the overall discount
  
    state.orderItems = Array.isArray(savedItems) ? savedItems : []; // Fallback to an empty array
    
    if (savedDiscount) {
      state.overallDiscount = parseFloat(savedDiscount);
      
      // Reapply the overall discount to each item
      state.orderItems.forEach(item => {
        item.Price = (item.OriginalPrice * (1 - state.overallDiscount / 100)).toFixed(2);
      });
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
        discountPercentage: item.discountPercentage || 0, 
        OriginalPrice: item.Price, 
        salesPerson: selectedSalesPerson.value 
      };
  
      // Apply the overall discount to the newly added item if it exists
      if (state.overallDiscount && state.overallDiscount > 0) {
        newItem.Price = (newItem.OriginalPrice * (1 - state.overallDiscount / 100)).toFixed(2);
      }
  
      state.orderItems.push(newItem);
    }
    saveOrderItemsToLocalStorage();
  }

  // Increment quantity of a specific order item
  function incrementOrderItem(item) {
    const existingItem = state.orderItems.find(orderItem =>
      orderItem.id === item.id && orderItem.Sku === item.Sku
    );
    if (existingItem && existingItem.qty < existingItem.MaxQty) {
      existingItem.qty++;
      saveOrderItemsToLocalStorage(); 
    }
  }

  // Decrement quantity of a specific order item or delete it if quantity is 1
  function decrementOrderItem(item) {
    const existingItem = state.orderItems.find(orderItem =>
      orderItem.id === item.id && orderItem.Sku === item.Sku
    );
    if (existingItem && existingItem.qty > 1) {
      existingItem.qty--;
      saveOrderItemsToLocalStorage(); 
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
      saveOrderItemsToLocalStorage(); 
    }
  }

  // Update the discount percentage for a specific order item
  function updateDiscountPercentage(item, discountPercentage) {
    const existingItem = state.orderItems.find(orderItem => orderItem.id === item.id && orderItem.Sku === item.Sku);
    if (existingItem) {
      existingItem.discountPercentage = discountPercentage;
      existingItem.Price = (existingItem.OriginalPrice * (1 - discountPercentage / 100)).toFixed(2);

      saveOrderItemsToLocalStorage();
    }
  }
  
  

  // Reset the discount percentage for a specific order item
  function resetDiscount(item) {
    const existingItem = state.orderItems.find(orderItem =>
      orderItem.id === item.id && orderItem.Sku === item.Sku
    );
    if (existingItem) {
      existingItem.discountPercentage = 0; 
      existingItem.Price = existingItem.OriginalPrice; 
      saveOrderItemsToLocalStorage();
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
    return Array.isArray(state.orderItems)
      ? state.orderItems.reduce((total, item) => {
          return total + (parseFloat(item.Price) * item.qty);
        }, 0)
      : 0; // Fallback to 0 if orderItems is not an array
  });
  

  // Get the total GST amount
  const getGstAmount = computed(() => {
    return getOrderTotal.value * (state.gst / 100);
  });

  // Get the total PST amount
  const getPstAmount = computed(() => {
    return getOrderTotal.value * (state.pst / 100);
  });

  // Apply the overall discount to each item in the order
  function applyOverallDiscount(overallDiscountPercentage) {
    state.overallDiscount = overallDiscountPercentage;

    state.orderItems.forEach(item => {
      const originalPrice = item.OriginalPrice || item.Price; 
      item.Price = (originalPrice * (1 - overallDiscountPercentage / 100)).toFixed(2);
    });

    localStorage.setItem('overallDiscount', overallDiscountPercentage.toString());
    saveOrderItemsToLocalStorage();
  }

// Calculate the total price before applying the overall discount
const getOrderTotalBeforeDiscount = computed(() => {
  return state.orderItems.reduce((total, item) => {
    return total + parseFloat(item.Price) * item.qty;
  }, 0);
});

// // Apply the overall discount to the total price
// const getOrderTotal = computed(() => {
//   const totalBeforeDiscount = getOrderTotalBeforeDiscount.value;
//   const discountAmount = totalBeforeDiscount * (state.overallDiscount / 100);
//   return totalBeforeDiscount - discountAmount;
// });

// Apply the overall discount and save it to local storage
function applyOverallDiscount(overallDiscountPercentage) {
  state.overallDiscount = overallDiscountPercentage;
  localStorage.setItem('overallDiscount', overallDiscountPercentage.toString());
}

// Load the order items and overall discount from localStorage on mounted
onMounted(() => {
  const savedItems = JSON.parse(localStorage.getItem('orderItems'));
  state.orderItems = Array.isArray(savedItems) ? savedItems : [];

  const savedOverallDiscount = localStorage.getItem('overallDiscount');
  if (savedOverallDiscount !== null) {
    state.overallDiscount = parseFloat(savedOverallDiscount);
    applyOverallDiscount(state.overallDiscount);
  }
});


  const draftOrders = ref([]); 
  //
  function saveOrderAsDraft() {
    if (state.orderItems.length === 0) {
      console.log('No active order items to save as draft');
      toast.error('Cannot save an empty order as draft!');
      return; 
    }
    // Clone the current orderItems to draft
    const draft = {
      orderItems: [...state.orderItems], 
      overallDiscount: state.overallDiscount, 
      timestamp: Date.now(), 
    };
    
    draftOrders.value.push(draft); 
    
    // Save the updated draft orders to localStorage
    localStorage.setItem('draftOrders', JSON.stringify(draftOrders.value));
    
    // Clear the current active orderItems and remove from localStorage
    state.orderItems = []; 
    state.overallDiscount = 0;
    localStorage.setItem('overallDiscount', 0);
    localStorage.removeItem('orderItems'); 
    toast.success('Order saved as draft!');
  }

  // Fetch the draft orders from localStorage and update the reactive array
  function fetchDraftOrders() {
    const savedDrafts = JSON.parse(localStorage.getItem('draftOrders')) || [];
    draftOrders.value = savedDrafts; 
    console.log('draft=', draftOrders.value)
    return draftOrders.value;
  }
  
  function loadDraftOrder(draftOrder) {
    // Merge the draft items into the current active orderItems
    draftOrder.orderItems.forEach(draftItem => {
      const existingItem = state.orderItems.find(
        orderItem => orderItem.id === draftItem.id && orderItem.Sku === draftItem.Sku
      );
  
      if (existingItem) {
        existingItem.qty += draftItem.qty;
      } else {
        state.orderItems.push({ ...draftItem });
      }
    });
  
    // Restore the overall discount from the draft and reapply it
    if (draftOrder.overallDiscount) {
      state.overallDiscount = draftOrder.overallDiscount;
      applyOverallDiscount(state.overallDiscount); 
    }
  
    // Remove the loaded draft from draftOrders
    const draftIndex = draftOrders.value.findIndex(draft => draft.timestamp === draftOrder.timestamp);
    if (draftIndex !== -1) {
      draftOrders.value.splice(draftIndex, 1); // Removed the extra 's' here
    }
  
    // Update localStorage: save the updated active order and draft orders
    saveOrderItemsToLocalStorage(); 
    localStorage.setItem('draftOrders', JSON.stringify(draftOrders.value)); 
}

  
  
  
  function submitCommentToStore(item, commentText, discountPercentage, managerUser) {
    const isCommentProvided = commentText.trim() !== '';
    
    const commentData = {
      item: {
        name: item?.Name ?? 'Unknown Item',
        price: item?.Price ?? 0,  // This reflects the item price at the time of comment
        imageUrl: item?.ImageUrl ?? '',
        sku: item?.Sku ?? 'Unknown SKU',
        discountPercentage: discountPercentage,
      },
      comment: commentText,
      timestamp: new Date().toISOString(),
      manager: managerUser,
    };
  
    // Save the comment to localStorage
    const existingComments = JSON.parse(localStorage.getItem('comments')) || [];
    existingComments.push(commentData);
    localStorage.setItem('comments', JSON.stringify(existingComments));
  
    // Update the actual order item in the store
    if (isCommentProvided) {
      updateDiscountPercentage(item, discountPercentage)
    } else {
      resetDiscount(item);  // Reset discount if no comment is provided
    }
  }

  const showDraftList = ref(false); 

  // Toggle the draft list visibility
  function toggleDraftList() {
    showDraftList.value = !showDraftList.value;
    console.log('order notification toggeled');
  }

  onMounted(() => {
    loadOrderItemsFromLocalStorage();
  });
  
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
    submitCommentToStore,
    getOrderTotalBeforeDiscount,
    loadOrderItemsFromLocalStorage,
  };
});
