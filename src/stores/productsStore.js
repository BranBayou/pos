// src/stores/productsStore.js
import { defineStore } from 'pinia';
import axios from 'axios';

export const useProductStore = defineStore('product', {
    state: () => ({
        products: [],
        loadingPercentage: 0,
        isLoading: true,
    }),
    actions: {
        async fetchProducts() {
            const startTime = Date.now(); // Record the start time

            try {
                const response = await axios.get('http://localhost:3131/products');
                this.products = response.data;
                
                const elapsedTime = Date.now() - startTime; // Calculate the elapsed time

                // Start a timer to increment the loadingPercentage after connection is made
                const loadingInterval = setInterval(() => {
                    if (this.loadingPercentage < 100) {
                        this.loadingPercentage += 1;
                    }
                }, elapsedTime / 100); // Adjust the interval based on actual loading time

                setTimeout(() => {
                    clearInterval(loadingInterval);
                    this.loadingPercentage = 100; // Jump to 100% when loading is complete
                    this.isLoading = false;
                }, elapsedTime); // Use the actual elapsed time as the timeout duration
            } catch (error) {
                console.error('Error fetching products:', error);
                this.loadingPercentage = 0; // Keep loading percentage at 0 on error
                this.isLoading = true; // Keep the loading spinner
            }
        }
    }
});

