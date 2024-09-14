import { ref, reactive, computed } from 'vue';
import { defineStore } from 'pinia';

export const useOrderStore = defineStore('orders', () => {
  const state = reactive({
    orderItems: [],
    gst: 0.5, // GST default value
    pst: 0.7  // PST default value
  });

  const selectedSalesPerson = ref(null);

  function setSelectedSalesPerson(salesPerson) {
    selectedSalesPerson.value = salesPerson; // Set the salesperson for individual items or globally
  }

  function applySalesPersonToAllItems(salesPerson) {
    // Apply the selected salesperson to all items in the order
    state.orderItems.forEach((item) => {
      item.salesPerson = salesPerson;
    });
  }


  // Add an order item to the list or increment the quantity if it exists
  function addOrderItem(item) {
    const existingItem = state.orderItems.find(orderItem =>
      orderItem.id === item.id && orderItem.Sku === item.Sku && orderItem.Price === item.Price
    );

    if (existingItem) {
      existingItem.qty++; // Increment quantity if the item already exists
    } else {
      state.orderItems.push({
        ...item,
        qty: 1,
        discountPercentage: item.discountPercentage || 0, // Ensure discount is tracked
        OriginalPrice: item.Price, // Track original price for discount calculations
        salesPerson: selectedSalesPerson.value // Assign the selected salesperson to the item
      });
    }
  }

  // Increment quantity of a specific order item
  function incrementOrderItem(item) {
    const existingItem = state.orderItems.find(orderItem =>
      orderItem.id === item.id && orderItem.Sku === item.Sku
    );
    if (existingItem && existingItem.qty < existingItem.MaxQty) {
      existingItem.qty++;
    }
  }

  // Decrement quantity of a specific order item or delete it if quantity is 1
  function decrementOrderItem(item) {
    const existingItem = state.orderItems.find(orderItem =>
      orderItem.id === item.id && orderItem.Sku === item.Sku
    );
    if (existingItem && existingItem.qty > 1) {
      existingItem.qty--;
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

  return {
    state,
    addOrderItem,
    incrementOrderItem,
    decrementOrderItem,
    deleteOrderItem,
    updateDiscountPercentage,
    resetDiscount,  // Expose this method for resetting discount
    getTotalDiscountPercentage,
    getOrderItems,
    getOrderTotal,
    getGstAmount,
    getPstAmount,
    selectedSalesPerson,
    setSelectedSalesPerson,
    applySalesPersonToAllItems,
  };
});
