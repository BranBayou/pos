<script setup>
const emit = defineEmits(['walkInCustomer']);

const handleWalkInCustomer = () => {
  emit('walkInCustomer');
};
</script>

<template>
    <div>
        <button
         @click="handleWalkInCustomer" 
         class="border shadow-lg text-center p-5 rounded-2xl flex gap-5 my-3 w-full">
            <span class="flex items-center gap-10 text-center cursor-pointer">
                <i class="pi pi-user text-purple-500 bg-purple-100 p-4 rounded-full" style="font-size: 1.875rem;"></i> Walk In Customer
            </span>
        </button>
    </div>
</template>

<style scoped>

</style>