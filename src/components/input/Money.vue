<template>
	<q-input
		input-class="text-right"
		:filled="filled"
		:outlined="outlined"
		:dense="dense"
		:label="label"
		:readonly="readonly"
		:disable="disable"
		:lazyRules="lazyRules"
		:rules="rules"
		:hide-bottom-space="hideBottomSpace"
		v-model="vmodel"
		@update:model-value="updateValue"
	/>
</template>

<script>
import { ref } from "vue";
export default {
	props: {
		modelValue: { type: [Number, String], default: 0 },
		locale: { type: String, default: "id" },
		decimal: { type: Number, default: 0 },
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
	setup() {
		const vmodel = ref(0);
		return { vmodel };
	},
	mounted() {
		if (!this.modelValue) this.updateValue(0);
		this.vmodel = this.formatNumber(this.modelValue || 0);
	},
	methods: {
		formatNumber(v) {
			return new Intl.NumberFormat(this.locale).format(this.toFixed(v));
		},
		reverseFormatNumber(v) {
			const val = v.toString();
			const thousandSeparator = Intl.NumberFormat(this.locale)
				.format(11111)
				.replace(/\p{Number}/gu, "");
			const decimalSeparator = Intl.NumberFormat(this.locale)
				.format(1.1)
				.replace(/\p{Number}/gu, "");

			const result = parseFloat(
				val.replace(new RegExp("\\" + thousandSeparator, "g"), "").replace(new RegExp("\\" + decimalSeparator), ".")
			);

			return !isNaN(result) ? result : 0;
		},
		toFixed(num) {
			const re = new RegExp("^-?\\d+(?:.\\d{0," + (this.decimal || -1) + "})?");

			return parseFloat(num.toString().match(re)[0]);
		},
		updateValue(v) {
			const real = this.reverseFormatNumber(v || "0");
			this.vmodel = this.formatNumber(real);
			this.$emit("update:modelValue", this.reverseFormatNumber(this.vmodel));
		}
	}
};
</script>
<style lang="scss" scoped></style>
