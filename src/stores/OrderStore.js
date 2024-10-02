import { ref, reactive, computed, onMounted } from 'vue';
import { defineStore } from 'pinia';
import { useToast } from 'vue-toastification';

const toast = useToast();

export const useOrderStore = defineStore('orders', () => {
  const state = reactive({
    orderItems: [], 
    approvalList: [], 
    overallDiscount: ref(0), 
    customer: reactive({
      id: '', 
      name: '',
      phone: '', 
      email: '',
      note: ''
    }),
    comments: [], 
    payments: [],
    total: ref(0), 
    taxes: [],
  });

  // Add or increment an order item
  function addOrderItem(item) {
    const existingItem = state.orderItems.find(orderItem =>
      orderItem.ItemId === item.BarCode
    );
  
    if (existingItem) {
      existingItem.Qty++;
    } else {
      const newItem = {
        ItemId: item.BarCode,
        ItemName: item.Name,
        ItemImage: item.ImageUrl,
        Qty: 1,
        MaxQty: item.MaxQty,
        Discount: item.Discount || 0, 
        TaxesWaived: false, 
        OriginalPrice: item.Price, 
        SalesPersonId: selectedSalesPerson.value
      };
  
      // Apply the overall discount to newly added items
      if (state.overallDiscount > 0) {
        newItem.Price = (newItem.OriginalPrice * (1 - state.overallDiscount / 100)).toFixed(2);
      }
  
      state.orderItems.push(newItem);
    }
    saveOrderItemsToLocalStorage();
  }

  // Increment quantity of a specific order item
  function incrementOrderItem(item) {
    const existingItem = state.orderItems.find(orderItem =>
      orderItem.ItemId === item.ItemId
    );
    if (existingItem) {
      existingItem.Qty++;
      saveOrderItemsToLocalStorage(); 
    }
  }

  // Decrement quantity of a specific order item or delete if Qty is 1
  function decrementOrderItem(item) {
    const existingItem = state.orderItems.find(orderItem =>
      orderItem.ItemId === item.ItemId
    );
    if (existingItem && existingItem.Qty > 1) {
      existingItem.Qty--;
      saveOrderItemsToLocalStorage(); 
    } else if (existingItem && existingItem.Qty === 1) {
      deleteOrderItem(existingItem);
    }
  }

  // Delete a specific order item
  function deleteOrderItem(item) {
    const index = state.orderItems.findIndex(orderItem =>
      orderItem.ItemId === item.ItemId
    );
    if (index !== -1) {
      state.orderItems.splice(index, 1);
      saveOrderItemsToLocalStorage(); 
    }
    if(state.orderItems.length === 0) {
      state.overallDiscount = 0;
      localStorage.setItem('overallDiscount', 0);
    }
  }


  const selectedSalesPerson = ref(null);

  function setSelectedSalesPerson(salesPersonId) {
    selectedSalesPerson.value = salesPersonId;
  }

  // Apply the selected salesperson to all items in the order
  function applySalesPersonToAllItems(salesPersonId) {
    state.orderItems.forEach(item => {
      item.SalesPersonId = salesPersonId;
    });
  }

  // Save orderItems to localStorage
  function saveOrderItemsToLocalStorage() {
    localStorage.setItem('newOrder', JSON.stringify(state));
  }

  // Load orderItems from localStorage
  function loadOrderItemsFromLocalStorage() {
    const savedItems = JSON.parse(localStorage.getItem('newOrder'));
    
    state.orderItems = Array.isArray(savedItems) ? savedItems : [];
    
    // Reapply the discount to each item
    state.orderItems.forEach(item => {
      if (item.Discount && item.OriginalPrice) {
        item.Price = (item.OriginalPrice * (1 - item.Discount / 100)).toFixed(2);
      }
    });

    if (savedDiscount) {
      state.overallDiscount = parseFloat(savedDiscount);
      // Apply the overall discount to all items
      state.orderItems.forEach(item => {
        if (state.overallDiscount > 0) {
          item.Price = (item.OriginalPrice * (1 - state.overallDiscount / 100)).toFixed(2);
        }
      });
    }
  }

  
  

  // Update the discount for a specific order item and recalculate the price
function updateDiscountPercentage(item, discount) {
  const existingItem = state.orderItems.find(orderItem =>
    orderItem.ItemId === item.ItemId
  );
  if (existingItem) {
    existingItem.Discount = discount;
    // Calculate price based on discount and original price
    existingItem.Price = (existingItem.OriginalPrice * (1 - discount / 100)).toFixed(2);

    saveOrderItemsToLocalStorage();
  }
}

// Update the original price of the item and recalculate the discount
function updateOriginalPrice(item, originalPrice) {
  const existingItem = state.orderItems.find(orderItem =>
    orderItem.ItemId === item.ItemId
  );
  if (existingItem) {
    existingItem.OriginalPrice = originalPrice;
    // Recalculate discount based on original price
    existingItem.Discount = ((1 - existingItem.Price / originalPrice) * 100).toFixed(2);
    
    saveOrderItemsToLocalStorage();
  }
}


  // Reset the discount for a specific order item
  function resetDiscount(item) {
    const existingItem = state.orderItems.find(orderItem =>
      orderItem.ItemId === item.ItemId
    );
    if (existingItem) {
      existingItem.Discount = 0; 
      existingItem.Price = existingItem.OriginalPrice; 
      saveOrderItemsToLocalStorage();
    }
  }

  // Calculate the total discount percentage of all items
  const getTotalDiscountPercentage = computed(() => {
    if (state.orderItems.length === 0) return 0;
    return state.orderItems.reduce((totalDiscount, item) => 
      totalDiscount + parseFloat(item.Discount || 0), 0) / state.orderItems.length;
  });

  // Get all order items
  const getOrderItems = computed(() => state);

  // Get the total price of the order
  const getOrderTotal = computed(() => {
    return Array.isArray(state.orderItems)
      ? state.orderItems.reduce((total, item) => 
          total + (parseFloat(item.Price) * item.Qty), 0)
      : 0;
  });

  // Get the total GST amount
  const getGstAmount = computed(() => {
    return getOrderTotal.value * (state.gst / 100);
  });

  // Get the total PST amount
  const getPstAmount = computed(() => {
    return getOrderTotal.value * (state.pst / 100);
  });

  // Apply the overall discount to each item
  function applyOverallDiscount(overallDiscountPercentage) {
    state.overallDiscount = overallDiscountPercentage;

    state.orderItems.forEach(item => {
      const originalPrice = item.OriginalPrice || item.Price;
      item.Price = (originalPrice * (1 - overallDiscountPercentage / 100)).toFixed(2);
    });

    localStorage.setItem('overallDiscount', overallDiscountPercentage.toString());
    saveOrderItemsToLocalStorage();
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
    // saveOrderAsDraft,
    // // fetchDraftOrders,
    // loadDraftOrder,
    // showDraftList,
    // toggleDraftList,
    // draftOrders,
    // submitCommentToStore,
    // loadOrderItemsFromLocalStorage,
    // recalculateTotal,
    // updateOriginalPrice,
  };
});


