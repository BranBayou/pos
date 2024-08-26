<script setup>
import Password from 'primevue/password';
import { ref } from 'vue';

const value = ref(null);
</script>

<template>
    <div class="card flex justify-center items-center gap-2 border-2 rounded-2xl py-3 px-3">
        <i class="pi pi-lock"></i>
        <Password v-model="value" :feedback="false" placeholder="******" class=" w-full mx-auto" />
    </div>
</template>
