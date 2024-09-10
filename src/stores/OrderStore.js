import { defineStore } from 'pinia';
import { reactive, computed } from 'vue';

export const useOrderStore = defineStore('orders', () => {
    const state = reactive({
        orderItems: [],
        gst: 0.5, // GST default value
        pst: 0.7  // PST default value
    });

    function addOrderItem(item) {
        const existingItem = state.orderItems.find(orderItem => 
            orderItem.id === item.id && orderItem.Sku === item.Sku && orderItem.Price === item.Price
        );
        
        if (existingItem) {
            existingItem.qty++;
        } else {
            state.orderItems.push({ 
                ...item, 
                qty: 1,
                discountPercentage: item.discountPercentage || 0, // Ensure discount is tracked
                OriginalPrice: item.Price // Track original price for discount calculations
            });
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

    function updateDiscountPercentage(item, discountPercentage) {
        const existingItem = state.orderItems.find(orderItem => 
            orderItem.id === item.id && orderItem.Sku === item.Sku
        );
        if (existingItem) {
            existingItem.discountPercentage = discountPercentage;
            existingItem.Price = (existingItem.OriginalPrice * (1 - discountPercentage / 100)).toFixed(2);
        }
    }

    const getTotalDiscountPercentage = computed(() => {
        if (state.orderItems.length === 0) return 0;
        
        return state.orderItems.reduce((totalDiscount, item) => {
            return totalDiscount + parseFloat(item.discountPercentage || 0);
        }, 0) / state.orderItems.length;
    });


    const getOrderItems = computed(() => state.orderItems);

    const getOrderTotal = computed(() => {
        return state.orderItems.reduce((total, item) => {
            return total + (item.Price * item.qty);
        }, 0);
    });

    const getGstAmount = computed(() => {
        return getOrderTotal.value * (state.gst / 100);
    });

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
        getTotalDiscountPercentage,
        getOrderItems,
        getOrderTotal,
        getGstAmount,
        getPstAmount,
    };
});
