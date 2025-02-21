// src/stores/productsStore.js
import { defineStore } from 'pinia';

export const useProductStore = defineStore('product', {
    state: () => ({
        products: [],
        loadingPercentage: 0,
        isLoading: true,
        totalFileSize: 0,  // Total size of all files in bytes
        loadedFileSize: 0,  // Total size of files downloaded in bytes
    }),
    actions: {
        async fetchProducts() {
            const storeId = 'R-qbuRxyn0iAi2dvDVSA6g';
            const chunkSize = 10000;  // Number of products per chunk

            try {
                // Fetch the list of file URLs and metadata first
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
                this.totalFileSize = 0;
                this.loadedFileSize = 0;

                // Helper function to get the file size using a HEAD request
                const getFileSize = async (url) => {
                    const headResponse = await fetch(url, { method: 'HEAD' });
                    if (headResponse.ok) {
                        return parseInt(headResponse.headers.get('Content-Length'), 10);  // File size in bytes
                    } else {
                        console.error(`Failed to fetch file size for ${url}`);
                        return 0;
                    }
                };

                // First, get the total size of all files
                for (const file of fileUrls) {
                    const fileUrl = `/GenJs/${file.fileUrl}?${Date.now()}`;
                    const fileSize = await getFileSize(fileUrl);  // Get size of each file
                    this.totalFileSize += fileSize;
                }

                // console.log(`Total file size to download: ${this.totalFileSize} bytes`);

                // Helper function to process large arrays in chunks
                const processProductsInChunks = (productsArray) => {
                    const total = productsArray.length;
                    let processed = 0;

                    const processChunk = () => {
                        const chunk = productsArray.slice(processed, processed + chunkSize);
                        this.products.push(...chunk);  // Add chunk to products array
                        processed += chunkSize;

                        if (processed < total) {
                            // Process the next chunk asynchronously
                            setTimeout(processChunk, 0);
                        }
                    };

                    processChunk();
                };

                // Function to download and inject each file, tracking progress
                const loadFile = async (file) => {
                    return new Promise((resolve, reject) => {
                        const xhr = new XMLHttpRequest();
                        const fileUrl = `/GenJs/${file.fileUrl}?${Date.now()}`;
                        xhr.open('GET', fileUrl, true);
                        xhr.responseType = 'text';  // Expecting JavaScript code as text

                        // Track download progress
                        let currentFileLoaded = 0;
                        xhr.onprogress = (event) => {
                            if (event.lengthComputable) {
                                // Track only the difference between the last update and the current progress
                                const increment = event.loaded - currentFileLoaded;
                                this.loadedFileSize += increment;
                                currentFileLoaded = event.loaded;

                                // Calculate loading percentage
                                this.loadingPercentage = Math.min(100, Math.round((this.loadedFileSize / this.totalFileSize) * 100));
                            }
                        };

                        xhr.onload = () => {
                            if (xhr.status === 200) {
                                const script = document.createElement('script');
                                script.textContent = xhr.responseText;
                                document.head.appendChild(script);  // Inject the script into the document

                                if (window.products && Array.isArray(window.products)) {
                                    processProductsInChunks(window.products);  // Process products
                                } else {
                                    console.warn(`No valid products array found in ${file.fileUrl}`);
                                }

                                resolve();
                            } else {
                                console.error(`Error loading script from ${file.fileUrl}: ${xhr.statusText}`);
                                reject(new Error(xhr.statusText));
                            }
                        };

                        xhr.onerror = () => {
                            console.error(`Error loading script from ${file.fileUrl}`);
                            reject(new Error('Network error'));
                        };

                        xhr.send();
                    });
                };

                // Load each file and track progress
                for (const file of fileUrls) {
                    await loadFile(file);
                }

                // When all files are downloaded, finalize the loading state
                this.loadingPercentage = 100;
                this.isLoading = false;
                console.log('All products loaded.');
                console.log('Final product:', this.products);
            } catch (error) {
                console.error('Error fetching files:', error);
                this.loadingPercentage = 0;
                this.isLoading = true;  // Keep loading state on error
            }
        }
    }
});
