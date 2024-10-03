import { ref, reactive, computed, onMounted, watch } from 'vue';
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
    taxes: reactive([
      { type: 'GST', rate: 5, amount: 0 },  
      { type: 'PST', rate: 7, amount: 0 }   
    ]),
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
        Sku: item.Sku,
        ItemName: item.Name,
        ItemImage: item.ImageUrl,
        Qty: 1,
        MaxQty: item.MaxQty,
        Discount: item.Discount || 0,
        TaxesWaived: false,
        OriginalPrice: item.Price,
        Price: null,
        SalesPersonId: selectedSalesPerson.value?.SalesPersonId || null,
      };
  
      // Apply the overall discount to newly added items
    if (state.overallDiscount > 0) {
      newItem.Price = Number(
        (newItem.OriginalPrice * (1 - state.overallDiscount / 100)).toFixed(2)
      );
    } else {
      newItem.Price = Number(newItem.OriginalPrice);
    }
  
      state.orderItems.push(newItem);
    }
    calculateTaxes(); // Recalculate taxes after adding an item
    saveOrderItemsToLocalStorage();
  }
  

  // Increment quantity of a specific order item
  function incrementOrderItem(item) {
    const existingItem = state.orderItems.find(orderItem =>
      orderItem.ItemId === item.ItemId
    );
    if (existingItem) {
      existingItem.Qty++;
      if(existingItem.Qty > existingItem.MaxQty) {
        existingItem.Qty = existingItem.MaxQty;
      }
      saveOrderItemsToLocalStorage(); 
      calculateTaxes(); 
    }
  }

  // Decrement quantity of a specific order item or delete if Qty is 1
  function decrementOrderItem(item) {
    const existingItem = state.orderItems.find(orderItem =>
      orderItem.ItemId === item.ItemId
    );
    if (existingItem && existingItem.Qty > 1) {
      existingItem.Qty--;
      calculateTaxes(); 
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
      calculateTaxes(); 
      saveOrderItemsToLocalStorage(); 
    }
    if(state.orderItems.length === 0) {
      state.overallDiscount = 0;
      localStorage.setItem('overallDiscount', 0);
    }
  }

  const selectedSalesPerson = ref(null);

  function setSelectedSalesPerson(salesPersonId) {
    state.orderItems.forEach(item => {
      item.SalesPersonId = salesPersonId; 
    });
    saveOrderItemsToLocalStorage(); 
  }
  

  // Apply the selected salesperson to all items in the order
  function applySalesPersonToAllItems(salesPersonId) {
    state.orderItems.forEach(item => {
      item.SalesPersonId = salesPersonId;
    });
    saveOrderItemsToLocalStorage();
  }
   
  // Load the entire state from localStorage
  function loadOrderItemsFromLocalStorage() {
    const savedState = JSON.parse(localStorage.getItem('newOrder'));
  
    if (savedState) {
      Object.assign(state, savedState);
  
      // Ensure that taxes array is present and has the correct structure
      if (!state.taxes || !Array.isArray(state.taxes)) {
        state.taxes = [
          { type: 'GST', rate: 5, amount: 0 },
          { type: 'PST', rate: 7, amount: 0 }
        ];
      }
  
      state.orderItems.forEach(item => {
        if (item.Discount && item.OriginalPrice) {
          item.Price = (item.OriginalPrice * (1 - item.Discount / 100)).toFixed(2);
        }
      });
  
      if (state.overallDiscount > 0) {
        state.orderItems.forEach(item => {
          item.Price = (item.OriginalPrice * (1 - state.overallDiscount / 100)).toFixed(2);
        });
      }
  
      calculateTaxes(); // Recalculate taxes after loading items
    } else {
      state.orderItems = [];
      state.overallDiscount = 0;
      state.customer = {
        id: '',
        name: '',
        phone: '',
        email: '',
        note: ''
      };
      state.comments = [];
      state.payments = [];
      state.taxes = [
        { type: 'GST', rate: 5, amount: 0 },
        { type: 'PST', rate: 7, amount: 0 }
      ];
      state.total = 0;
    }
  }
  
  // Function to recalculate taxes based on the current rates
  function calculateTaxes() {
    // Get current tax objects
    let gstTax = state.taxes.find(tax => tax.type === 'GST');
    let pstTax = state.taxes.find(tax => tax.type === 'PST');

    // Reset the tax amounts before recalculating
    let gstTotal = 0;
    let pstTotal = 0;

    // Calculate taxes for each item in the order
    state.orderItems.forEach(item => {
      const price = Number(item.Price) || 0;
      const itemGst = (price * gstTax.rate) / 100; 
      const itemPst = (price * pstTax.rate) / 100; 

      gstTotal += itemGst * item.Qty;
      pstTotal += itemPst * item.Qty;
    });

    // Update the tax amounts in the state
    gstTax.amount = gstTotal.toFixed(2);
    pstTax.amount = pstTotal.toFixed(2);

    saveOrderItemsToLocalStorage();  // Save the updated state to localStorage
  }

  // Function to update GST rate and recalculate taxes
  function updateGstRate(rate) {
    const gstTax = state.taxes.find(tax => tax.type === 'GST');
    if (gstTax) {
      gstTax.rate = Number(rate);  // Update the rate
      calculateTaxes();  // Recalculate taxes based on new rate
    }
  }

  // hnadle update PST rate and recalculate taxes
  function updatePstRate(rate) {
    const pstTax = state.taxes.find(tax => tax.type === 'PST');
    if (pstTax) {
      pstTax.rate = Number(rate);  // Update the rate
      calculateTaxes();  // Recalculate taxes based on new rate
    }
  }

  // handle update state total
  function updateOrderTotal(newTotal) {
    const roundedTotal = parseFloat(newTotal.toFixed(2));
    state.total = roundedTotal;
    saveOrderItemsToLocalStorage();
  }


const getTotalGstAmount = computed(() => {
  return state.taxes.find(tax => tax.type === 'GST').amount;
});

const getTotalPstAmount = computed(() => {
  return state.taxes.find(tax => tax.type === 'PST').amount;
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

  // Apply the overall discount to each item
  function applyOverallDiscount(overallDiscountPercentage) {
    state.overallDiscount = overallDiscountPercentage;

    state.orderItems.forEach(item => {
      const originalPrice = item.OriginalPrice;
      item.Price = (originalPrice * (1 - overallDiscountPercentage / 100)).toFixed(2);
    });
    saveOrderItemsToLocalStorage();
  }

  // Save orderItems to localStorage
  function saveOrderItemsToLocalStorage() {
    localStorage.setItem('newOrder', JSON.stringify(state));
  }

  function submitCommentToStore(item, commentText, Discount, managerUser) {
    const isCommentProvided = commentText.trim() !== '';
  
    const commentData = {
      item: {
        name: item?.Name ?? 'Unknown Item',  // Ensure 'item' is used correctly
        price: item?.Price ?? 0,  // This reflects the item price at the time of comment
        imageUrl: item?.ImageUrl ?? '',
        sku: item?.Sku ?? 'Unknown SKU',
        Discount: Discount,
      },
      comment: commentText,
      timestamp: new Date().toISOString(),
      manager: managerUser,
    };
  
    // Check if the state already contains the comment and update the array
    state.comments.push(commentData);  // Assuming state.comments is reactive and exists
  
    // Save the entire state to localStorage (this will include comments, order items, etc.)
    saveOrderItemsToLocalStorage();  // Assuming saveOrderItemsToLocalStorage handles saving the full state
  
    // Update the actual order item in the store
    if (isCommentProvided) {
      updateDiscountPercentage(item, Discount);  // Assuming 'Discount' is passed in and handled elsewhere
    } else {
      resetDiscount(item);  // Reset discount if no comment is provided
    }
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
    getTotalGstAmount,
    getTotalPstAmount,
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
    submitCommentToStore,
    loadOrderItemsFromLocalStorage,
    // recalculateTotal,
    updateOriginalPrice,
    updateGstRate,
    updatePstRate,
    updateOrderTotal,
    saveOrderItemsToLocalStorage,
  };
});


