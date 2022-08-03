<template>
	<div class="option-group">
		<div>{{ props.label }}</div>
		<q-option-group
			v-bind="props"
			v-model="newModel"
			:options="newOptions"
			:disable="readonly"
			@update:model-value="(v) => updateValue(v)"
		/>
	</div>
</template>
<script>
import { ref } from "vue";
import RestService from "src/services/RestService";

export default {
	props: {
		modelValue: { type: [String, Array], default: null },
		type: { type: String },
		options_type: { type: String },
		options: { type: [String, Array], default: () => [] },
		parameter: { type: String },
		label: { type: String },
		filled: { type: Boolean, default: false },
		outlined: { type: Boolean, default: false },
		dense: { type: Boolean, default: false },
		readonly: { type: Boolean, default: false },
		disable: { type: Boolean, default: false },
		hideBottomSpace: { type: Boolean, default: false },
		lazyRules: { type: Boolean, default: false },
		rules: { type: [Boolean, Array], default: null }
	},
	setup(props) {
		const newOptions = ref([]);
		const newModel = !props.modelValue ? (props.type === "radio" ? ref(null) : ref([])) : props.modelValue;

		switch (props.options_type) {
			case "option":
				if (props.options && typeof props.options === "string") {
					newOptions.value = JSON.parse(props.options).map((v) => ({ label: v, value: v }));
				}
				break;
			case "parameter":
				RestService.get({ path: "parameter/get/" + props.parameter }).then(
					({ data }) => (newOptions.value = data.map((v) => ({ label: v, value: v })))
				);
				break;
		}

		return { props, newModel, newOptions };
	},
	methods: {
		updateValue: function (v, c) {
			this.$emit("update:modelValue", v);
		}
	}
};
</script>
<style lang="scss" scoped>
:deep {
	.q-option-group {
		margin-top: 6px;

		div {
			.q-radio,
			.q-checkbox,
			.q-toggle {
				margin-bottom: 8px;
			}
		}
	}
}
</style>
