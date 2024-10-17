import { ref, reactive, computed, onMounted, watch } from 'vue';
import { defineStore } from 'pinia';
import { useToast } from 'vue-toastification';

const toast = useToast();

export const useOrderStore = defineStore('orders', () => {

  const selectedSalesPerson = ref(null);
  const applySelectedSalesPersonForAll = ref(false);

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
        gstRate: state.taxes.find(tax => tax.type === 'GST').rate,  // Link GST from state.taxes
        pstRate: state.taxes.find(tax => tax.type === 'PST').rate   // Link PST from state.taxes
      };      

      // Apply the overall discount to newly added items
    if (state.overallDiscount > 0) {
      newItem.Price = Number(
        (newItem.OriginalPrice * (1 - state.overallDiscount / 100)).toFixed(2)
      );
    } else {
      newItem.Price = Number(newItem.OriginalPrice);
    }

    // Automatically assign the salesperson to the new item
    if (applySelectedSalesPersonForAll.value && selectedSalesPerson.value) {
      newItem.SalesPersonId = selectedSalesPerson.value;
    }

      state.orderItems.unshift(newItem);
    }
    calculateTaxes();
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
      state.orderItems.splice(index, 1); // Remove the item
      calculateTaxes(); // Recalculate taxes
      saveOrderItemsToLocalStorage(); // Persist order items in localStorage
    }
  
    // If all items are deleted, reset the overall discount but keep other state information intact
    if (state.orderItems.length === 0) {
      state.overallDiscount = 0;
      // Optionally, you can reset other parts of the order as needed
      state.customer = { id: '', name: '', phone: '', email: '', note: '' };
      state.payments = [];
      state.comments = [];
      state.total = 0;
    }
  }
  

  // Apply the selected salesperson to only the selected items in the order
  function setSelectedSalesPerson(salesPersonId, item) {
    const orderItem = state.orderItems.find(orderItem => orderItem.Sku === item.Sku);
  
    if (orderItem) {
      orderItem.SalesPersonId = salesPersonId; 
    } else {
      console.error('Order item not found for the provided Sku.');
    }
    saveOrderItemsToLocalStorage(); 
  }
  

  // Apply the selected salesperson to all items in the order
  function applySalesPersonToAllItems(salesPersonId) {
    state.orderItems.forEach(item => {
      item.SalesPersonId = salesPersonId;
    });
    applySelectedSalesPersonForAll.value = true;
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
    let gstTotal = 0;
    let pstTotal = 0;
  
    // Calculate taxes for each item in the order
    state.orderItems.forEach(item => {
      const price = Number(item.Price) || 0;
      const itemGst = (price * item.gstRate) / 100; 
      const itemPst = (price * item.pstRate) / 100; 
  
      gstTotal += itemGst * item.Qty;
      pstTotal += itemPst * item.Qty;
    });
  
    // Update the tax amounts in the global state
    const gstTax = state.taxes.find(tax => tax.type === 'GST');
    const pstTax = state.taxes.find(tax => tax.type === 'PST');
    
    gstTax.amount = gstTotal.toFixed(2);
    pstTax.amount = pstTotal.toFixed(2);
  
    saveOrderItemsToLocalStorage();  
  }
  

  function updateItemTaxRate(item, taxType, newRate) {
    if (taxType === 'GST') {
      item.gstRate = newRate;
    } else if (taxType === 'PST') {
      item.pstRate = newRate;
    }
    calculateTaxes(); // Recalculate taxes after updating
    saveOrderItemsToLocalStorage(); // Save the updated order items
  }
  

  // Function to update GST rate and recalculate taxes
  function updateGstRate(rate) {
    const gstTax = state.taxes.find(tax => tax.type === 'GST');
    if (gstTax) {
      gstTax.rate = Number(rate); 
      calculateTaxes();
    }
  }

  // hnadle update PST rate and recalculate taxes
  function updatePstRate(rate) {
    const pstTax = state.taxes.find(tax => tax.type === 'PST');
    if (pstTax) {
      pstTax.rate = Number(rate);  
      calculateTaxes(); 
    }
  }

  const getItemTaxAmounts = (item) => {
    const gstAmount = (item.Price * (item.gstRate / 100)).toFixed(2);
    const pstAmount = (item.Price * (item.pstRate / 100)).toFixed(2);
    return { gstAmount, pstAmount };
  };

  function resetTaxRate(item, taxType) {
    const defaultTax = state.taxes.find(tax => tax.type === taxType);
    
    if (defaultTax) {
      if (taxType === 'GST') {
        item.gstRate = defaultTax.rate;  // Reset GST rate to default
      } else if (taxType === 'PST') {
        item.pstRate = defaultTax.rate;  // Reset PST rate to default
      }
    }
    saveOrderItemsToLocalStorage();  // Save the updated order items
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

  function addToApprovalList({ ManagerId, ManagerApprovalId, ItemId, isOverallDiscount }) {
    // Create an approval object with the required fields
    const approval = {
      ManagerId: ManagerId,  
      ManagerApprovalId: ManagerApprovalId, 
      ItemId: ItemId || null, 
      isOverallDiscount: isOverallDiscount || false, 
      id: '' 
    };
  
    // Add the new approval entry to the state.approvalList
    state.approvalList.push(approval);
  
    // Optionally, persist the updated approvalList to local storage
    saveOrderItemsToLocalStorage();
  
    // Notify that approval has been added (optional, for debugging)
    console.log('Approval added:', approval);
  }

  // Save orderItems to localStorage
  function saveOrderItemsToLocalStorage() {
    localStorage.setItem('newOrder', JSON.stringify(state));
  }

  function submitCommentToStore(commentText, managerUser, item) {
    const isCommentProvided = commentText.trim() !== ''; 
    const existingCommentIndex = state.comments.findIndex(comment => comment.item.sku === item.Sku);
  
    // Create the comment object regardless of whether the text is provided or not
    const newComment = {
      item: {
        name: item?.ItemName ?? 'Unknown Item',
        price: item?.Price ?? 0,
        imageUrl: item?.ItemImage ?? '',
        sku: item?.Sku ?? 'Unknown SKU',
        discount: item.Discount,  
      },
      text: commentText.trim(),
      userId: managerUser,
      timestamp: new Date().toISOString()
    };
  
    // Update or add the new comment in the state.comments array
    if (existingCommentIndex > -1) {
      state.comments[existingCommentIndex] = newComment;
    } else {
      state.comments.push(newComment);
    }

    // Apply the discount only if a valid comment is provided
    if (isCommentProvided) {
      const discountValue = item.Discount || 0;
      updateDiscountPercentage(item, discountValue);
      addToApprovalList({
        ManagerId: managerUser,
        ItemId: item?.ItemId, 
        ManagerApprovalId: '',
        isOverallDiscount: state.overallDiscount
      })

    } else {
      resetDiscount(item);
    }
    
    saveOrderItemsToLocalStorage();
    window.dispatchEvent(new Event('comment-saved'));
  }
  

// Iso date format   
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit', 
      month: 'short', 
      year: 'numeric'
    }).replace(/ /g, '-');
  };
  
  const draftOrders = ref([]); 

// Save the current state as a draft
function saveOrderAsDraft() {
  if (state.orderItems.length === 0) {
    console.log('No active order items to save as draft');
    toast.error('Cannot save an empty order as draft!');
    return; 
  }

  // Create a new draft object from the current state
  const draft = {
    orderItems: [...state.orderItems], 
    overallDiscount: state.overallDiscount, 
    customer: { ...state.customer }, 
    comments: [...state.comments],
    payments: [...state.payments],
    taxes: [...state.taxes],
    total: state.total,
    timestamp: Date.now(), 
  };

  // Add the new draft to the draftOrders array
  draftOrders.value.push(draft);

  // Save the updated draft orders to localStorage
  localStorage.setItem('draftOrders', JSON.stringify(draftOrders.value));

  // Clear the current state (active order)
  state.orderItems = []; 
  state.overallDiscount = 0;
  state.customer = { id: '', name: '', phone: '', email: '', note: '' };
  state.comments = [];
  state.payments = [];
  state.total = 0;
  state.taxes = [
    { type: 'GST', rate: 5, amount: 0 },
    { type: 'PST', rate: 7, amount: 0 }
  ];

  // Remove the active order from localStorage
  localStorage.removeItem('newOrder');
  toast.success('Order saved as draft!');
}

// Fetch the draft orders from localStorage and update the reactive array
function fetchDraftOrders() {
  const savedDrafts = JSON.parse(localStorage.getItem('draftOrders')) || [];
  draftOrders.value = savedDrafts;
  // console.log('Fetched drafts:', draftOrders.value);
  return draftOrders.value;
}

// Load a draft order back into newOrder
function loadDraftOrder(draftIndex) {
  const selectedDraft = draftOrders.value[draftIndex];

  if (selectedDraft) {
    // Merge order items
    selectedDraft.orderItems.forEach(draftItem => {
      const existingItem = state.orderItems.find(item => item.ItemId === draftItem.ItemId);

      if (existingItem) {
        existingItem.Qty += draftItem.Qty;
      } else {
        state.orderItems.push({ ...draftItem });
      }
    });

    state.comments.push(...selectedDraft.comments);
    state.payments.push(...selectedDraft.payments);
    state.taxes = [...selectedDraft.taxes];

    // Handle overall discount - you can modify this logic if necessary
    state.overallDiscount = Math.max(state.overallDiscount, selectedDraft.overallDiscount);

    // Load the selected customer if none is currently selected
    if (!state.customer.id) {
      state.customer = { ...selectedDraft.customer };
    } else {
      // Optionally: Log or notify that the current customer is being retained
      console.log('Active customer retained:', state.customer);
      toast.info('Current customer retained in the order.');
    }

    // Recalculate the total after merging the draft order
    state.total = state.orderItems.reduce((total, item) => total + (item.Price * item.Qty), 0);
    
    saveOrderItemsToLocalStorage();

    draftOrders.value.splice(draftIndex, 1);

    localStorage.setItem('draftOrders', JSON.stringify(draftOrders.value));

    toast.success('Draft order merged into the current order successfully!');
  } else {
    toast.error('Failed to load the selected draft order.');
  }
}




// Remove a draft order
function removeDraftOrder(draftIndex) {
  if (draftIndex >= 0 && draftIndex < draftOrders.value.length) {
    draftOrders.value.splice(draftIndex, 1);
    // Update localStorage with the modified draftOrders array
    localStorage.setItem('draftOrders', JSON.stringify(draftOrders.value));
    toast.success('Draft order removed successfully!');
  } else {
    toast.error('Invalid draft order index.');
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
    getTotalGstAmount,
    getTotalPstAmount,
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
    loadOrderItemsFromLocalStorage,
    removeDraftOrder,
    // recalculateTotal,
    updateOriginalPrice,
    updateGstRate,
    updatePstRate,
    updateOrderTotal,
    saveOrderItemsToLocalStorage,
    formatDate,
    updateItemTaxRate,
    getItemTaxAmounts,
    resetTaxRate,
  };
});


