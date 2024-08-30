<script setup>
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();

</script>

<template>
    <Teleport to="body">
      <Transition name="modal-outer">
        <div 
         v-show="authStore.isAddItemPopup"
         @click.self="authStore.toggleAddItemPopup"
         class="absolute w-full bg-black bg-opacity-30 h-screen top-0 left-0 flex justify-center px-8"
        >
          <Transition name="modal-inner" class="rounded-2xl">
            <div v-if="authStore.isAddItemPopup" class="fixed top-44 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div class="bg-white rounded-2xl shadow-lg p-6 w-80">
                    <input 
                        type="text" name="Search product" id="" class="bg-gray-100 border-0 outline-none p-2 rounded-lg w-full"
                        placeholder="Type Search phrase or sku"
                    >
                </div> 
            </div>        
          </Transition>
        </div>
      </Transition>
    </Teleport>
</template>

<style scoped>

</style>