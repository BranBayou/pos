<script setup>
import { ref, onMounted } from 'vue';
import msgIcon from '/message.svg';
import { useAuthStore } from '@/stores/authStore';
import { useOrderStore } from '@/stores/OrderStore';

const authStore = useAuthStore();
const orderStore = useOrderStore();

const comments = ref([]);
const isEditing = ref({}); // Track which comment is being edited
const newComments = ref([]); // Track new comment inputs per comment

// Function to load comments from local storage
const loadCommentsFromLocalStorage = () => {
  comments.value = JSON.parse(localStorage.getItem('comments')) || [];
  // Initialize newComments for each comment
  comments.value.forEach(() => newComments.value.push(''));
};

// Function to save updated comments to local storage
const saveCommentsToLocalStorage = () => {
  localStorage.setItem('comments', JSON.stringify(comments.value));
};

// Function to handle comment editing
const handleEdit = (index) => {
  isEditing.value[index] = true;
  newComments.value[index] = comments.value[index].comment || ''; // Initialize new comment value
};

// Function to save the new comment and update order items
const saveNewComment = (index) => {
  const currentComment = newComments.value[index];

  if (!currentComment.trim()) {
    return; // Prevent saving an empty comment
  }

  const commentItem = comments.value[index].item; // Fetch the item linked to the comment

  if (!commentItem) {
    console.error('Item is missing.');
    return;
  }

  // Ensure OriginalPrice is set before calculating the new price
  if (!commentItem.OriginalPrice) {
    commentItem.OriginalPrice = commentItem.price; // Set OriginalPrice if missing
  }

  // Apply the discount to the order item in the store
  const orderItem = orderStore.state.orderItems.find(
    (item) => item.Sku === commentItem.sku // Match orderItem with comment item based on SKU
  );

  if (orderItem) {
    // Update the discount and price in the orderItem
    orderStore.updateDiscountPercentage(orderItem, commentItem.discountPercentage);
  } else {
    console.error('Order item not found in the store.');
    return;
  }

  // Update the comment in the comments array
  comments.value[index].comment = currentComment;
  comments.value[index].item.discountPercentage = commentItem.discountPercentage;

  // Save the updated comments to local storage
  saveCommentsToLocalStorage();

  // Exit edit mode for the current comment
  isEditing.value[index] = false;
};


// Function to cancel editing
const cancelEdit = (index) => {
  isEditing.value[index] = false;
};

// Fetch the comments when the component is mounted
onMounted(() => {
  loadCommentsFromLocalStorage();
});

const emit = defineEmits(['close']);
</script>



<template>
  <Teleport to="body">
    <Transition name="modal-outer">
      <div class="absolute w-full bg-black bg-opacity-30 h-screen top-0 left-0 flex justify-center px-8">
        <Transition name="modal-inner" class="rounded-2xl">
          <div class="fixed top-10 z-50 flex items-center justify-center bg-black bg-opacity-50 w-10/12">
            <div class="bg-white rounded-2xl p-6 w-full shadow-lg">
              <h3 class="text-lg font-semibold mb-4">Saved Comments</h3>
              
              <div v-if="comments.length === 0" class="text-center text-gray-500">
                No comments available.
              </div>
              
              <div v-for="(comment, index) in comments" :key="index" class="mb-4 pb-4 bg-[#f4f5f7] p-3 rounded-md">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex">
                    <img :src="`https://replicagunsca.b-cdn.net/images/products/small/${comment.item.imageUrl}`"
                      class="w-14 rounded-lg" alt="product-img" />
                    <div class="ml-4">
                      <p class="font-semibold">Approved {{ comment.item.discountPercentage }}% discount on {{ comment.item.name }}</p>
                      <p class="text-sm text-gray-500">Price: ${{ comment.item.price }}</p>
                      <p class="text-sm text-gray-500">SKU: {{ comment.item.sku }}</p>
                    </div>
                  </div>
                  <div class="text-right flex gap-3">
                    <div class="">
                      <p class="text-sm text-gray-500">Approved by: <span class="font-semibold">{{ comment.manager }}</span></p>
                      <p class="text-sm text-gray-500">{{ new Date(comment.timestamp).toLocaleString() }}</p>
                    </div>
                    <img :src="msgIcon" :class="comment.comment ? 'bg-green-400' : 'bg-red-400'" class="rounded-md p-1" alt="Comment Icon">
                  </div>
                </div>

                <!-- Display editable textarea if the comment is empty or being edited -->
                <div v-if="isEditing[index] || !comment.comment" class="mt-2">
                  <textarea
                    v-model="newComments[index]"
                    rows="2"
                    class="w-full border rounded-lg p-2"
                    placeholder="Enter your comment"
                  ></textarea>
                  <div class="mt-2 flex justify-end gap-2">
                    <button @click="saveNewComment(index)" class="px-4 py-2 bg-purple-600 text-white rounded-lg">Save</button>
                    <button @click="cancelEdit(index)" class="px-4 py-2 bg-gray-300 rounded-lg">Cancel</button>
                  </div>
                </div>

                <!-- Display comment if it exists and is not being edited -->
                <div v-else class="text-sm">
                  <p>Reason: {{ comment.comment }}</p>
                </div>
              </div>

              <!-- Close Button -->
              <div class="mt-4 flex justify-end">
                <button @click="emit('close')" class="px-4 py-2 bg-purple-600 text-white rounded-lg">Close</button>
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
