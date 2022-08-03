<template>
	<div class="input-user">
		<div v-if="label" class="txt-label q-mb-xs">{{ label }}</div>
		<q-select
			hide-dropdown-icon
			:filled="filled"
			:outlined="outlined"
			:dense="dense"
			:hide-bottom-space="hideBottomSpace"
			:readonly="readonly"
			:disable="disable"
			:model-value="modelValue"
			:options="opts"
			:use-input="!modelValue"
			input-debounce="200"
			:placeholder="!modelValue ? 'Type name to find the user' : null"
			@filter="filterFn"
			@update:model-value="(v) => $emit('update:modelValue', v)"
		>
			<template v-slot:option="scope">
				<q-item v-bind="scope.itemProps">
					<q-item-section>
						<q-item-label>{{ scope.opt.name }}</q-item-label>
						<q-item-label caption> {{ scope.opt.email }}</q-item-label>
					</q-item-section>
				</q-item>
			</template>
			<template v-slot:selected>
				<q-item v-if="modelValue" dense class="full-width q-pa-none">
					<q-item-section>
						<q-item-label>{{ modelValue.name }}</q-item-label>
						<q-item-label caption> {{ modelValue.email }}</q-item-label>
					</q-item-section>
					<q-item-section side>
						<q-btn
							v-if="modelValue && !readonly"
							class="q-ml-sm"
							round
							size="sm"
							color="negative"
							icon="delete"
							@click="$emit('update:modelValue', null)"
						/>
					</q-item-section>
				</q-item>
			</template>
			<template v-slot:no-option>
				<q-item>
					<q-item-section class="text-grey"> No results </q-item-section>
				</q-item>
			</template>
		</q-select>
	</div>
</template>
<script>
import { ref } from "vue";
import RestService from "src/services/RestService";

const defImage = "/images/profile.png";

export default {
	props: {
		modelValue: { type: Object, default: null },
		map: { type: Array, default: () => ["id", "name", "email"] },
		options: { type: Array },
		required: { type: Boolean, default: false },
		label: { type: String },
		filled: { type: Boolean, default: false },
		outlined: { type: Boolean, default: false },
		dense: { type: Boolean, default: false },
		readonly: { type: Boolean, default: false },
		disable: { type: Boolean, default: false },
		hideBottomSpace: { type: Boolean, default: false },
		hideHint: { type: Boolean, default: false },
		lazyRules: { type: Boolean, default: true },
		rules: { type: [Boolean, Array], default: () => [] }
	},
	setup() {
		const def = ref([]);
		const opts = ref(null);
		const vRules = ref([]);
		const resource = process.env.RESOURCES || process.env.API + "resources/";

		return { def, opts, vRules, resource, defImage };
	},
	watch: {
		options(v) {
			if (v && v.length) this.def = v;
		}
	},
	mounted() {
		if (this.required) {
			this.vRules = [(val) => (val && val.Id && val.Id.length > 0) || "This field is required!"];
		} else {
			this.vRules = this.rules;
		}

		this.find().then((res) => (this.def = res));
	},
	methods: {
		async find(val) {
			if (this.options) {
				return val
					? [...this.options].filter((el) => {
							const name = el.name ? el.name.toLowerCase() : "";
							const email = el.email ? el.email.toLowerCase() : "";
							return name.indexOf(val) > -1 || email.indexOf(val) > -1;
					  })
					: this.options;
			} else {
				const { data } = await RestService.get({
					path: process.env.CORE + "users/listuser",
					loading: false,
					params: { search: val, pagination: { rowsPerPage: 10, sortBy: "name", descending: false } },
					errorNotification: false
				});

				if (this.map && this.map.length) {
					return data.items.map((u) => {
						const mapped = {};
						this.map.forEach((m) => (mapped[m] = u[m] || null));
						return mapped;
					});
				}

				return data.items;
			}
		},
		async filterFn(val, update, abort) {
			const q = val ? val.toLowerCase() : null;
			if (q) {
				const res = await this.find(val.toLowerCase());
				update(() => (this.opts = res));
			} else {
				update(() => (this.opts = [...this.def]));
				return;
			}
		},
		errorImg(e) {
			if (e.target.src.indexOf(defImage) === -1) e.target.src = defImage;
		}
	}
};
</script>
<style lang="scss" scoped>
.txt-label {
	color: #00000099;
	font-weight: 400;
	font-size: 14px;
}
</style>
