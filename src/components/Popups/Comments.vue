<script setup>
import { ref, onMounted } from 'vue';
import msgIcon from '/message.svg';

const comments = ref([]);
const isEditing = ref({}); // Track which comment is being edited
const newComment = ref(''); // Track the new comment input

// Function to load comments from local storage
const loadCommentsFromLocalStorage = () => {
  comments.value = JSON.parse(localStorage.getItem('comments')) || [];
};

// Function to save updated comments to local storage
const saveCommentsToLocalStorage = () => {
  localStorage.setItem('comments', JSON.stringify(comments.value));
};

// Function to handle comment editing
const handleEdit = (index) => {
  isEditing.value[index] = true;
  newComment.value = comments.value[index].comment || ''; // Initialize new comment value
};

// Function to save the new comment
const saveNewComment = (index) => {
  if (!newComment.value.trim()) {
    return; // Prevent saving empty comment
  }
  comments.value[index].comment = newComment.value;
  saveCommentsToLocalStorage(); // Update local storage
  isEditing.value[index] = false; // Stop editing
};

// Function to cancel editing
const cancelEdit = (index) => {
  isEditing.value[index] = false;
};

// Fetch the comments when the component is mounted
onMounted(() => {
  loadCommentsFromLocalStorage();
});

// Emit event to close the modal
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
              
              <!-- Iterate through the comments and display them -->
              <div v-for="(comment, index) in comments" :key="index" class="mb-4 border-b pb-4">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex">
                    <img :src="`https://replicagunsca.b-cdn.net/images/products/small/${comment.item.imageUrl}`"
                      class="w-14 rounded-lg" alt="product-img" />
                    <div class="ml-4">
                      <p class="font-semibold">{{ comment.item.name }}</p>
                      <p class="text-sm text-gray-500">Price: ${{ comment.item.price }}</p>
                      <p class="text-sm text-gray-500">SKU: {{ comment.item.sku }}</p>
                    </div>
                  </div>
                  <div class="text-right flex gap-3">
                    <div class="">
                      <p class="text-sm text-gray-500">Comment by: <span class="font-semibold">{{ comment.manager }}</span></p>
                      <p class="text-sm text-gray-500">{{ new Date(comment.timestamp).toLocaleString() }}</p>
                    </div>
                    <!-- Dynamically apply background color based on comment existence -->
                    <img :src="msgIcon" :class="comment.comment ? 'bg-green-500' : 'bg-red-500'" class="rounded-md p-1" alt="Comment Icon">
                  </div>
                </div>

                <!-- Display editable textarea if the comment is empty or being edited -->
                <div v-if="isEditing[index] || !comment.comment" class="mt-2">
                  <textarea
                    v-model="newComment"
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
                <p v-else class="text-sm">{{ comment.comment }}</p>
                
                <!-- Edit button to allow editing if the comment is empty -->
                <div v-if="!comment.comment && !isEditing[index]" class="mt-2 flex justify-end">
                  <button @click="handleEdit(index)" class="px-4 py-2 bg-blue-500 text-white rounded-lg">Add Comment</button>
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

.bg-green-500 {
  background-color: #10B981;
}

.bg-red-500 {
  background-color: #EF4444;
}
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
