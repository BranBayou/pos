import { ref, reactive, onMounted } from 'vue';
import { defineStore } from 'pinia';
import { useToast } from 'vue-toastification';

const toast = useToast();

export const useCustomerStore = defineStore('customers', () => {
  // Reactive customer list
  const customersList = reactive([
    {
      name: "John Doe",
      phone: "+1 123-456-7890",
      email: "john.doe@example.com",
      note: "Regular customer, prefers email communication."
    },
    {
      name: "Jane Smith",
      phone: "+1 987-654-3210",
      email: "jane.smith@example.com",
      note: "VIP customer, likes phone calls."
    },
    {
      name: "Michael Johnson",
      phone: "+1 555-123-4567",
      email: "michael.johnson@example.com",
      note: "New customer, prefers text messages."
    },
    {
      name: "Emily Davis",
      phone: "+1 111-222-3333",
      email: "emily.davis@example.com",
      note: "Loyal customer, always orders large quantities."
    },
    {
      name: "Chris Brown",
      phone: "+1 444-555-6666",
      email: "chris.brown@example.com",
      note: "Occasional customer, responds to promotions."
    }
  ]);

  // Simulate fetching customers
  function fetchCustomers() {
  }

  return {
    customersList,
    fetchCustomers,
  };
});
