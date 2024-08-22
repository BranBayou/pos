<script setup>
import { useField } from "vee-validate";
import Visible from "@/plugins/visible";

const props = defineProps({
	name: {
		type: String,
		required: true,
	},
	type: {
		type: String,
		required: true,
	},
	modelValue: {
		type: String,
		required: true,
	},
	placeholder: {
		type: String,
	},
	rules: {
		type: [String, Object],
		default: "",
		required: false,
	},
	disabled: {
		type: Boolean,
		default: false,
	},
	leadingIcon: {
		type: String,
		required: false,
		default: undefined,
	},
	maxLength: {
		type: Number,
		default: null,
	},
	customError: {
		type: String,
		default: null,
	},
	errors: {
		type: String,
		default: "",
	},
});

const emit = defineEmits(["update:modelValue"]);

const {
	errorMessage,
	value: inputValue,
	setErrors,
	meta,
} = useField(props.name, props.rules, {
	initialValue: props.modelValue,
});

defineExpose({
	setErrors,
});

const set = (event) => {
	emit("update:modelValue", event.target.value);
};

watch(
	() => props.customError,
	(newVal) => {
		if (newVal) {
			errorMessage.value = newVal;
		}
	}
);

watch(
	() => props.modelValue,
	(newVal) => {
		inputValue.value = props.type == "number" ? Number(newVal) : newVal;
	}
);
</script>

<template>
	<div class="!w-full">
		<div
			class="w-full rounded-4 border-normal border-1 text-[15px] dark:bg-box-dark-up dark:border-box-dark-up px-[15px] py-[12px] min-h-[50px] focus:ring-primary focus:border-primary gap-[12px] flex items-center"
		>
			<span
				class="inline-flex items-center text-sm text-light dark:text-subtitle-dark me-[8px]"
			>
				<Icon :name="leadingIcon" class="text-[16px]"></Icon>
			</span>
			<input
				id="phone"
				v-model="inputValue"
				@input="set($event)"
				class="outline-none placeholder:text-[#A0A0A0] text-body dark:text-subtitle-dark w-full bg-transparent"
				:class="disabled ? 'cursor-not-allowed' : ''"
				:name="name"
				:type="type"
				:placeholder="type == 'password' ? '********' : placeholder"
				:disabled="disabled"
				:maxlength="maxLength"
			/>
		</div>
		<p
			class="mt-1 font-body text-xs text-red-600 duration-300 transition-all"
			:class="[errorMessage ? 'h-5' : 'h-0']"
			id="email-error"
			:visible="errorMessage"
		>
			{{ errorMessage }} &nbsp;
		</p>
	</div>
</template>
