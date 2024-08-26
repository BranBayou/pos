
<template>
    <div class="card flex justify-center">
        <Password v-model="value" :feedback="false" placeholder="******" class="border-2 py-3 px-2 rounded-3xl w-full mx-2" />
    </div>
</template>

<script setup>
import Password from 'primevue/password';
import { ref } from 'vue';

const value = ref(null);
</script>
