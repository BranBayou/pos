<script setup>
import { useAuthStore } from '@/stores/authStore';
import Select from 'primevue/select';
import Password from 'primevue/password';
import InputText from 'primevue/inputtext';
import qrCode from '/qr-code.svg';
import casherImg from '/cashier.png';
import { ref } from 'vue';
import { useToast } from 'vue-toastification';
import axios from 'axios';

const toast = useToast();
const emit = defineEmits(["close-modal"]);

defineProps({
    modalActive: {
        type: Boolean,
        default: false,
    }
});

// Toggle user login
const authStore = useAuthStore();

const userListRef = ref();
const usersList = ref([
    { name: 'Homer-Simpson', role: 'Cashier' },
    { name: 'Marge-Simpson', role: 'Cashier' },
    { name: 'Bart-Simpson', role: 'Cashier' },
    { name: 'Lisa-Simpson', role: 'Cashier' },
    { name: 'Maggie-Simpson', role: 'Cashier' }
]);

const username = ref('');
const password = ref('');
const storeId = ref(''); // Add this if you need to send store ID in headers

const login = async () => {
  try {
    // Check if the user is logging in as a cashier or manager
    const selectedUser = authStore.isCashierLogin ? userListRef.value : null;
    const usernameValue = selectedUser ? selectedUser.name : username.value; // Extract the username for cashier, use the input value for manager
    const passwordValue = password.value; // Assuming password is a ref

    console.log('Username:', usernameValue);
    console.log('Password:', passwordValue);

    if (!usernameValue || !passwordValue) {
      console.error('Username or password is missing');
      return;
    }

    const response = await axios.post('http://localhost:3131/login', {
      username: usernameValue,
      password: passwordValue
    }, {
      headers: {
        'store-id': storeId.value // Add store ID header if needed
      }
    });

    // Handle successful login
    const { token } = response.data;
    localStorage.setItem('token', token); // Store token in local storage

    authStore.login(usernameValue); // Pass the username to the login function

    toast.success(`Welcome back ${usernameValue}`);
    // Close the modal after successful login
    emit('close-modal');

  } catch (error) {
    // Handle error
    toast.error('Login failed!');
    console.error('Login failed:', error.response?.data?.error || error.message);
  }
};

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
                                    <div class="card flex justify-center border-2 rounded-2xl w-full px-3">
                                        <Select v-model="userListRef" :options="usersList" optionLabel="name" placeholder="Cashier Login" checkmark :highlightOnSelect="false" class="w-full py-3" />
                                    </div>
                                    <img
                                      title="Switch to manager login"
                                      :src="qrCode"
                                      alt=""
                                      class="cursor-pointer bg-purple-100 p-2 rounded-2xl"
                                      @click="authStore.toggleLogin"
                                    />
                                  </div>
                                <div v-else class="manager-login flex gap-x-1 my-1">
                                    <div class="card flex justify-center w-full">
                                        <FloatLabel class="border-2 py-3 px-3 w-full rounded-2xl">
                                            <i class="pi pi-barcode text-purple-500 pr-2"></i>
                                            <InputText id="username" v-model="username" />
                                        </FloatLabel>
                                    </div>
                                    <img
                                        title="Switch to cashier login"
                                        :src="casherImg"
                                        alt=""
                                        class="cursor-pointer bg-purple-100 p-2 rounded-2xl"
                                        style="width: 44px;"
                                        @click="authStore.toggleLogin"
                                    />
                                </div>
                                <div class="">
                                    <div class="card flex justify-center items-center gap-2 border-2 rounded-2xl py-3 px-3">
                                    <i class="pi pi-lock"></i>
                                    <Password v-model="password" :feedback="false" placeholder="******" class=" w-full mx-auto" />
                                </div>
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