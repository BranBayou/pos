<script setup>
import { ref, computed, watch } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useOrderStore } from '@/stores/OrderStore';
import axios from 'axios';
import { useToast } from 'vue-toastification';

const authStore = useAuthStore();
const orderStore = useOrderStore();
const toast = useToast();

// Selected payment methods and payment lines
const selectedPaymentMethods = ref([]);

// Available payment methods
const paymentMethods = [
  { id: '1', name: 'American Express', icon: '/american-express.svg' },
  { id: '2', name: 'MasterCard', icon: '/mastercard.svg' },
  { id: '3', name: 'PayPal', icon: '/paypal.svg' },
  { id: '4', name: 'Visa', icon: '/visa.svg' },
  { id: '5', name: 'Cash', icon: '/cash.svg' }
];

// Total order amount
const totalAmount = computed(() => orderStore.getOrderTotal);

// Remaining balance to be paid
const remainingAmount = computed(() => {
  const allocatedAmount = selectedPaymentMethods.value.reduce((acc, method) => acc + parseFloat(method.amount || 0), 0);
  return (totalAmount.value - allocatedAmount).toFixed(2);
});

// Function to add a payment method
function addPaymentMethod(paymentMethod) {
  const existingMethod = selectedPaymentMethods.value.find(method => method.id === paymentMethod.id);
  
  if (!existingMethod) {
    selectedPaymentMethods.value.push({
      id: paymentMethod.id,
      name: paymentMethod.name,
      amount: remainingAmount.value > 0 ? remainingAmount.value : 0
    });
  } else {
    toast.error(`${paymentMethod.name} is already selected.`);
  }
}

// Function to clear the amount for a payment method
function clearPaymentAmount(method) {
  const methodToUpdate = selectedPaymentMethods.value.find(m => m.id === method.id);
  if (methodToUpdate) {
    methodToUpdate.amount = '0.00';
  }
}

// Generate predictive cash amounts
const predictiveCashAmounts = computed(() => {
  const total = parseFloat(totalAmount.value);
  if (!isNaN(total)) {
    return [20, 50, 100, 200, 500];
  }
  return [];
});

// Function to update cash amount based on button click
function setCashAmount(amount) {
  const cashMethod = selectedPaymentMethods.value.find(method => method.name === 'Cash');
  if (cashMethod) {
    cashMethod.amount = amount.toFixed(2);
  }
}

// Prevent negative input on typing
function preventNegativeInput(event) {
  if (event.key === '-' || event.key === 'e') {
    event.preventDefault();
  }
}

// Function to update the amount for a specific payment method
function updatePaymentAmount(method, amount) {
  const methodToUpdate = selectedPaymentMethods.value.find(m => m.id === method.id);
  if (methodToUpdate) {
    const newAmount = Math.max(0, parseFloat(amount)).toFixed(2);
    const currentRemaining = totalAmount.value - selectedPaymentMethods.value.reduce((acc, m) => acc + (m.id === method.id ? 0 : parseFloat(m.amount || 0)), 0);

    if (newAmount > currentRemaining) {
      toast.error('Amount exceeds remaining balance.');
      methodToUpdate.amount = currentRemaining.toFixed(2);
    } else {
      methodToUpdate.amount = newAmount;
    }
  }
}

// Watcher to automatically adjust remaining amount for the last payment method
watch(selectedPaymentMethods, (newVal) => {
  if (newVal.length > 0 && remainingAmount.value <= 0) {
    newVal[newVal.length - 1].amount = (parseFloat(newVal[newVal.length - 1].amount) + parseFloat(remainingAmount.value)).toFixed(2);
  }
});

// Function to handle checkout and API submission
async function handleCheckout() {
  if (selectedPaymentMethods.value.length === 0) {
    toast.error('Please select a payment method.');
    return;
  }

  const totalAllocated = selectedPaymentMethods.value.reduce(
    (acc, method) => acc + parseFloat(method.amount || 0),
    0
  );

  if (Math.abs(totalAllocated.toFixed(2) - totalAmount.value.toFixed(2)) > 0.01) {
    toast.error('Payment allocation does not match the total amount.');
    return;
  }

  const payload = {
    ItemList: orderStore.state.orderItems.map(item => ({
      ItemId: item.id,
      Qty: item.qty,
      Discount: item.discountPercentage || 0,
      TaxesWaived: false,
      SalesPersonId: item.salesPerson || 'defaultSalesPersonId'
    })),
    ApprovalList: [], 
    OverallDiscount: orderStore.state.overallDiscount || 0,
    Customer: {
      id: '',
      Name: 'Customer Name',
      Phone: '123-456-7890',
      Email: 'customer@example.com',
      Note: 'Optional note'
    },
    Comments: [
      {
        UserId: authStore.managerUser.id, 
        Text: 'Order comments here'
      }
    ],
    Payment: selectedPaymentMethods.value.map(method => ({
      TaxId: method.id,
      Percentage: (method.amount / totalAmount.value) * 100
    })),
    Total: totalAmount.value
  };

  try {
    const response = await axios.post('/api/NewOrder', payload);
    if (response.status === 200) {
      toast.success('Order placed successfully');
      authStore.toggleCheckoutPopup();
      orderStore.clearOrder();
    } else {
      toast.error('Failed to place the order.');
    }
  } catch (error) {
    toast.error('An error occurred during checkout.');
  }
}
</script>


<template>
  <Teleport to="body">
    <Transition name="modal-outer">
      <div 
        v-show="authStore.isCheckoutPopupVisible"
        @click="authStore.toggleCheckoutPopup"
        class="absolute w-full bg-black bg-opacity-30 h-screen top-0 left-0 flex justify-center px-8"
      >
        <Transition name="modal-inner" class="rounded-2xl">
          <div
            v-if="authStore.isCheckoutPopupVisible"
            @click.stop
            class="fixed top-10 z-50 flex items-center justify-center bg-black bg-opacity-30 w-10/12"
          >
            <div class="bg-white rounded-2xl shadow-lg p-6 w-full">
              <h1 class="font-semibold text-[24px] pb-4">Checkout</h1>
              
              <div class="w-6/12 flex justify-between gap-3 mb-5 bg-gray-100 rounded-xl p-3">
                <!-- Payment methods -->
                <button
                  v-for="method in paymentMethods"
                  :key="method.id"
                  class="w-24 border-2 px-5 py-3 rounded-xl bg-white hover:bg-gray-200"
                  @click="addPaymentMethod(method)"
                >
                  <img :src="method.icon" :alt="method.name" class="mx-auto w-12 h-12">
                </button>
              </div>

              <div class="mb-5 w-6/12">
                <h2 class="font-semibold text-lg mb-2">Selected Payments</h2>
                <ul class="space-y-3">
                  <li v-for="method in selectedPaymentMethods" :key="method.id" class="flex flex-col items-center justify-between bg-gray-100 p-3 rounded-lg shadow-sm">
                    <div class="flex w-full justify-between">
                      <img :src="paymentMethods.find(pm => pm.id === method.id).icon" alt="" class="w-10 h-10">
                      <div class="relative flex items-center gap-4">
                        <input 
                          type="number" 
                          v-model.number="method.amount" 
                          @input="updatePaymentAmount(method, method.amount)"
                          @keydown="preventNegativeInput"
                          :max="remainingAmount"
                          class="border-2 border-gray-300 rounded-md py-1 px-3 w-32 text-right focus:ring focus:ring-purple-200 focus:outline-none focus:border-purple-500 pr-10"
                        >
                        <!-- Clear Button inside Input -->
                        <button 
                          v-if="method.amount > 0" 
                          @click="clearPaymentAmount(method)"
                          class="absolute right-2 top-2 text-gray-500 hover:text-gray-700 text-lg"
                        >
                          <i class="pi pi-times"></i>
                        </button>
                      </div>
                    </div>
                    
                    <!-- Predictive Cash Amounts if Cash is selected -->
                    <div v-if="method.name === 'Cash'" class="mt-2 w-full flex gap-2 justify-end">
                      <button 
                        v-for="amount in predictiveCashAmounts" 
                        :key="amount" 
                        :disabled="amount > totalAmount"  
                        @click="setCashAmount(amount)"
                        class="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        ${{ amount }}
                      </button>
                    </div>
                  </li>
                </ul>

                <div class="flex items-center justify-between mt-2">
                  <p :class="{'text-green-500': remainingAmount == 0, 'text-red-500': remainingAmount > 0}">
                    Remaining balance: ${{ remainingAmount }}
                    <span v-if="remainingAmount == 0" class="ml-2 text-green-500"><i class="pi pi-check"></i></span>
                  </p>
                </div>
              </div>

              <p class="text-xl font-semibold mb-5">Total: ${{ totalAmount }}</p>

              <div class="w-6/12 flex justify-end">
                <button 
                  @click="handleCheckout"
                  class="bg-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-600 transition"
                >
                  Confirm and Checkout
                </button>
              </div>
            </div>
          </div>        
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>






<style scoped>
.modal-outer-enter-active,
  .modal-outer-leave-active {
    transition: opacity 0.3s cubic-bezier(0.52, 0.02, 0.19, 1.12);
  }

  .modal-outer-enter-from,
  .modal-outer-leave-to {
    opacity: 0;
  }

  .modal-inner-enter-active {
    transition: all 0.3s cubic-bezier(0.52, 0.02, 0.19, 1.12) 0.15s;
  }
  
  .modal-inner-leave-active {
    transition: all 0.3s cubic-bezier(0.52, 0.02, 0.19, 1.12);
  }

  .modal-inner-enter-from {
    opacity: 0;
    transform: scale(0.8);
  }

  .modal-inner-leave-to {
    transform: scale(0.8);
  }

  input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style>