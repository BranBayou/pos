<script setup>
import { ref } from 'vue';
import { useToast } from 'vue-toastification';
import { salesPersons } from '../../sales';
import Select from 'primevue/select';
import { useAuthStore } from '@/stores/authStore';
import { useOrderStore } from '@/stores/OrderStore';

const authStore = useAuthStore();
const orderStore = useOrderStore();

</script>

<template>
    <Teleport to="body">
        <Transition name="modal-outer">
            <div 
                class="absolute w-full bg-black bg-opacity-30 h-screen top-0 left-0 flex justify-center px-8">
                <Transition name="modal-inner">
                    <!-- Prevent popup from closing when clicking inside -->
                    <div>
                        <div class="p-8 w-6/12">
                            <div class="w-full space-y-3">
                                <div class="flex gap-x-1 my-1">
                                    <div class="card flex justify-center border-2 rounded-2xl w-full px-3">
                                        <!-- Bind the selectedSalesPerson to the Select component -->
                                        <Select v-model="orderStore.selectedSalesPerson" :options="salesPersons" optionLabel="name"
                                            placeholder="Select Sales Person" class="w-full py-3" />
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center gap-2 py-9">
                                <i class="pi pi-user rounded-full bg-purple-200 p-3"></i>
                                <div class="">
                                    <p>{{ orderStore.selectedSalesPerson ? orderStore.selectedSalesPerson.name : 'No Salesperson Selected' }}</p>
                                    <p>{{ orderStore.selectedSalesPerson ? orderStore.selectedSalesPerson.region : '' }}</p>
                                </div>
                            </div>
                            <!-- Checkbox for applying salesperson to all items -->
                            <div class="flex items-center gap-2">
                                <div class="form-control">
                                    <label class="label cursor-pointer">
                                        <input type="checkbox" class="" />
                                    </label>
                                </div>
                                <span class="label-text">Apply to all items</span>
                            </div>
                        </div>
                        <div class="mt-4 w-6/12 flex flex-col justify-between items-center">
                            <h1 class="py-4 text-2xl font-semibold">Select Sales Person</h1>
                            <button 
                              class="mb-5 bg-purple-200 rounded-2xl py-2 px-4 flex items-center gap-2"
                            >
                                <i class="pi pi-arrow-circle-right"></i>
                                <span>Add Sales Person</span>
                            </button>
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
</style>
