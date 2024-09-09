import { defineStore } from 'pinia';
import { reactive, computed } from 'vue';

export const useOrderStore = defineStore('orders', () => {
    const state = reactive({
        orderItems: []
    });

    function addOrderItem(item) {
        const existingItem = state.orderItems.find(orderItem => 
            orderItem.id === item.id && orderItem.Sku === item.Sku && orderItem.Price === item.Price
        );
        
        if (existingItem) {
            existingItem.qty++;
        } else {
            state.orderItems.push({ ...item, qty: 1 });
        }
    }

    function incrementOrderItem(item) {
        const existingItem = state.orderItems.find(orderItem => 
            orderItem.id === item.id && orderItem.Sku === item.Sku
        );
        if (existingItem && existingItem.qty < existingItem.MaxQty) {
            existingItem.qty++;
        }
    }

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

    function deleteOrderItem(item) {
        const index = state.orderItems.findIndex(orderItem => 
            orderItem.id === item.id && orderItem.Sku === item.Sku
        );
        if (index !== -1) {
            state.orderItems.splice(index, 1);
        }
    }

    const getOrderItems = computed(() => state.orderItems);

    // Compute the total price of all order items
    const getOrderTotal = computed(() => {
        return state.orderItems.reduce((total, item) => {
            return total + (item.Price * item.qty);
        }, 0);
    });

    // Compute GST (0.5% of the total)
    const getGstAmount = computed(() => {
        return getOrderTotal.value * 0.005; // GST is 0.5%
    });

    // Compute PST (0.7% of the total)
    const getPstAmount = computed(() => {
        return getOrderTotal.value * 0.007; // PST is 0.7%
    });

    return {
        state,
        addOrderItem,
        incrementOrderItem,
        decrementOrderItem,
        deleteOrderItem,
        getOrderItems,
        getOrderTotal,
        getGstAmount,
        getPstAmount
    };
});
