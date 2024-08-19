import { defineStore } from "pinia";

export const useProductsTaxStore = defineStore("products-tax", () => {
	const taxConfig = ref([]);
	const products = ref([]);

	function addProducts(newProduct) {
		products.value = newProduct;
	}

	function setTaxConfig(newTaxConfig) {
		taxConfig.value = newTaxConfig;
	}

	return {
		taxConfig,
		products,
		addProducts,
		setTaxConfig,
	};
});
