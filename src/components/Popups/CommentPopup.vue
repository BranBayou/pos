<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useOrderStore } from '@/stores/OrderStore';
import { useToast } from 'vue-toastification';

const authStore = useAuthStore();
const orderStore = useOrderStore();
const toast = useToast();

// Props to accept the item information
const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  gstRate: {
    type: Number,
    required: true,
  },
  pstRate: {
    type: Number,
    required: true,
  },
});

// Check if props.item is defined and has discountPercentage; provide a fallback of 0 if not.
const discountPercentage = ref(props.item?.discountPercentage ?? 0); 
const originalPrice = ref(props.item?.OriginalPrice ?? props.item.Price);
const comment = ref('');
const isSubmitting = ref(false);
const isCommentProvided = ref(false);  
// Emit event when the comment is submitted
const emit = defineEmits(['close', 'commentSubmitted']);



// Submit comment
const submitComment = async () => {
  isSubmitting.value = true;

  // Use the store's submit function
  orderStore.submitCommentToStore(
    comment.value,
    authStore.managerUser,
    props.item,
  );

  emit('commentSubmitted', comment.value);
  emit('close');

  isSubmitting.value = false;
  toast.success('Comment submitted successfully!');
};


// Handle cancel and reset the discount
const cancelComment = () => {
  orderStore.state.overallDiscount = 0;
  if (props.item) {
    orderStore.resetDiscount(props.item);
    orderStore.resetTaxRate(props.item, 'GST');
    orderStore.resetTaxRate(props.item, 'PST');
  }
  emit('close');
};

// Computed property to dynamically change image background color
const imageBackgroundColor = computed(() => {
  return comment.value.trim() ? 'bg-green-400' : 'bg-red-400';
});
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
                    <img v-if="props.item.ItemImage" :src="`https://replicagunsca.b-cdn.net/images/products/small/${props.item?.ItemImage ?? ''}`"
                      class="w-14 rounded-lg" alt="product-img" />
                    <div>
                      <p class="font-semibold">{{ props.item?.ItemName ?? 'Overall Discount' }}</p>
                      <p v-if="props.item.Price" class="text-sm text-gray-500">Price: ${{ props.item?.Price ?? 0 }}</p>
                      <p class="text-sm text-gray-500">Discount: {{ props.item?.Discount ?? discountPercentage }}%</p>
                    </div>
                  </div>
                  <div class="flex">
                    <p class="text-sm text-gray-500 mt-2">Approved by: <span class="font-semibold">{{ authStore.managerUser }}</span></p>
                    <img src="/message.svg" :class="imageBackgroundColor" class="rounded-md p-1" alt="Comment Icon">
                  </div>
                </div>
              </div>

              <!-- Comment Textarea -->
              <div class="collapse-content">
                <textarea v-model="comment" rows="4" class="w-full border rounded-lg p-2"
                  placeholder="Enter your comment"></textarea>

                <div class="mt-4 flex justify-end gap-4">
                  <button @click="submitComment" :disabled="isSubmitting" class="px-4 py-2 bg-purple-500 text-white rounded-lg">
                    <i class="pi pi-save"></i>
                  </button>
                  <button @click="cancelComment" class="px-4 py-2 bg-gray-300 rounded-lg"><i class="pi pi-times"></i></button>
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
