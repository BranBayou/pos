<script setup>
import OverallDiscount from './OverallDiscount.vue';
import Tax from './Tax.vue';
import TotalPrice from './TotalPrice.vue';

</script>

<template>
    <div class="flex flex-col justify-end" style="min-height: 50%;">
        <OverallDiscount />
        <Tax />
        <TotalPrice />
    </div>
</template>

<style scoped>

</style>