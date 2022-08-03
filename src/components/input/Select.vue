<template>
	<q-select
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
		:options="items"
		:option-value="optionValue || null"
		:option-label="optionLabel || null"
		:use-input="search && !modelValue"
		:use-chips="useChips"
		clearable
		input-debounce="300"
		@filter="filterFn"
		@update:model-value="(v) => updateValue(v)"
	>
	</q-select>
</template>

<script>
import { ref } from "vue";
import RestService from "src/services/RestService";

export default {
	props: {
		modelValue: { type: [String, Number, Array, Object], default: null },
		type: {
			type: String,
			default: "option",
			validator(value) {
				return ["option", "parameter", "api"].includes(value);
			}
		},
		options: { type: Array, default: () => [] },
		getOptions: { type: Function },
		parameter: { type: String },
		api: { type: String },
		apiParams: { type: Object, default: () => ({ pagination: { rowsPerPage: 10, page: 1 } }) },
		sort: { type: [String, Boolean], default: true },
		search: { type: Boolean, default: true },
		optionValue: { type: [Function, String] },
		optionLabel: { type: [Function, String] },
		label: { type: String },
		filled: { type: Boolean, default: false },
		outlined: { type: Boolean, default: false },
		dense: { type: Boolean, default: false },
		useChips: { type: Boolean, default: false },
		readonly: { type: Boolean, default: false },
		disable: { type: Boolean, default: false },
		hideBottomSpace: { type: Boolean, default: false },
		lazyRules: { type: Boolean, default: false },
		rules: { type: [Boolean, Array], default: null }
	},
	setup() {
		const def = ref([]);
		const items = ref([]);

		return { def, items };
	},
	watch: {
		options() {
			this.setItems();
		}
	},
	mounted() {
		this.setItems();
	},
	methods: {
		setItems() {
			let options = [];
			switch (this.type) {
				case "option":
					options = this.serializeOptions(this.options);
					this.def = options;
					this.items = options;
					break;
				case "parameter":
					RestService.get({ path: "parameter/get/" + this.parameter }).then((res) => {
						options = this.serializeOptions(res.data);
						this.def = options;
						this.items = options;
					});
					break;
				case "api":
					this.getApi().then((res) => {
						options = this.serializeOptions(res.data);
						this.def = options;
						this.items = options;
					});
					break;
			}
		},
		serializeOptions(data) {
			let options = data && Array.isArray(data) ? data : typeof data === "string" ? JSON.parse(data) : [];

			if (this.getOptions) options = this.getOptions(data);

			if (this.sort) {
				switch (typeof this.sort) {
					case "string":
						options = options.sort((a, b) => a[this.sort].localeCompare(b[this.sort]));
					default:
						options = options.sort();
						break;
				}
			}

			return options;
		},
		async filterFn(val, update, abort) {
			const q = val ? val.toLowerCase() : null;
			if (q) {
				const data = await this.find(q);
				const options = this.serializeOptions(data);
				update(() => (this.items = options));
			} else {
				update(() => (this.items = [...this.def]));
				return;
			}
		},
		async find(val) {
			val = val.toLowerCase();
			switch (this.type) {
				case "option":
				case "parameter":
					return this.items.filter((item) => {
						switch (typeof item) {
							case "object":
								return item && JSON.stringify(item).toLowerCase().indexOf(val) > -1;
							default:
								return item && item.toLowerCase().indexOf(val) > -1;
						}
					});
					break;
				case "api":
					const { data } = await this.getApi(val);

					return data;
					break;
			}
		},
		getApi(q) {
			const params = this.apiParams;
			params["search"] = q;

			return RestService.get({ path: this.api, params });
		},
		updateValue: function (v, c) {
			this.$emit("update:modelValue", v);
		}
	}
};
</script>
<style lang="scss" scoped></style>
