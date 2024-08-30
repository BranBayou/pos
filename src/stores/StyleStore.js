import { defineStore } from 'pinia';
import { computed } from 'vue';

export const useStyleStore = defineStore('styleStore', () => {
    const modalOuterStyle = computed(() => {
        return 'absolute w-full bg-black bg-opacity-30 h-screen top-0 left-0 flex justify-center px-8';
    });

    const modalInnerStyle = computed(() => {
        return 'bg-white rounded-2xl shadow-lg p-6 w-80';
    });

    return {
        modalOuterStyle,
        modalInnerStyle,
    };
});
