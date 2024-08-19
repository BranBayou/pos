import { defineStore } from "pinia";
import { useUserStore } from "./auth-store";
export const useOrderStore = defineStore(
	"orders",
	() => {
		const products = ref([]);
		const customer = ref(null);
		const TotalDiscount = ref(0);
		const Total = ref(0);
		const totalQty = ref(0);
		const draftOrders = ref([]);
		const defaultSalesPerson = ref(null);
		const isIndDiscount = ref(false);
		const totalTax = ref({ GST: 0, PST: 0 });
		const comments = ref([]);
		const needManagerComment = ref(false);
		const manager = ref(null);

		/*--------------------Auth Store--------------------*/
		const authStore = useUserStore();

		/*--------------------Product Related Functions Block--------------------*/
		function addProduct(newProduct) {
			newProduct.salesPerson = defaultSalesPerson.value;
			for (const product of products.value) {
				if (product.BarCode == newProduct.BarCode) {
					product.qty++;
					return;
				}
			}

			products.value.push({
				...newProduct,
				qty: 1,
				pst: 0,
				gst: 0,
				discount: 0,
			});

			calculateTotal();
		}

		function deleteProduct(productBarcode) {
			for (let i = 0; i < products.value.length; i++) {
				if (products.value[i].BarCode === productBarcode) {
					products.value.splice(i, 1);
					calculateTotal();
					return;
				}
			}
		}

		function editProduct(editedProduct) {
			for (let i = 0; i < products.value.length; i++) {
				if (products.value[i].BarCode === editedProduct.BarCode) {
					products.value[i] = editedProduct;

					calculateTotal();

					return;
				}
			}
		}

		/*---------------------------Personnel Related Functions Block---------------------------*/

		function addSalesPersonToAllProducts(salesPerson) {
			defaultSalesPerson.value = salesPerson;
			for (const product of products.value) {
				product.salesPerson = salesPerson;
			}
		}

		function addCustomer(newCustomer) {
			customer.value = newCustomer;
		}

		function addManager(newManager) {
			manager.value = newManager;
		}

		/*--------------------Price Calculation Related Functions Block--------------------*/

		function roundToNearestFiveCents(amount) {
			return Math.round(amount * 20) / 20;
		}

		function setTotalDiscount(newDiscount) {
			TotalDiscount.value = newDiscount;
		}

		function calculateTotal() {
			Total.value = 0;
			TotalDiscount.value = 0;

			totalQty.value = 0;
			totalTax.value = { GST: 0, PST: 0 };

			var temp = false;
			for (const product of products.value) {
				Total.value += product.Price * product.qty;
				totalQty.value += product.qty;

				temp = !!(temp || parseFloat(product.discount));

				//Calculate total tax value

				for (const tax of product.tax) {
					totalTax.value[tax.taxname] +=
						product.Price * product.qty * tax.taxrate;
				}
			}

			isIndDiscount.value = temp;

			// Round to the nearest five cents
			Total.value = roundToNearestFiveCents(Total.value);

			for (const tax in totalTax.value) {
				totalTax.value[tax] = roundToNearestFiveCents(totalTax.value[tax]);
			}
		}

		/*--------------------Draft Related Functions Block--------------------*/

		function clearCurrentOrder() {
			authStore.clearManager();
			draftOrders.value.push({
				products: products.value,
				customer: customer.value,
				Total: Total.value,
				TotalDiscount: TotalDiscount.value,
				totalTax: totalTax.value,
				totalQty: totalQty.value,
				comments: comments.value,
				manager: manager.value,
				needManagerComment: needManagerComment.value,
				isIndDiscount: isIndDiscount.value,
			});

			comments.value = [];
			products.value = [];
			customer.value = null;
			Total.value = 0;
			TotalDiscount.value = 0;
			totalTax.value = { GST: 0, PST: 0 };
			totalQty.value = 0;
			needManagerComment.value = false;
			manager.value = null;
			isIndDiscount.value = false;
		}

		function resetSpecificOrder(index) {
			//If it does have current order clear it to be draft
			if (products.value.length) {
				clearCurrentOrder();
			}

			// load the draft order
			comments.value = draftOrders.value[index].comments;
			products.value = draftOrders.value[index].products;
			customer.value = draftOrders.value[index].customer;
			Total.value = draftOrders.value[index].Total;
			TotalDiscount.value = draftOrders.value[index].TotalDiscount;
			totalTax.value = draftOrders.value[index].totalTax;
			totalQty.value = draftOrders.value[index].totalQty;
			needManagerComment.value = draftOrders.value[index].needManagerComment;
			manager.value = draftOrders.value[index].manager;
			isIndDiscount.value = draftOrders.value[index].isIndDiscount;

			// delete the loaded order from draft order
			draftOrders.value.splice(index, 1);
		}

		function deleteDraftOrder(index) {
			draftOrders.value.splice(index, 1);
		}

		/*--------------Comment Add and Edit Related Function Blocks ------------------*/

		function addComment(newComment) {
			comments.value.push(newComment);
		}

		function toggleManagerComment() {
			needManagerComment.value = true;
		}

		function addReply(i, reply) {
			comments.value[i] = {
				...comments.value[i],
				reply: reply,
				isRequired: false,
			};
			needManagerComment.value = false;

			for (const comment of comments.value) {
				needManagerComment.value =
					needManagerComment.value || comment.isRequired;
			}
		}
		return {
			products,
			customer,
			Total,
			TotalDiscount,
			comments,
			totalQty,
			draftOrders,
			totalTax,
			isIndDiscount,
			needManagerComment,
			manager,
			addProduct,
			addCustomer,
			editProduct,
			addSalesPersonToAllProducts,
			clearCurrentOrder,
			resetSpecificOrder,
			deleteDraftOrder,
			deleteProduct,
			setTotalDiscount,
			addComment,
			addReply,
			roundToNearestFiveCents,
			toggleManagerComment,
			addManager,
		};
	},
	{
		persist: true,
	}
);
