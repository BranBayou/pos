<script setup>
import { useAuthStore } from '@/stores/authStore';
import { useOrderStore } from '@/stores/OrderStore';
import { ref } from 'vue';
//import AddComment from '../Left/AddCommentButton.vue';
import AddManagerApproval from '../Left/AddManagerApprovalButton.vue';
import WalkInCustomer from '../Left/WalkInCustomerButton.vue';

const authStore = useAuthStore();
const orderStore = useOrderStore();

//const isAddCommentButtonMovedFromAddBeaviour = ref(false);
const isAddManagerApprovalButtonMovedFromAddBeaviour = ref(false);
const isWalkinCustomerMovedFromAddBeaviour = ref(false);

const emit = defineEmits(['moveButtonToParent']);

// const buttons = ref([
//   { name: 'AddComment', component: AddComment },
//   { name: 'AddManagerApproval', component: AddManagerApproval },
//   { name: 'WalkInCustomer', component: WalkInCustomer },
// ]);

function moveButtonToParent(buttonName) {
  emit('moveButtonToParent', buttonName);
  
  // Remove the button from the child component's buttons array
  buttons.value = buttons.value.filter(button => button.name !== buttonName);
}

// function handleClickAddComment() {
//   authStore.toggleAddCommentButtonMoved();
//   isAddCommentButtonMovedFromAddBeaviour.value = true;
// }

function handleClickAddManager () {
  authStore.toggleAddManagerApprovalButtonMoved();
  isAddManagerApprovalButtonMovedFromAddBeaviour.value = true;
}

function handleClickWalkinCustomer () {
  authStore.toggleWalkInCustomerButtonMoved();
  isWalkinCustomerMovedFromAddBeaviour.value = true;
}

</script>

<template>
  <Teleport to="body">
    <Transition name="modal-outer">
      <div 
        v-show="authStore.isAddBehaviourPopup"
        @click.self="authStore.toggleAddBehaviourPopup"
        class="absolute w-full bg-black bg-opacity-30 h-screen top-0 left-0 flex justify-center px-8"
        style="z-index: 2;"
      >
        <Transition name="modal-inner" class="rounded-2xl">
          <div v-if="authStore.isAddBehaviourPopup" class="fixed top-10 z-50 flex items-center justify-center bg-black bg-opacity-50 w-10/12">
            <div class="bg-white rounded-2xl shadow-lg p-6 w-full">
              <i @click.self="authStore.toggleAddBehaviourPopup" class="pi pi-times-circle w-full text-right absolute top-4 right-4 cursor-pointer" style="font-size: 24px;"></i>
              <h1 class="font-semibold text-[24px]">Add Behaviour</h1>
              <div class="bg-[#f4f5f7] rounded-2xl p-3 flex gap-3">
                <!--
                <AddComment 
                 v-if="!isAddCommentButtonMovedFromAddBeaviour"
                 @click="handleClickAddComment"
                />
                -->
                <AddManagerApproval 
                  v-if="!isAddManagerApprovalButtonMovedFromAddBeaviour"
                  @click="handleClickAddManager"
                />
                <WalkInCustomer 
                  v-if="!isWalkinCustomerMovedFromAddBeaviour && orderStore.state.customer.name === ''"
                  @click="handleClickWalkinCustomer"
                />
                <div v-if="isAddCommentButtonMovedFromAddBeaviour && isAddManagerApprovalButtonMovedFromAddBeaviour && isWalkinCustomerMovedFromAddBeaviour">
                  <p class="text-center text-gray-500 w-full">No more behaviour</p>
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

</style>