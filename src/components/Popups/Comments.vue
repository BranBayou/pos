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

// Function to load comments from the store
const loadCommentsFromStore = () => {
  // Load comments from orderStore's state
  comments.value = orderStore.state.comments.map(comment => ({
    ...comment,
    comment: comment.text || '', // Initialize the comment text
    discountPercentage: comment.item.discount || 0 // Track the discount percentage
  }));

  // Initialize isEditing and newComments arrays for editing
  comments.value.forEach((_, index) => {
    isEditing.value[index] = false;
    newComments.value[index] = comments.value[index].comment || '';
  });
};

// Function to save updated comments to the store and apply any related discount logic
const saveCommentsToStore = () => {
  comments.value.forEach((comment, index) => {
    const orderItem = orderStore.state.orderItems.find(item => item.Sku === comment.item.sku);

    if (orderItem) {
      // Save the edited comment and apply the discount if necessary
      orderStore.submitCommentToStore(newComments.value[index], authStore.userId, orderItem);
    }
  });

  // Save the updated state to local storage
  orderStore.saveOrderItemsToLocalStorage();
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

  // Apply the discount to the order item in the store
  const orderItem = orderStore.state.orderItems.find(
    (item) => item.Sku === commentItem.sku
  );

  if (orderItem) {
    // Apply the discount from the comment to the order item
    orderItem.Discount = commentItem.discount || 0;

    // Recalculate the price based on the discount
    orderItem.Price = (orderItem.OriginalPrice * (1 - orderItem.Discount / 100)).toFixed(2);

    // Update the `comment.comment` to reflect the saved comment
    comments.value[index].comment = currentComment;  // Update the displayed comment immediately

    // Save the comment to the store
    orderStore.submitCommentToStore(currentComment, authStore.userId, orderItem);
  } else {
    console.error('Order item not found in the store.');
    return;
  }

  isEditing.value[index] = false;
  saveCommentsToStore();
};



// Handle cancel editing
const cancelEdit = (index) => {
  isEditing.value[index] = false;
};

// Handle deleting a comment
const deleteComment = (index) => {
  comments.value.splice(index, 1);
  // Save the updated comments to the store and local storage
  saveCommentsToStore();
};

// Fetch the comments when the component is mounted
onMounted(() => {
  loadCommentsFromStore();
});

const emit = defineEmits(['close']);
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-outer">
      <div class="absolute w-full bg-black bg-opacity-30 h-screen top-0 left-0 flex justify-center px-8">
        <Transition name="modal-inner" class="rounded-2xl">
          <div
            class="fixed top-10 z-50 flex items-center justify-center bg-black bg-opacity-50 w-10/12 max-h-full overflow-y-auto">
            <div class="bg-white rounded-2xl p-6 w-full shadow-lg">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold mb-4">Saved Comments</h3>
                <div class="flex justify-end">
                  <button @click="emit('close')" class="px-4 py-2 bg-gray-200 text-black rounded-lg"><i class="pi pi-times"></i></button>
                </div>
              </div>

              <div v-if="comments.length === 0" class="text-center text-gray-500">
                No comments available.
              </div>

              <div v-for="(comment, index) in comments" :key="index" class="mb-4 pb-4 bg-[#f4f5f7] p-3 rounded-md">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex">
                    <img :src="`https://replicagunsca.b-cdn.net/images/products/small/${comment.item.imageUrl}`"
                      class="w-14 rounded-lg" alt="product-img" />
                    <div class="ml-4">
                      <p class="font-semibold">Approved {{ comment.item.discount }}% discount on {{ comment.item.name }}
                      </p>
                      <p class="text-sm text-gray-500">Price: ${{ comment.item.price }}</p>
                    </div>
                  </div>
                  <div class="text-right flex gap-3">
                    <div class="">
                      <p class="text-sm text-gray-500">Approved by: <span class="font-semibold">{{ authStore.managerUser
                          }}</span></p>
                      <p class="text-sm text-gray-500">{{ orderStore.formatDate(comment.timestamp) }}</p>
                    </div>
                    <img :src="msgIcon" :class="newComments[index].trim() ? 'bg-green-400' : 'bg-red-400'"
                      class="rounded-md p-1" alt="Comment Icon" />
                  </div>
                </div>

                <!-- Display editable textarea if the comment is being edited -->
                <div v-if="isEditing[index]" class="mt-2">
                  <textarea v-model="newComments[index]" rows="2" class="w-full border rounded-lg p-2"
                    placeholder="Edit your comment"></textarea>
                  <div class="mt-2 flex justify-end gap-2">
                    <button @click="saveNewComment(index)"
                      class="px-4 py-2 bg-purple-600 text-white rounded-lg"><i class="pi pi-save"></i></button>
                    <button @click="cancelEdit(index)" class="px-4 py-2 bg-gray-300 rounded-lg"><i class="pi pi-undo"></i></button>
                  </div>
                </div>

                <!-- Display the saved comment if not being edited -->
                <div v-else class="text-sm flex justify-between">
                  <p>Reason: {{ comment.comment.trim() ? comment.comment : 'Add a reason' }} </p>
                  <div class="flex gap-2">
                    <button @click="handleEdit(index)" class="px-4 py-2 bg-gray-200 text-black rounded-lg"><i class="pi pi-pencil"></i></button>
                    <button @click="deleteComment(index)" class="px-4 py-2 bg-gray-200 text-black rounded-lg">
                      <i class="pi pi-trash"></i>
                    </button>
                  </div>
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
