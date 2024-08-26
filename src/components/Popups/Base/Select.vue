
<template>
    <div class="card flex justify-center w-full border-2  m-2 rounded-3xl">
        <Select v-model="selectedCity" :options="cities" optionLabel="name" placeholder="Select a City" checkmark :highlightOnSelect="false" class="w-full py-3 md:w-56" />
    </div>
</template>

<script setup>
import { ref } from "vue";

import Select from 'primevue/select';


const selectedCity = ref();
const cities = ref([
    { name: 'New York', code: 'NY' },
    { name: 'Rome', code: 'RM' },
    { name: 'London', code: 'LDN' },
    { name: 'Istanbul', code: 'IST' },
    { name: 'Paris', code: 'PRS' }
]);
</script>