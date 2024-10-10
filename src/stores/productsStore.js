// src/stores/productsStore.js
import { defineStore } from 'pinia';

export const useProductStore = defineStore('product', {
    state: () => ({
        products: [],
        loadingPercentage: 0,
        isLoading: true,
    }),
    actions: {
        async fetchProducts() {
            const storeId = '3XoymAusFEOcrifyfM1Tfw';
            const chunkSize = 10000;  // Number of products per chunk

            try {
                // Fetch the list of file URLs first
                const response = await fetch('/api/File/GetFiles', {
                    headers: {
                        'store-id': storeId,
                    }
                });

                const fileUrls = await response.json();
                const totalFiles = fileUrls.length;

                // Reset state
                this.products = [];
                this.loadingPercentage = 0;
                this.isLoading = true;

                let processedProducts = 0;  // Total products processed
                let estimatedTotalProducts = 1000000;  // Example estimate of total products
                let scriptsLoaded = 0;  // Scripts loaded counter

                // Time-based loading percentage increment
                const timeBasedLoader = setInterval(() => {
                    if (this.loadingPercentage < 99) {
                        this.loadingPercentage += 1;  // Increment percentage over time
                    }
                }, 100);  // Increment every 100ms (adjust as needed)

                // Helper function to process large arrays in chunks
                const processProductsInChunks = (productsArray) => {
                    const total = productsArray.length;
                    estimatedTotalProducts += total;  // Estimate total number of products
                    let processed = 0;

                    const processChunk = () => {
                        const chunk = productsArray.slice(processed, processed + chunkSize);
                        this.products.push(...chunk);  // Add chunk to products array
                        processed += chunkSize;
                        processedProducts += chunk.length;  // Track total processed products

                        if (processed < total) {
                            // Process the next chunk asynchronously
                            setTimeout(processChunk, 0);
                        }
                    };

                    processChunk();
                };

                // Load each file by dynamically injecting <script> tags
                fileUrls.forEach((file, index) => {
                    const script = document.createElement('script');
                    script.src = `https://localhost:7293/GenJs/${file.fileUrl}?${Date.now()}`;
                    script.async = true;

                    script.onload = () => {
                        if (window.products && Array.isArray(window.products)) {
                            processProductsInChunks(window.products);  // Process products
                        } else {
                            console.warn(`No valid products array found in ${file.fileUrl}`);
                        }

                        scriptsLoaded++;
                        if (scriptsLoaded === totalFiles) {
                            // When all scripts are loaded, stop the time-based loader and finalize percentage
                            clearInterval(timeBasedLoader);
                            this.loadingPercentage = 100;
                            this.isLoading = false;  // All products loaded, stop loading
                        }
                    };

                    script.onerror = (error) => {
                        console.error(`Error loading script from ${file.fileUrl}`, error);
                    };

                    // Inject the script into the document head
                    document.head.appendChild(script);
                });

            } catch (error) {
                console.error('Error fetching files:', error);
                this.loadingPercentage = 0;
                this.isLoading = true;  // Keep loading state on error
            }
        }
    }
});


