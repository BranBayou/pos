<script setup>
import { ref, computed } from 'vue';
import msgIcon from '/message.svg';
import { useAuthStore } from '@/stores/authStore';
import { useOrderStore } from '@/stores/OrderStore';
import { useToast } from 'vue-toastification';

const authStore = useAuthStore();
const orderStore = useOrderStore();
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
const discountPercentage = ref(props.item.discountPercentage || 0); // Track discount percentage


// Emit event when the comment is submitted
const emit = defineEmits(['close', 'commentSubmitted']);

// Function to save comment to local storage
const saveCommentToLocalStorage = (commentData) => {
  const existingComments = JSON.parse(localStorage.getItem('comments')) || [];
  existingComments.push(commentData);
  localStorage.setItem('comments', JSON.stringify(existingComments));
  console.log('Comment saved to Local Storage:', commentData);
};

// Computed property to dynamically change image background color
const imageBackgroundColor = computed(() => {
  return comment.value.trim() ? 'bg-green-400' : 'bg-red-400';
});

const submitComment = async () => {
  isSubmitting.value = true;

  // Prepare the comment data
  const commentData = {
  item: {
    name: props.item.Name,
    price: props.item.Price,
    imageUrl: props.item.ImageUrl,
    sku: props.item.Sku,
    discountPercentage: discountPercentage.value, // Include discount percentage
  },
  comment: comment.value,
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

// Function to handle cancel and reset the discount
const cancelComment = () => {
  // Call resetDiscount to reset the item's discount percentage
  orderStore.resetDiscount(props.item);

  // Emit close event to close the popup
  emit('close');
};
</script>

<template>
  <Teleport to="body">
      <Transition name="modal-outer">
          <div class="absolute w-full bg-black bg-opacity-30 h-screen top-0 left-0 flex justify-center px-8">
              <Transition name="modal-inner" class="rounded-2xl">
                  <div class="fixed top-10 z-50 flex items-center justify-center bg-black bg-opacity-50 w-10/12">
                      <div class="collapse bg-white rounded-2xl p-6 w-full shadow-lg">
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
                                          <p class="text-sm text-gray-500">Discount: {{ discountPercentage }}%</p>
                                      </div>
                                  </div>
                                  <div class="flex">
                                      <p class="text-sm text-gray-500 mt-2">Approved by: <span class="font-semibold">{{ authStore.managerUser }}</span></p>
                                      <!-- Dynamically set background color of the image -->
                                      <img :src="msgIcon" :class="imageBackgroundColor" class="rounded-md p-1" alt="Comment Icon">
                                  </div>
                              </div>
                          </div>

                          <!-- Comment Textarea -->
                          <div class="collapse-content">
                              <textarea v-model="comment" rows="4" class="w-full border rounded-lg p-2"
                                  placeholder="Enter your comment"></textarea>

                              <!-- Submit and Cancel Buttons -->
                              <div class="mt-4 flex justify-end gap-4">
                                  <button @click="cancelComment"
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
