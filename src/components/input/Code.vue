<template>
	<div class="input-code">
		<div v-if="label" class="text-subtitle2 q-mb-xs">{{ label }}</div>
		<ul v-if="hint">
			<li class="text-caption" v-for="(item, index) in hint" :key="index">
				<b>{{ item.key }}</b> : {{ item.description }}
			</li>
		</ul>

		<prism-editor
			:readonly="readonly"
			class="code-editor"
			v-model="vModel"
			:highlight="highlighter"
			line-numbers
			:tabSize="4"
			@input="updateValue"
		/>

		<div v-if="!readonly" class="text-right q-py-sm">
			<q-btn rounded icon="flash_on" label="Beautify" size="sm" color="blue-grey-10" style="width: 120px" @click="tidy" />
			<q-btn round class="q-ml-md" icon="launch" size="sm" color="blue-grey-10" @click="window.show = true" />
		</div>

		<q-dialog persistent :maximized="window.maximize" v-model="window.show">
			<q-card>
				<q-bar class="bg-blue-grey-14 text-white">
					<div>{{ label }}</div>
					<q-space />
					<q-btn flat dense icon="flash_on" @click="tidy">
						<q-tooltip> Beautify </q-tooltip>
					</q-btn>
					<q-btn flat dense icon="close_fullscreen" @click="window.maximize = false" v-if="window.maximize">
						<q-tooltip v-if="window.maximize"> Close Fullscreen </q-tooltip>
					</q-btn>
					<q-btn dense flat icon="fullscreen" @click="window.maximize = true" v-if="!window.maximize">
						<q-tooltip v-if="!window.maximize"> Fullscreen </q-tooltip>
					</q-btn>
					<q-btn dense flat icon="close" v-close-popup>
						<q-tooltip class="bg-white text-primary"> Close </q-tooltip>
					</q-btn>
				</q-bar>

				<q-card-section :class="window.maximize ? 'dialog-maximized' : 'dialog-normal'" class="scroll q-pa-none">
					<ul v-if="hint">
						<li class="text-caption" v-for="(item, index) in hint" :key="index">
							<b>{{ item.key }}</b> : {{ item.description }}
						</li>
					</ul>
					<prism-editor
						class="code-editor-dialog"
						v-model="vModel"
						:highlight="highlighter"
						line-numbers
						:tabSize="4"
						@input="updateValue"
					/>
					<div class="text-right q-py-sm"></div>
				</q-card-section>
			</q-card>
		</q-dialog>
	</div>
</template>
<script>
import { ref } from "vue";
import { PrismEditor } from "vue-prism-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";

import "vue-prism-editor/dist/prismeditor.min.css";
import "prismjs/themes/prism-tomorrow.css";

const beautify = require("js-beautify").js;

// @Todo: Add Validations based on type
export default {
	components: { PrismEditor },
	props: {
		// type: { type: String, default: "String" },
		label: { type: String },
		readonly: { type: Boolean, default: false },
		modelValue: { type: String },
		hint: {
			type: Array,
			validation(v) {
				return v ? Array.isArray(v) && v.key && v.description : true;
			}
		},
		beautify: { type: Boolean, default: true }
	},
	setup() {
		const vModel = ref(null);
		const window = ref({ show: false, maximize: false });

		return { vModel, window };
	},
	mounted() {
		if (this.modelValue) this.vModel = this.modelValue;
	},
	watch: {
		modelValue(v) {
			this.vModel = v;
		}
	},
	methods: {
		highlighter(code) {
			return highlight(code, languages.js);
		},
		updateValue() {
			this.$emit("update:modelValue", this.vModel);
		},
		tidy() {
			this.vModel = beautify(this.vModel);
			this.updateValue();
		}
	}
};
</script>
<style lang="scss" scoped>
.code-editor {
	max-height: 200px;
	background: #2d2d2d;
	border-radius: 4px;
	padding: 8px;
	color: #ccc;
	font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
	font-size: 14px;
	line-height: 1.5;
	padding: 5px;
}

.q-card {
	min-width: 700px;
	border: 2px solid #fafafa;

	.dialog-maximized {
		max-height: calc(100vh - 36px);
	}

	.dialog-normal {
		max-height: 600px;
	}
}

.code-editor-dialog {
	background: #2d2d2d;
	padding: 8px;
	color: #ccc;
	font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
	font-size: 14px;
	line-height: 1.5;
	padding: 5px;
	margin-bottom: -16px;
}

:deep .prism-editor__textarea:focus {
	outline: none;
}
</style>
