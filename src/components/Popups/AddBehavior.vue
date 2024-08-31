<script setup>
import { useAuthStore } from '@/stores/authStore';
import { ref, defineEmits } from 'vue';
import AddComment from '../Left/AddCommentButton.vue';
import AddManagerApproval from '../Left/AddManagerApprovalButton.vue';
import WalkInCustomer from '../Left/WalkInCustomerButton.vue';

const authStore = useAuthStore();

const emit = defineEmits(['moveButtonToParent']);

const buttons = ref([
  { name: 'AddComment', component: AddComment },
  { name: 'AddManagerApproval', component: AddManagerApproval },
  { name: 'WalkInCustomer', component: WalkInCustomer },
]);

function moveButtonToParent(buttonName) {
  emit('moveButtonToParent', buttonName);
}

</script>

<template>
    <Teleport to="body">
      <Transition name="modal-outer">
        <div 
         v-show="authStore.isAddBehaviourPopup"
         @click.self="authStore.toggleAddBehaviourPopup"
         class="absolute w-full bg-black bg-opacity-30 h-screen top-0 left-0 flex justify-center px-8"
        >
          <Transition name="modal-inner" class="rounded-2xl">
            <div v-if="authStore.isAddBehaviourPopup" class="fixed top-10 z-50 flex items-center justify-center bg-black bg-opacity-50 w-10/12">
                <div class="bg-white rounded-2xl shadow-lg p-6 w-full">
                    <div v-for="button in buttons" :key="button.name">
                      <component :is="button.component" @click="moveButtonToParent(button.name)" />
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

</style>