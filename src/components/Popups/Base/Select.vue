<script setup>
import Select from 'primevue/select';
import { ref } from "vue";

const selectedCity = ref();
const cities = ref([
    { name: 'Homer Simpson', code: 'NY' },
    { name: 'Marge Simpson', code: 'RM' },
    { name: 'Bart Simpson', code: 'LDN' },
    { name: 'Lisa Simpson', code: 'IST' },
    { name: 'Maggie Simpson', code: 'PRS' }
]);
</script>

<template>
    <div class="card flex justify-center border-2 rounded-2xl w-full px-3">
        <Select v-model="selectedCity" :options="cities" optionLabel="name" placeholder="Cashier Login" checkmark :highlightOnSelect="false" class="w-full py-3" />
    </div>
</template>
