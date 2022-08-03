<template>
	<div class="input-array-string">
		<div v-if="label" class="txt-label q-mb-xs">{{ label }}</div>
		<User
			v-if="!readonly"
			ref="txtUser"
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
			@update:model-value="updateInput"
		/>
		<draggable v-if="modelValue && modelValue.length" :list="modelValue" class="list-group" handle=".handle" item-key="idx">
			<template #item="{ element, index }">
				<q-item :class="(readonly ? 'bg-grey-2' : index === idx ? 'bg-yellow-3' : '') + (readonly ? '' : ' q-pa-none')">
					<q-item-section v-if="!readonly" avatar>
						<q-btn flat round :dense="dense" icon="drag_handle" class="handle" />
					</q-item-section>
					<q-item-section>
						<q-item-label>{{ element.name }}</q-item-label>
						<q-item-label caption> {{ element.email }}</q-item-label>
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
import User from "./User.vue";

const defImage = "/images/profile.png";

export default {
	components: { draggable, User },
	props: {
		modelValue: { type: [Array], default: () => [] },
		label: { type: String },
		filled: { type: Boolean, default: false },
		outlined: { type: Boolean, default: false },
		dense: { type: Boolean, default: false },
		readonly: { type: Boolean, default: false },
		disable: { type: Boolean, default: false },
		lazyRules: { type: Boolean, default: true },
		unique: { type: Boolean, default: true },
		required: { type: Boolean, default: false }
	},
	setup() {
		const resource = process.env.RESOURCES || process.env.API + "resources/";
		return { input: ref(null), idx: ref(null), resource, defImage };
	},
	methods: {
		reset() {
			this.idx = null;
			this.input = null;
		},
		updateInput(v) {
			const values = this.modelValue || [];

			if (this.unique) {
				if (!values.some((el) => el.id === this.input.id)) values.push(this.input);
			} else {
				values.push(this.input);
			}

			this.reset();
			this.updateValue(values);
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
}
</style>
