import { defineStore } from 'pinia';
import axios from 'axios';
import { reactive, computed } from 'vue';

export const useOrderStore = defineStore('orders', () => {
    // Create a reactive object that contains the orderItems array
    const state = reactive({
        orderItems: []
    });

    // Example: Function to add an item to the orderItems array
    function addOrderItem(item) {
        state.orderItems.push(item);
        console.log(state.orderItems);
    }

    // Example: Function to remove an item from the orderItems array
    function removeOrderItem(index) {
        state.orderItems.splice(index, 1);
    }

    // Getter to return the current order items
    const getOrderItems = computed(() => state.orderItems);

    return {
        state,
        addOrderItem,
        removeOrderItem,
        getOrderItems,
    };
});
