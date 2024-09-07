<script setup>
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();


</script>

<template>
    <Teleport to="body">
      <Transition name="modal-outer">
        <div class="absolute w-full bg-black bg-opacity-30 h-screen top-0 left-0 flex justify-center px-8">
          <Transition name="modal-inner" class="rounded-2xl">
            <div class="fixed top-44 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div class="bg-white rounded-2xl shadow-lg p-6 w-80">
                <h3 class="text-lg font-semibold mb-4">Manager is required to approve this Discount</h3>
                <button 
                    class="bg-purple-500 text-white px-4 py-2 hover:bg-purple-700 rounded-xl"
                    @click="confirmLogout"
                >
                Manager Override
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
</template>

<style scoped>

</style>