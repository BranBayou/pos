import { defineStore } from 'pinia';
import { reactive, computed } from 'vue';

export const useOrderStore = defineStore('orders', () => {
    // Create a reactive object that contains the orderItems array
    const state = reactive({
        orderItems: []
    });

    // Function to add an item to the orderItems array
    function addOrderItem(item) {
        // Check if an identical item (same id and other properties like SKU) exists
        const existingItem = state.orderItems.find(orderItem => 
            orderItem.id === item.id && orderItem.Sku === item.Sku && orderItem.Price === item.Price
        );
        
        if (existingItem) {
            // If the exact same item exists, just increase the quantity
            existingItem.qty++;
        } else {
            // If it's a new item, add it separately with an initial quantity of 1
            state.orderItems.push({ ...item, qty: 1 });
        }
    }

    // Function to increment the quantity of an order item
    function incrementOrderItem(item) {
        const existingItem = state.orderItems.find(orderItem => 
            orderItem.id === item.id && orderItem.Sku === item.Sku
        );
        if (existingItem && existingItem.qty < existingItem.MaxQty) {
            existingItem.qty++;
        }
    }

    // Function to decrement the quantity of an order item
    function decrementOrderItem(item) {
        const existingItem = state.orderItems.find(orderItem => 
            orderItem.id === item.id && orderItem.Sku === item.Sku
        );
        if (existingItem && existingItem.qty > 1) {
            existingItem.qty--;
        } else if (existingItem && existingItem.qty === 1) {
            // If quantity reaches 0, remove the item from the order
            deleteOrderItem(existingItem);
        }
    }

    // Function to delete an item from the orderItems array
    function deleteOrderItem(item) {
        const index = state.orderItems.findIndex(orderItem => 
            orderItem.id === item.id && orderItem.Sku === item.Sku
        );
        if (index !== -1) {
            state.orderItems.splice(index, 1);
        }
    }

    // Getter to return the current order items
    const getOrderItems = computed(() => state.orderItems);

    // Getter to calculate the total price of the order items
    const getOrderTotal = computed(() => {
        return state.orderItems.reduce((total, item) => {
            return total + (item.Price * item.qty);
        }, 0);
    });

    return {
        state,
        addOrderItem,
        incrementOrderItem,
        decrementOrderItem,
        deleteOrderItem,
        getOrderItems,
        getOrderTotal
    };
});
