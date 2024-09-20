<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore'; // Now using the combined store
import { useToast } from 'vue-toastification';
import Select from 'primevue/select';
import Password from 'primevue/password';
import InputText from 'primevue/inputtext';
import casherImg from '/cashier.png';
import qrCode from '/qr-code.svg';

const authStore = useAuthStore(); // For login, fetching users, toggling, and state management
const selectedUser = ref(null);
const username = ref('');
const password = ref('');

const toast = useToast();
const emit = defineEmits(["close-modal"]);

defineProps({
  modalActive: {
    type: Boolean,
    default: false,
  }
});

onMounted(() => {
  // If the user is already logged in, no need to call the login API
  if (authStore.token && authStore.currentUser) {
    console.log('User session restored:', authStore.currentUser);
  } else {
    // Fetch users if not logged in
    authStore.fetchCashiers();
  }
});

const login = async () => {
  const usernameValue = authStore.isCashierLoginInput ? selectedUser.value?.username : username.value;
  const passwordValue = password.value;

  if (!usernameValue || !passwordValue) {
    toast.error('Wrong username or password');
    console.error('Username or password is missing');
    return;
  }

  try {
    await authStore.login(usernameValue, passwordValue, authStore.storeId);
    emit('close-modal');
    username.value = '';
    password.value = '';
  } catch (error) {
    console.error('Login failed:', error);
  }
};

// Handle password input to prevent more than 6 characters and auto-login
const handlePasswordInput = (num) => {
  if (password.value.length < 6) {
    password.value += num;
  }
  if (password.value.length === 6) {
    login();
  }
};

</script>

<template>
  <Teleport to="body">
    <Transition name="modal-outer">
      <div v-show="modalActive" class="absolute w-full bg-black bg-opacity-30 h-screen top-0 left-0 flex justify-center px-8">
        <Transition name="modal-inner">
          <div v-if="modalActive" class="p-4 bg-white self-start mt-24" style="width: 29%; border-radius: 40px;">
            <div class="grid grid-cols-3 gap-6 place-items-center">
              <div class="w-full col-span-3 space-y-3">
                <div v-if="authStore.isCashierLoginInput" class="cashier-login flex gap-x-1 my-1">
                  <div class="card flex justify-center border-2 rounded-2xl w-full px-3">
                    <Select v-model="selectedUser" :options="authStore.usersList" optionLabel="username" placeholder="Cashier Login" checkmark :highlightOnSelect="false" class="w-full py-3" />
                  </div>
                  <img
                    title="Switch to barcode login"
                    :src="qrCode"
                    alt=""
                    class="cursor-pointer bg-purple-100 p-2 rounded-2xl"
                    @click="authStore.toggleLoginInput"
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
                    @click="authStore.toggleLoginInput"
                  />
                </div>
                <div class="">
                  <div class="flex justify-center items-center gap-2 border-2 rounded-2xl py-3 px-3">
                    <i class="pi pi-lock"></i>
                    <Password v-model="password" :feedback="false" placeholder="******" class=" w-full mx-auto" />
                  </div>
                </div>
              </div>
              <!-- Number buttons for entering password -->
              <button @click="handlePasswordInput(i)" v-for="i in 9" :key="i"
                      class="capitalize hover:bg-purple-500 border-2 border-solid border-1 bg-transparent hover:text-white text-[16px] font-semibold leading-[22px] inline-flex items-center justify-center rounded-full w-[50px] h-[50px] [&>span]:inline-flex gap-[6px] transition duration-300 ease-in-out">
                {{ i }}
              </button>
              <button @click="password = password.slice(0, -1)"
                      class="capitalize hover:bg-purple-500 border-solid border-2 bg-transparent hover:text-white text-[16px] font-semibold leading-[22px] inline-flex items-center justify-center rounded-full w-[50px] h-[50px] [&>span]:inline-flex gap-[6px] transition duration-300 ease-in-out">
                <i class="pi pi-delete-left"></i>
              </button>
              <button @click="handlePasswordInput(0)"
                      class="capitalize hover:bg-purple-500 border-solid border-2 bg-transparent hover:text-white text-[16px] font-semibold leading-[22px] inline-flex items-center justify-center rounded-full w-[50px] h-[50px] [&>span]:inline-flex gap-[6px] transition duration-300 ease-in-out">
                0
              </button>
              <button @click="login" type="submit"
                      class="capitalize hover:bg-purple-500 border-solid border-2 bg-transparent hover:text-white text-[16px] font-semibold leading-[22px] inline-flex items-center justify-center rounded-full w-[50px] h-[50px] [&>span]:inline-flex gap-[6px] transition duration-300 ease-in-out">
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
