<script setup>
import { useAuthStore } from '@/stores/authStore';
import Select from './Base/Select.vue'
import PassworkField from './Base/PasswordField.vue'
import TextInput from './Base/TextInput.vue'
import qrCode from '/qr-code.svg'
import casherImg from '/cashier.png'

defineEmits(["close-modal"]);

defineProps({
    modalActive: {
        type: Boolean,
        default: false,
    }
})

// Toggle user login
const authStore = useAuthStore();


</script>

<template>
    <Teleport to="body">
        <Transition name="modal-outer">
            <div v-show="modalActive"
                class="absolute w-full bg-black bg-opacity-30 h-screen top-0 left-0 flex justify-center px-8">
                <Transition name="modal-inner">
                    <div v-if="modalActive" class="p-4 bg-white self-start mt-24" style="width: 29%; border-radius: 40px;">
                        <div class="grid grid-cols-3 gap-6 place-items-center">
                            <div class="w-full col-span-3 space-y-3">
                                <div v-if="authStore.isCashierLogin" class="cashier-login flex gap-x-1 my-1">
                                    <Select />
                                    <img
                                      title="Switch to manager login"
                                      :src="qrCode"
                                      alt=""
                                      class="cursor-pointer bg-purple-100 p-2 rounded-2xl"
                                      @click="authStore.toggleLogin"
                                      @mouseover="showTooltip"
                                      @mouseleave="hideTooltip"
                                      @mousemove="moveTooltip"
                                    />
                                  </div>
                                  <div v-else class="manager-login flex gap-x-1 my-1">
                                    <TextInput />
                                    <img
                                      title="Switch to cashier login"
                                      ref="qrLogin"
                                      :src="casherImg"
                                      alt=""
                                      class="cursor-pointer bg-purple-100 p-2 rounded-2xl"
                                      style="width: 44px;"
                                      @click="authStore.toggleLogin"
                                    />
                                  </div>
                                <div class="">
                                    <PassworkField />
                                </div>
                            </div>
                            <button @click="password.length < 6 ? (password = password + i) : ''" v-for="i in 9"
                                :key="i"
                                class="capitalize hover:bg-purple-500 border-2	 border-solid border-1 border-primary text-primary bg-transparent hover:text-white text-[16px] font-semibold leading-[22px] inline-flex items-center justify-center rounded-full w-[50px] h-[50px] [&>span]:inline-flex gap-[6px] transition duration-300 ease-in-out">
                                {{ i }}
                            </button>

                            <button @click="password = password.slice(0, -1)"
                                class="capitalize hover:bg-purple-500 border-solid border-2 border-primary text-primary bg-transparent hover:text-white text-[16px] font-semibold leading-[22px] inline-flex items-center justify-center rounded-full w-[50px] h-[50px] [&>span]:inline-flex gap-[6px] transition duration-300 ease-in-out">
                                <i class="pi pi-delete-left"></i>
                            </button>

                            <button @click="password = password + 0"
                                class="capitalize hover:bg-purple-500 border-solid border-2 border-primary text-primary bg-transparent hover:text-white text-[16px] font-semibold leading-[22px] inline-flex items-center justify-center rounded-full w-[50px] h-[50px] [&>span]:inline-flex gap-[6px] transition duration-300 ease-in-out">
                                0
                            </button>

                            <button @click="login" type="submit"
                                class="capitalize hover:bg-purple-500 border-solid border-2 border-primary text-primary bg-transparent hover:text-white text-[16px] font-semibold leading-[22px] inline-flex items-center justify-center rounded-full w-[50px] h-[50px] [&>span]:inline-flex gap-[6px] transition duration-300 ease-in-out">
                                <i class="pi pi-check"></i>
                            </button>
                        </div>
                        <button @click="$emit('close-modal')"
                            class="mt-8 bg-weather-primary rounded-2xl text-white bg-purple-500 hover:bg-purple-400 hover:text-white py-2 px-6">
                            Close
                        </button>
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