<template>
	<div class="input-array-string">
		<div v-if="label" class="txt-label q-mb-xs">{{ label }}</div>
		<q-input
			v-if="!readonly"
			ref="txtInput"
			:filled="filled"
			:outlined="outlined"
			:dense="dense"
			:readonly="readonly"
			:disable="disable"
			:placeholder="`Add ${label || 'Text'} here . . .`"
			v-model="input"
			hide-bottom-space
			clearable
			@clear="reset"
			lazy-rules="ondemand"
			:rules="
				validate
					? [
							(val) => (val && val.length > 0) || 'This field is required!',
							(val) => (val && !this.modelValue.includes(val)) || 'Value must unique!'
					  ]
					: []
			"
			@keydown.enter="save"
			@blur="resetValidate()"
		>
			<template v-slot:append>
				<q-btn
					flat
					:dense="dense"
					:icon="mode === 'edit' ? 'save' : mode"
					color="positive"
					:label="mode === 'edit' ? 'save' : mode"
					@click="save"
				/>
			</template>
		</q-input>

		<draggable v-if="modelValue && modelValue.length" :list="modelValue" class="list-group" handle=".handle" item-key="idx">
			<template #item="{ element, index }">
				<q-item :dense="dense" :class="readonly ? 'bg-grey-2' : index === idx ? 'bg-yellow-3' : ''">
					<q-item-section v-if="!readonly" avatar>
						<q-btn flat round :dense="dense" icon="drag_handle" class="handle" />
					</q-item-section>
					<q-item-section>{{ element }}</q-item-section>
					<q-item-section v-if="!readonly" side>
						<q-btn flat round :dense="dense" icon="edit" color="warning" @click="edit(index)" />
					</q-item-section>
					<q-item-section v-if="!readonly" side>
						<q-btn flat round :dense="dense" icon="delete" color="negative" @click="remove(index)" />
					</q-item-section>
				</q-item>
			</template>
		</draggable>
	</div>
</template>

<script>
import { ref } from "vue";
import draggable from "vuedraggable";

export default {
	components: { draggable },
	props: {
		modelValue: { type: [Array], default: () => [] },
		label: { type: String },
		filled: { type: Boolean, default: false },
		outlined: { type: Boolean, default: false },
		dense: { type: Boolean, default: false },
		readonly: { type: Boolean, default: false },
		disable: { type: Boolean, default: false },
		unique: { type: Boolean, default: false },
		require: { type: Boolean, default: false }
	},
	setup() {
		return { input: ref(null), mode: "add", idx: ref(null), validate: ref(false) };
	},
	methods: {
		reset() {
			this.mode = "add";
			this.idx = null;
			this.input = null;
			this.validate = true;
			this.$refs.txtInput.focus();
			this.$refs.txtInput.resetValidation();
		},
		resetValidate() {
			this.validate = false;
			this.$refs.txtInput.resetValidation();
		},
		save(e) {
			e.preventDefault();
			this.validate = true;
			if (!this.input || (this.input && !this.input.trim())) {
				this.$refs.txtInput.validate();
				return false;
			}

			if (this.modelValue && this.modelValue.includes(this.input)) {
				this.$refs.txtInput.validate();
				return false;
			}

			const values = this.modelValue || [];

			switch (this.mode) {
				case "add":
					values.push(this.input);
					break;
				case "edit":
					values[this.idx] = this.input;
					break;
			}

			this.reset();
			this.updateValue(values);
		},
		edit(i) {
			if (this.mode === "edit" && this.idx === i) {
				this.reset();
			} else {
				this.mode = "edit";
				this.idx = i;
				this.input = this.modelValue[i];
			}

			this.$refs.txtInput.focus();
		},
		remove(i) {
			const values = this.modelValue;
			values.splice(i, 1);
			this.updateValue(values);
			this.reset();
		},
		updateValue: function (values) {
			this.$emit("update:modelValue", values);
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

.q-item {
	border: 1px solid #0000001f;

	&:not(:first-child) {
		margin-top: -1px;
	}
}

:deep {
	.q-field__bottom {
		margin-bottom: 8px;
	}

	button.q-icon {
		color: $negative;
	}
}
</style>
