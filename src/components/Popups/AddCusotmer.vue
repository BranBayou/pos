<script setup>
import { useAuthStore } from '@/stores/authStore';
import { ref, computed, onMounted } from 'vue';
import InputMask from 'primevue/inputmask';

// Define the emit function

const authStore = useAuthStore();

const value = ref('');
const mask = ref('999-999-9999');

// State to hold the selected customer and search query
const selectedCustomer = ref(null);
const searchQuery = ref(''); // Search query

// New customer form fields
const newCustomer = ref({
  name: '',
  phone: '',
  email: '',
  note: ''
});

// Function to emit the selected customer to the parent
const selectCustomer = (customer) => {
  selectedCustomer.value = customer; // Store the selected customer
  emit('customer-selected', customer); // Emit the customer details to the parent
};

onMounted(() => {
  authStore.fetchCustomers();
});

// Computed property to filter the customers list based on the search query
const filteredCustomers = computed(() => {
  if (!searchQuery.value) {
    return authStore.customersList.slice(0, 3); // If no search query, show first three customers
  }
  return authStore.customersList
    .filter(customer => 
      customer.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
      customer.phone.includes(searchQuery.value) || 
      customer.email.toLowerCase().includes(searchQuery.value.toLowerCase()))
    .slice(0, 3);
});

// Function to add a new customer
const addNewCustomer = () => {
  if (newCustomer.value.name && newCustomer.value.phone && newCustomer.value.email) {
    authStore.customersList.push({ ...newCustomer.value });
    resetForm();
  } else {
    alert('Please fill in all fields');
  }
};

// Function to reset the form fields after submission
const resetForm = () => {
  newCustomer.value = {
    name: '',
    phone: '',
    email: '',
    note: ''
  };
};
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-outer">
      <div v-show="authStore.isAddCustomerPopupVisible" @click="authStore.toggleAddCustomerPopup"
        class="absolute w-full bg-black bg-opacity-30 h-screen top-0 left-0 flex justify-center px-8">
        <Transition name="modal-inner">
          <!-- Prevent popup from closing when clicking inside -->
          <div v-if="authStore.isAddCustomerPopupVisible" @click.stop
            class="flex p-4 my-10 w-10/12 bg-white self-start rounded-2xl">
            <div class="p-8 flex gap-3 w-full">

              <div class="w-6/12">
                <!-- Search Input -->
                <div class="mb-4 mr-20">
                  <input type="text" v-model="searchQuery" placeholder="Search customers by name, phone or email..."
                    class="p-3 border w-full rounded-2xl" />
                </div>

                <!-- Display filtered customers (at most three) -->
                <div class="flex items-center gap-2 py-9">
                  <div>
                    <ul class="flex flex-col gap-3">
                      <li v-for="customer in filteredCustomers" :key="customer.name"
                        class="flex items-center justify-between py-3 px-4 border-2 rounded-2xl cursor-pointer"
                        @click="selectCustomer(customer)">
                        <div>
                          <p>{{ customer.name }}</p>
                          <p class="flex gap-4">{{ customer.phone }}
                            <span>
                              {{ customer.email }}
                            </span>
                          </p>
                        </div>
                        <i class="pi pi-arrow-circle-right bg-purple-200 rounded-full p-2 cursor-pointer"
                          style="font-size: 24px;"></i>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- Form to Add New Customer -->
              <div class="mt-6 w-6/12">
                <h3 class="text-xl font-bold mb-4">Add New Customer</h3>
                <form @submit.prevent="addNewCustomer">
                  <div class="mb-4">
                    <label class="block mb-1">Name</label>
                    <input type="text" v-model="newCustomer.name" class="w-full bg-gray-100 p-2 rounded focus:outline-none"
                      placeholder="Customer Name" />
                  </div>
                  <div class="card flex justify-center">
                    <label class="block mb-1">Phone</label>
                    <InputMask v-model="newCustomer.phone" mask="+19 999-999-999" placeholder="+19 999-999-999" class="w-full !p-2 !bg-gray-100 !rounded custom-input" />
                  </div>
                  <div class="mb-4">
                    <label class="block mb-1">Email</label>
                    <input type="email" v-model="newCustomer.email" class="w-full bg-gray-100 p-2 rounded focus:outline-none"
                      placeholder="Customer Email" />
                  </div>
                  <div class="mb-4">
                    <label class="block mb-1">Note</label>
                    <textarea v-model="newCustomer.note" class="w-full bg-gray-100 p-2 rounded focus:outline-none"
                      placeholder="Notes"></textarea>
                  </div>
                  <div class="w-full flex justify-end">
                    <i class="pi pi-arrow-circle-right bg-purple-200 rounded-full p-2 cursor-pointer"
                      style="font-size: 24px;"></i>
                  </div>
                </form>
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

  .custom-input::placeholder {
    color: gray;
  }
</style>
