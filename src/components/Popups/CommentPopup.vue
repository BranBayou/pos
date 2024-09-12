<script setup>
import msgIcon from '/message.svg'
import { ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from 'vue-toastification';

const authStore = useAuthStore();
const toast = useToast();

const comment = ref('');
const isSubmitting = ref(false);

// Props to accept the item information
const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

// Emit event when the comment is submitted
const emit = defineEmits(['close', 'commentSubmitted']);

// Function to save comment to local storage
const saveCommentToLocalStorage = (commentData) => {
  const existingComments = JSON.parse(localStorage.getItem('comments')) || [];
  existingComments.push(commentData);
  localStorage.setItem('comments', JSON.stringify(existingComments));
  console.log('Comment saved to Local Storage:', commentData);
};

const submitComment = async () => {
  isSubmitting.value = true;

  // Prepare the comment data
  const commentData = {
    item: {
      name: props.item.Name,
      price: props.item.Price,
      imageUrl: props.item.ImageUrl,
      sku: props.item.Sku,
    },
    comment: comment.value, // This can be empty now
    timestamp: new Date().toISOString(),
    manager: authStore.managerUser,
  };

  // Simulate saving (can be replaced with actual API call)
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Save the comment data to local storage
  saveCommentToLocalStorage(commentData);

  // Emit the comment data and close the modal
  emit('commentSubmitted', commentData);
  emit('close');

  isSubmitting.value = false;
  toast.success('Comment submitted successfully!');
};
</script>

<template>
    <Teleport to="body">
        <Transition name="modal-outer">
            <div class="absolute w-full bg-black bg-opacity-30 h-screen top-0 left-0 flex justify-center px-8">
                <Transition name="modal-inner" class="rounded-2xl">
                    <div class="fixed top-10 z-50 flex items-center justify-center bg-black bg-opacity-50 w-10/12">
                        <div class="collapse bg-white rounded-lg p-6 w-full shadow-lg">
                            <input type="checkbox" checked="checked" />
                            <!-- Item Info -->
                            <div class="collapse-title gap-4 mb-4">
                                <h3 class="text-lg font-semibold mb-4">Manager Approval Comment</h3>
                                <div class="flex justify-between">
                                    <div class="flex">
                                        <img :src="`https://replicagunsca.b-cdn.net/images/products/small/${props.item.ImageUrl}`"
                                            class="w-14 rounded-lg" alt="product-img" />
                                        <div>
                                            <p class="font-semibold">{{ props.item.Name }}</p>
                                            <p class="text-sm text-gray-500">Price: ${{ props.item.Price }}</p>
                                        </div>
                                    </div>
                                    <div class="flex">
                                        <p class="text-sm text-gray-500 mt-2">Comment by: <span class="font-semibold">{{ authStore.managerUser }}</span></p>
                                        <img class="bg-green-500 rounded-md" :src="msgIcon" alt="">
                                    </div>
                                </div>
                            </div>

                            <!-- Comment Textarea -->
                            <div class="collapse-content">
                                <textarea v-model="comment" rows="4" class="w-full border rounded-lg p-2"
                                    placeholder="Enter your comment"></textarea>

                                <!-- Submit Button -->
                                <div class="mt-4 flex justify-end gap-4">
                                    <button @click="emit('close')"
                                        class="px-4 py-2 bg-gray-300 rounded-lg">Cancel</button>
                                    <button @click="submitComment" :disabled="isSubmitting"
                                        class="px-4 py-2 bg-purple-600 text-white rounded-lg">
                                        {{ isSubmitting ? 'Submitting...' : 'Submit' }}
                                    </button>
                                </div>
                            </div>
                        </div>
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
