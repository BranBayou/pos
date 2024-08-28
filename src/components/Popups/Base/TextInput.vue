<script setup>
import InputText from 'primevue/inputtext';
import { ref } from 'vue';

const value = ref(null);
</script>

<template>
    <div class="card flex justify-center w-full">
        <FloatLabel class="border-2 py-3 px-3 w-full rounded-2xl">
            <i class="pi pi-barcode text-purple-500 pr-2"></i>
            <InputText id="username" v-model="value" />
        </FloatLabel>
    </div>
</template>
