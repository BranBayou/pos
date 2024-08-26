<script setup>
import Password from 'primevue/password';
import { ref } from 'vue';

const value = ref(null);
</script>

<template>
    <div class="card flex justify-center">
        <Password v-model="value" :feedback="false" placeholder="******" class="border-2 py-3 px-3 rounded-2xl w-full mx-auto" />
    </div>
</template>
