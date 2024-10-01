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
            const startTime = Date.now();
            const chunkSize = 10000; // Process in chunks of 1000 items

            try {
                // Fetch the list of file URLs first
                const response = await fetch('/api/File/GetFiles', {
                    headers: {
                        'store-id': storeId,
                    }
                });

                const fileUrls = await response.json();
                console.log('File URLs:', fileUrls);

                const totalFiles = fileUrls.length;
                let loadedScripts = 0;

                // Reset products array and loading percentage
                this.products = [];
                this.loadingPercentage = 0;
                this.isLoading = true;

                // Helper function to process large arrays in chunks
                const processProductsInChunks = (productsArray) => {
                    const totalProducts = productsArray.length;
                    let processed = 0;

                    const processChunk = () => {
                        const chunk = productsArray.slice(processed, processed + chunkSize);
                        this.products.push(...chunk);
                        processed += chunkSize;

                        // Update loading percentage based on the processed items
                        this.loadingPercentage = Math.round((processed / totalProducts) * 100);

                        if (processed < totalProducts) {
                            // Process the next chunk asynchronously
                            setTimeout(processChunk, 0); // Yield control back to the browser
                        } else {
                            console.log('All products processed');
                        }
                    };

                    // Start processing the first chunk
                    processChunk();
                };

                // Load each file by dynamically injecting <script> tags
                fileUrls.forEach((file, index) => {
                    const script = document.createElement('script');
                    script.src = `https://localhost:7293/GenJs/${file.fileUrl}`;  // Adjust the URL to point to the correct server
                    script.async = true;

                    // When the script is loaded
                    script.onload = () => {
                        console.log(`Script ${index + 1} loaded from ${file.fileUrl}`);

                        // Assuming the external script exposes a global variable like `window.products`
                        if (window.products && Array.isArray(window.products)) {
                            // Process the large products array in chunks
                            processProductsInChunks(window.products);
                            console.log('Loaded products:', window.products);
                        } else {
                            console.warn(`No valid products array found in the script: ${file.fileUrl}`);
                        }

                        // Clear window.products after use to avoid conflicts with future scripts
                        // delete window.products;

                        // Update loading percentage for each script
                        loadedScripts++;
                        this.loadingPercentage = Math.round((loadedScripts / totalFiles) * 100);

                        if (this.loadingPercentage === 100) {
                            this.isLoading = false;
                        }
                    };

                    script.onerror = (error) => {
                        console.error(`Error loading script from ${file.fileUrl}`, error);
                        console.log(`Failed to load ${file.fileUrl}. Possible reasons: incorrect URL, file not found, or server error.`);
                    };

                    // Inject the script into the document head
                    document.head.appendChild(script);
                });

                const elapsedTime = Date.now() - startTime;

                // Set a fallback timeout to ensure the loading completes even if something goes wrong
                setTimeout(() => {
                    if (this.loadingPercentage < 100) {
                        this.loadingPercentage = 100;
                    }
                    this.isLoading = false;
                }, elapsedTime);
            } catch (error) {
                console.error('Error fetching files:', error);
                this.loadingPercentage = 0;
                this.isLoading = true;
            }
        }
    }
});
