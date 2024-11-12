<script setup>
import { ref, computed, watch } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useOrderStore } from '@/stores/OrderStore';
import axios from 'axios';
import { useToast } from 'vue-toastification';
import { jsPDF } from "jspdf";

const authStore = useAuthStore();
const orderStore = useOrderStore();
const toast = useToast();
const doc = new jsPDF();

// doc.text("Hello world!", 10, 10);
// doc.save("a4.pdf");

const isInvoiceVisible = ref(false);

function showInvoice() {
  const remaining = parseFloat(remainingAmount.value);

  // Check if remaining amount is effectively zero, allowing for small floating-point inaccuracies
  if (Math.abs(remaining) < 0.01) {
    isInvoiceVisible.value = true;
    console.log("Invoice is visible:", isInvoiceVisible.value);
  } else {
    toast.error('Please allocate the full payment before generating an invoice.');
    console.log("Invoice is not visible. Remaining amount:", remainingAmount.value);
  }
}



function closeInvoice() {
  isInvoiceVisible.value = false;
}

// Selected payment methods and payment lines
const selectedPaymentMethods = ref([]);

// Available payment methods
const paymentMethods = [
  { id: '5', name: 'Cash', icon: '/cash.svg' },
  { id: '4', name: 'Visa', icon: '/visa.svg' },
  { id: '2', name: 'MasterCard', icon: '/mastercard.svg' },
  { id: '1', name: 'American Express', icon: '/american-express.svg' },
  { id: '3', name: 'PayPal', icon: '/paypal.svg' },
];

// Total order amount
const totalAmount = computed(() => orderStore.getOrderTotal);

// Remaining balance to be paid (will not go negative)
const remainingAmount = computed(() => {
  const allocatedAmount = selectedPaymentMethods.value.reduce((acc, method) => acc + parseFloat(method.amount || 0), 0);
  return Math.max(totalAmount.value - allocatedAmount, 0).toFixed(2);
});


// Function to add a payment method
function addPaymentMethod(paymentMethod) {
  const existingMethod = selectedPaymentMethods.value.find(method => method.id === paymentMethod.id);

  if (!existingMethod) {
    
    // If this is the first payment method, set its amount to the total order amount
    if (selectedPaymentMethods.value.length === 0) {
      selectedPaymentMethods.value.push({
        id: paymentMethod.id,
        name: paymentMethod.name,
        amount: totalAmount.value.toFixed(2) // Set to total price
      });
    } else {
      // For subsequent methods, set amount to 0 initially
      selectedPaymentMethods.value.push({
        id: paymentMethod.id,
        name: paymentMethod.name,
        amount: '0.00'
      });
    }
  } else {
    toast.error(`${paymentMethod.name} is already selected.`);
  }
}

// handle clear the amount for a payment method
function clearPaymentAmount(method) {
  const methodToUpdate = selectedPaymentMethods.value.find(m => m.id === method.id);
  if (methodToUpdate) {
    methodToUpdate.amount = '0.00';
  }
}

// handle predictive cash amounts
const predictiveCashAmounts = computed(() => {
  const remaining = parseFloat(remainingAmount.value);
  //const total = parseFloat(totalAmount.value);
  if (!isNaN(remaining)) {
    // Calculate the next nearest amounts to the total price
    if (remaining <= 20) {
      return [20, 50, 100]; 
    } else if (remaining <= 50) {
      return [50, 100, 200]; 
    } else if (remaining <= 100) {
      return [100, 200]; 
    } else if (remaining <= 200) {
      return [200, 250, 300]; 
    } else if (remaining <= 300) {
      return [300, 400, 500]; 
    } else if (remaining <= 400) {
      return [400, 500, 600]; 
    } 
    else {
      return [500, 600, 700]; 
    }
  }
  return [];
});


// handle update cash amount based on button click
function setCashAmount(amount) {
  const cashMethod = selectedPaymentMethods.value.find(method => method.name === 'Cash');
  if (cashMethod) {
    cashMethod.amount = amount.toFixed(2); // Allow larger amounts to be set
  } else {
    addPaymentMethod({ id: '5', name: 'Cash', icon: '/cash.svg' });
    setCashAmount(amount);
  }
}

// Prevent negative input on typing
function preventNegativeInput(event) {
  const invalidChars = ['-', 'e', '+'];
  if (invalidChars.includes(event.key)) {
    event.preventDefault();
  }
}

/*
// update the amount for a specific payment method
function updatePaymentAmount(method, amount) {
  const methodToUpdate = selectedPaymentMethods.value.find(m => m.id === method.id);

  if (methodToUpdate) {
    const cleanedAmount = amount.replace(/[^\d.]/g, ''); // Remove invalid characters
    const parsedAmount = parseFloat(cleanedAmount); // Parse valid decimal number

    if (!isNaN(parsedAmount)) {
      // Update the current method's amount
      methodToUpdate.amount = cleanedAmount;

      // Calculate the total allocated amount
      const totalAllocated = selectedPaymentMethods.value.reduce((acc, m) => acc + parseFloat(m.amount || 0), 0);
      const totalOrder = parseFloat(totalAmount.value);

      // If total allocated exceeds total order, adjust the previous method
      if (totalAllocated > totalOrder) {
        const excessAmount = totalAllocated - totalOrder;
        adjustPreviousPaymentMethod(excessAmount, method.id);
      }
    } else {
      methodToUpdate.amount = ''; // Allow clearing the input
    }
  }
}

function adjustPreviousPaymentMethod(excessAmount, currentMethodId) {
  // Find the last payment method before the current one
  const previousMethod = selectedPaymentMethods.value.find(method => method.id !== currentMethodId);

  if (previousMethod) {
    const adjustedAmount = Math.max(parseFloat(previousMethod.amount) - excessAmount, 0);
    previousMethod.amount = adjustedAmount.toFixed(2);
  }
}

// Watcher to automatically adjust remaining amount for the last payment method

watch(selectedPaymentMethods, (newVal) => {
  const cashMethod = selectedPaymentMethods.value.find(method => method.name === 'Cash');
  if (cashMethod) {
    const cashPaid = parseFloat(cashMethod.amount || 0);
    const totalOrder = parseFloat(totalAmount.value);

    // Automatically set the change when cash exceeds total
    if (cashPaid > totalOrder) {
      changeAmount.value = (cashPaid - totalOrder).toFixed(2);
    } else {
      changeAmount.value = '0.00';
    }
  }
}, { deep: true });
*/

watch(selectedPaymentMethods, (newVal) => {
  const totalAllocated = newVal.reduce((acc, m) => acc + parseFloat(m.amount || 0), 0);
  const totalOrder = parseFloat(totalAmount.value);

  // Ensure total allocation matches the total order amount
  if (totalAllocated > totalOrder) {
    const excessAmount = totalAllocated - totalOrder;
    //adjustPreviousPaymentMethod(excessAmount, newVal[newVal.length - 1].id);
  }
}, { deep: true });

// Watcher to automatically adjust remaining amount for the last payment method
watch(selectedPaymentMethods, (newVal) => {
  if (newVal.length > 0 && remainingAmount.value <= 0) {
    newVal[newVal.length - 1].amount = (parseFloat(newVal[newVal.length - 1].amount) + parseFloat(remainingAmount.value)).toFixed(2);
  }
});

// handle remove payment method
function removePaymentMethod(methodId) {
  const index = selectedPaymentMethods.value.findIndex(method => method.id === methodId);
  if (index !== -1) {
    selectedPaymentMethods.value.splice(index, 1);
    toast.success('Payment method removed.');
  }
}

// handle checkout and API submission
async function handleCheckout() {

  const remaining = parseFloat(remainingAmount.value);
  if (selectedPaymentMethods.value.length === 0) {
    toast.error('Please select a payment method.');
    return;
  }

  // Calculate the total allocated amount from the selected payment methods
  const totalAllocated = selectedPaymentMethods.value.reduce(
    (acc, method) => acc + parseFloat(method.amount || 0),
    0
  );

  // Ensure the allocated amount matches the total order amount
  // if (Math.abs(totalAllocated.toFixed(2) - orderStore.state.total.toFixed(2)) > 0.01) {
  //   toast.error('Payment allocation does not match the total amount.');
  //   return;
  // }

  if (Math.abs(remaining > 0.01)) {
    toast.error('Payment allocation does not match the total amount.');
    return;
  }

  // Prepare the payload for API submission
  const payload = {
    // Map order items to API format
    ItemList: orderStore.state.orderItems.map(item => ({
      ItemId: item.ItemId,
      Qty: item.Qty,
      Discount: item.Discount || 0,
      TaxesWaived: item.TaxesWaived,
      SalesPersonId: item.SalesPersonId || 'defaultSalesPersonId'
    })),

    // Approval list (updated structure)
    ApprovalList: orderStore.state.approvalList.map(approval => ({
      ManagerId: approval.ManagerId || 'defaultManagerId',
      ManagerApprovalId: approval.ManagerApprovalId || 'defaultApprovalId',
      ItemId: approval.ItemId || null,
      isOverallDiscount: approval.isOverallDiscount || false,
      id: approval.id || '' // Using a function to generate unique IDs
    })),

    // Overall discount
    OverallDiscount: orderStore.state.overallDiscount || 0,

    // Customer details
    Customer: {
      id: orderStore.state.customer.id || '',
      Name: orderStore.state.customer.name || '',
      Phone: orderStore.state.customer.phone || '',
      Email: orderStore.state.customer.email || '',
      Note: orderStore.state.customer.note || ''
    },

    // Comments list
    Comments: orderStore.state.comments.map(comment => ({
      UserId: comment.userId || authStore.managerUser.id, 
      Text: comment.text || ''
    })),

    // Payment details
    Payment: selectedPaymentMethods.value.map(method => ({
      PaymentMethodId: method.id,
      Amount: method.amount,
      Percentage: (method.amount / orderStore.state.total) * 100
    })),

    Taxes: orderStore.state.taxes.map(tax => ({
      TaxId: tax.type,
      Amount: tax.rate,
    })),

    // Total order amount
    Total: orderStore.state.total
  };

  console.log('Payload data:', payload);

  try {
    // API call to place the order
    const response = await axios.post('/api/NewOrder', payload);
    if (response.status === 200) {
      toast.success('Order placed successfully');
      authStore.toggleCheckoutPopup(); // Close the checkout popup
      orderStore.clearOrder(); 
    } else {
      toast.error('Failed to place the order.');
    }
  } catch (error) {
    console.error('Checkout error:', error);
    toast.error('An error occurred during checkout.');
  }
}

// Calculating the change when cash payment exceeds the total (specific to the cash method)
const changeAmount = computed(() => {
  const totalAllocated = selectedPaymentMethods.value.reduce(
    (acc, method) => acc + parseFloat(method.amount || 0), 0
  ); // Sum up amounts from all payment methods
  
  const totalOrder = parseFloat(totalAmount.value); // Total order amount
  
  if (totalAllocated > totalOrder) {
    const cashMethod = selectedPaymentMethods.value.find(method => method.name === 'Cash');
    if (cashMethod) {
      const cashPaid = parseFloat(cashMethod.amount || 0);
      const remainingToCover = totalOrder - (totalAllocated - cashPaid); // Remaining amount to be covered by cash
      
      if (cashPaid > remainingToCover) {
        return (cashPaid - remainingToCover).toFixed(2); // Return the change
      }
    }
  }
  return '0.00'; // Default value when no change
});


const generateInvoice = computed(() => {
  // Map items to calculate item totals
  const invoiceItems = orderStore.state.orderItems.map(item => ({
    name: item.ItemName || 'Unknown Item',
    quantity: item.Qty || 1,
    price: item.Price || 0,
    total: (item.Qty * item.Price).toFixed(2)  // Total price per item
  }));

  // Calculate subtotal
  const subtotal = invoiceItems.reduce((acc, item) => acc + parseFloat(item.total), 0).toFixed(2);

  // Calculate overall discount on the subtotal
  const overallDiscount = orderStore.state.overallDiscount || 0;
  const discountAmount = (subtotal * (overallDiscount / 100)).toFixed(2);

  // Calculate the taxable amount (subtotal minus the discount)
  const taxableAmount = (subtotal - discountAmount).toFixed(2);

  // Get GST and PST rates
  const gstRate = orderStore.state.taxes.find(tax => tax.type === 'GST').rate || 5;
  const pstRate = orderStore.state.taxes.find(tax => tax.type === 'PST').rate || 7;

  // Calculate GST and PST based on the pre-tax subtotal (taxable amount)
  const gst = (taxableAmount * (gstRate / 100)).toFixed(2);
  const pst = (taxableAmount * (pstRate / 100)).toFixed(2);

  // Calculate the final total amount (subtotal - discount + taxes)
  const totalAmount = parseFloat(taxableAmount).toFixed(2);

  return {
    items: invoiceItems,
    subtotal: subtotal || '0.00',
    discountAmount: discountAmount || '0.00',
    gst: gst || '0.00',
    pst: pst || '0.00',
    totalAmount: totalAmount || '0.00'
  };
});



function generatePDF() {
  const doc = new jsPDF();
  
  console.log("Generating PDF...");

  // Add title
  doc.setFontSize(18);
  doc.text('Invoice', 105, 20, { align: 'center' });

  // Add customer and date info
  doc.setFontSize(12);
  doc.text(`Customer: ${orderStore.state.customer.name || 'N/A'}`, 20, 40);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 160, 40);

  console.log("Added customer and date info");

  // Generate table from invoice data
  const tableColumnHeaders = ["Item", "Qty", "Price", "Total"];
  const tableRows = generateInvoice.items.map(item => [
    item.name,
    item.quantity,
    `$${item.price}`,
    `$${item.total}`
  ]);

  // Add the table to the PDF
  doc.autoTable({
    head: [tableColumnHeaders],
    body: tableRows,
    startY: 50,
    theme: 'grid',
    styles: { halign: 'right' }
  });

  console.log("Added items table");

  // Add totals section
  doc.text(`Subtotal: $${generateInvoice.subtotal}`, 160, doc.lastAutoTable.finalY + 10);
  doc.text(`Discount: $${generateInvoice.discountAmount}`, 160, doc.lastAutoTable.finalY + 20);
  doc.text(`GST: $${generateInvoice.gst}`, 160, doc.lastAutoTable.finalY + 30);
  doc.text(`PST: $${generateInvoice.pst}`, 160, doc.lastAutoTable.finalY + 40);
  doc.text(`Total: $${generateInvoice.totalAmount}`, 160, doc.lastAutoTable.finalY + 50);

  console.log("Added totals");

  // Save or download the PDF
  doc.save('invoice.pdf');
  console.log("PDF saved");
}
</script>


<template>
  <Teleport to="body">
    <Transition name="modal-outer">
      <div v-show="authStore.isCheckoutPopupVisible && authStore.isUserLoggedIn || authStore.isManagerLoggedIn" @click="authStore.toggleCheckoutPopup"
        class="absolute w-full bg-black bg-opacity-30 h-screen top-0 left-0 flex justify-center px-8">
        <Transition name="modal-inner" class="rounded-2xl">
          <div v-if="authStore.isCheckoutPopupVisible" @click.stop
            class="fixed top-10 z-50 flex items-center justify-center bg-black bg-opacity-30 w-10/12">
            <div class="flex bg-white rounded-2xl shadow-lg p-6 w-full">
              <div class="w-6/12">
                <h1 class="font-semibold text-[24px] pb-4">Checkout</h1>

                <div class="flex justify-between gap-3 mb-5 bg-gray-100 rounded-xl p-3">
                  <!-- Payment methods -->
                  <button v-for="method in paymentMethods" :key="method.id"
                    class="w-24 border-2 px-5 py-3 rounded-xl bg-white hover:bg-gray-200"
                    @click="addPaymentMethod(method)">
                    <img :src="method.icon" :alt="method.name" class="mx-auto w-12 h-12">
                  </button>
                </div>

                <div class="mb-5">
                  <h2 class="font-semibold text-lg mb-2">Selected Payments</h2>
                  <ul class="space-y-3 max-h-80 overflow-auto">
                    <li v-for="method in selectedPaymentMethods" :key="method.id"
                      class="flex flex-col items-center justify-between bg-gray-100 p-3 rounded-lg shadow-sm relative group">
                      <div class="flex w-full justify-between px-5 py-3">
                        <img :src="paymentMethods.find(pm => pm.id === method.id).icon" alt="" class="w-10 h-10">
                        <div class="relative flex items-center gap-4">
                          <input 
                            type="text" 
                            v-model="method.amount" 
                            @input="updatePaymentAmount(method, method.amount)" 
                            @keydown="preventNegativeInput"
                            class="border-2 border-gray-300 rounded-md py-1 px-3 w-32 text-right focus:ring focus:ring-purple-200 focus:outline-none focus:border-purple-500 pr-10">

                          <!-- Clear Button inside Input -->
                          <button v-if="method.amount > 0" @click="clearPaymentAmount(method)"
                            class="absolute right-2 top-2 text-gray-500 hover:text-gray-700 text-lg"
                            style="font-size: 14px;">
                            <i class="pi pi-times"></i>
                          </button>
                        </div>
                      </div>

                      <!-- Remove Payment Method Button - Visible on Hover -->
                      <button @click="removePaymentMethod(method.id)"
                        class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:gray-red-700">
                        <i class="pi pi-times"></i>
                      </button>

                      <!-- Predictive Cash Amounts if Cash is selected -->
                      <div v-if="method.name === 'Cash'" class="w-full flex gap-2 justify-end px-5">
                        <button 
                          v-for="amount in predictiveCashAmounts" 
                          :key="amount" 
                          @click="setCashAmount(amount)"
                          class="bg-gray-200 p-2 rounded hover:bg-gray-300"
                        >
                          ${{ amount }}
                        </button>
                      </div>
                      <p v-if="method.name === 'Cash' && parseFloat(changeAmount) > 0" class="text-purple-500 ml-auto mr-5 mt-2">
                        Change: ${{ changeAmount }}
                      </p>
                    </li>
                  </ul>

                  <div class="flex items-center justify-between mt-2">
                    <p :class="{ 'text-green-500': remainingAmount == 0, 'text-red-500': remainingAmount > 0 }">
                      Remaining balance: ${{ remainingAmount }}
                      <span v-if="remainingAmount == 0" class="ml-2 text-green-500"><i class="pi pi-check"></i></span>
                    </p>
                  </div>
                </div>

                <p class="text-xl font-semibold mb-5">Total: ${{ totalAmount.toFixed(2) }}</p>

                <div class="flex justify-end gap-3">
                  <button @click="showInvoice"
                    class="bg-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-600 transition">
                    Invoice
                  </button>
                  <button @click="handleCheckout"
                    class="bg-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-600 transition">
                    Confirm and Checkout
                  </button>
                </div>
              </div>
              <!-- Invoice Section -->
              <div v-if="isInvoiceVisible" class="invoice-div w-6/12 ml-16 p-6 bg-gray-100 rounded-lg shadow-lg relative group max-h-[700px] overflow-y-scroll">
                <h2 class="text-xl font-bold mb-3">DefaultPOSDowntown</h2>
                <button 
                  @click="closeInvoice"
                  class="absolute top-2 right-2 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style="font-size: 16px;"
                >
                  <i class="pi pi-times text-gray-500"></i>
                </button>
                <div class="mb-5">
                  <p><strong>Customer:</strong> {{ orderStore.state.customer.name || 'N/A' }}</p>
                  <p><strong>Date:</strong> {{ orderStore.formatDate(Date.now()) }}</p>
                  <p><strong>Sold by:</strong>
                    {{ orderStore.selectedSalesPerson?.name || 'No Salesperson Assigned' }}
                  </p>
                </div>

                <table class="w-full mb-5 border-collapse">
                  <thead>
                    <tr class="border-b-2 border-gray-300">
                      <th class="text-left py-2 w-5/12">Item</th>
                      <th class="text-center py-2 w-2/12">Qty</th>
                      <th class="text-right py-2 w-1/6">Price</th>
                      <th class="text-right py-2 w-3/12">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <!-- Correctly check if the items array has elements -->
                    <tr v-if="generateInvoice?.items?.length > 0" v-for="(item, index) in generateInvoice.items"
                      :key="index" class="border-b-2 border-gray-300">
                      <td class="py-2 overflow-hidden whitespace-nowrap text-ellipsis" style="max-width: 200px;">
                        {{ item.name }}
                      </td>
                      <td class="py-2 text-center">{{ item.quantity }}</td>
                      <td class="py-2 text-right">${{ item.price }}</td>
                      <td class="py-2 text-right">${{ item.total }}</td>
                    </tr>
                    

                    <!-- Fallback message if no items exist -->
                    <tr v-else>
                      <td colspan="4" class="text-center py-4">No items found in the invoice.</td>
                    </tr>
                  </tbody>
                  <thead>
                    <tr class="border-b-2 border-gray-300">
                      <th class="text-left py-2 w-6/12">Payment Method</th>
                      <th class="text-right py-2 w-1/6"></th>
                      <th class="text-right py-2 w-1/6"></th>
                      <th class="text-right py-2 w-6/12">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(method, index) in selectedPaymentMethods" :key="index" class="border-b-2 border-gray-300">
                      <td class="py-2 text-left">{{ method.name }}:</td>
                      <td class="py-2 text-left"></td>
                      <td class="py-2 text-left"></td>
                      <td class="py-2 text-right">${{ method.amount || '0.00' }}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="3" class="text-right font-semibold">Subtotal:</td>
                      <!-- Correctly binding subtotal -->
                      <td class="text-right">${{ generateInvoice?.subtotal || '0.00' }}</td>
                    </tr>
                    <tr v-if="generateInvoice?.discountAmount > 0">
                      <td colspan="3" class="text-right font-semibold">Discount:</td>
                      <td class="text-right">- ${{ generateInvoice?.discountAmount || '0.00' }}</td>
                    </tr>
                    <tr>
                      <td colspan="3" class="text-right font-semibold">GST:</td>
                      <td class="text-right">${{ generateInvoice?.gst || '0.00' }}</td>
                    </tr>
                    <tr>
                      <td colspan="3" class="text-right font-semibold">PST:</td>
                      <td class="text-right">${{ generateInvoice?.pst || '0.00' }}</td>
                    </tr>
                    <tr class="font-bold">
                      <td colspan="3" class="text-right font-bold">Total:</td>
                      <td class="text-right font-bold">${{ generateInvoice?.totalAmount || '0.00' }}</td>
                    </tr>
                  </tfoot>


                </table>

                <!-- Button to generate PDF -->
                <div class="flex justify-end">
                  <button @click="generatePDF"
                    class="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition">
                    Download PDF
                  </button>
                </div>
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