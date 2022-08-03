<template>
	<q-input
		:filled="filled"
		:label="label"
		:outlined="outlined"
		:dense="dense"
		:hide-bottom-space="hideBottomSpace"
		:readonly="readonly"
		:disable="disable"
		:lazyRules="lazyRules"
		:rules="rules"
		:model-value="modelValue"
		:mask="mask.replace(/[a-zA-Z]/g, '#')"
		@update:model-value="(v) => updateValue(v)"
	>
		<template v-slot:append>
			<q-icon name="event" class="cursor-pointer" v-if="!readonly">
				<q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
					<q-date :model-value="modelValue" @update:model-value="(v) => updateValue(v)" :mask="mask">
						<div class="row items-center justify-end">
							<q-btn v-close-popup label="Close" color="primary" flat />
						</div>
					</q-date>
				</q-popup-proxy>
			</q-icon>
		</template>
	</q-input>
</template>

<script>
export default {
	props: {
		modelValue: { type: String, default: null },
		label: { type: String },
		mask: { type: String, default: "YYYY-MM-DD" },
		filled: { type: Boolean, default: false },
		outlined: { type: Boolean, default: false },
		dense: { type: Boolean, default: false },
		readonly: { type: Boolean, default: false },
		disable: { type: Boolean, default: false },
		hideBottomSpace: { type: Boolean, default: false },
		lazyRules: { type: Boolean, default: false },
		rules: { type: [Boolean, Array], default: null }
	},
	setup() {
		return {};
	},
	methods: {
		updateValue: function (v, c) {
			this.$emit("update:modelValue", v);
			this.$refs.qDateProxy.hide();
		}
	}
};
</script>
<style lang="scss" scoped></style>
