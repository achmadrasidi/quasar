<template>
	<div class="input-import-excel">
		<q-btn
			:label="label"
			:icon="icon"
			:color="color"
			:round="round"
			:rounded="rounded"
			:outline="outline"
			:dense="dense"
			@click="upload"
		/>
		<input ref="fileinput" type="file" accept=".xls, .xlsx" @change="uploadItems" @click="fileClicked" style="display: none" />
	</div>
</template>
<script>
import { ref } from "vue";
import * as XLSX from "xlsx";

export default {
	props: {
		modelValue: { type: Array, default: () => [] },
		fields: { type: Array },
		label: { type: String, default: "Import" },
		icon: { type: String, default: "publish" },
		color: { type: String, default: "green" },
		round: { type: Boolean },
		rounded: { type: Boolean },
		outline: { type: Boolean },
		dense: { type: Boolean }
	},
	setup() {
		const loadingOptions = {
			spinnerColor: "white",
			spinnerSize: 100,
			backgroundColor: "blue-grey-10",
			message: "Some important process is in progress. Hang on...",
			messageColor: "white"
		};
		const uploaded = ref(false);
		return { loadingOptions, uploaded };
	},
	methods: {
		upload() {
			this.uploaded = false;
			this.$refs.fileinput.click();
		},
		fileClicked() {
			setTimeout(() => this.$q.loading.show(this.loadingOptions), 1000);
			setTimeout(() => {
				if (!this.uploaded) this.$q.loading.hide();
			}, 6000);
		},
		async uploadItems(e) {
			this.uploaded = true;

			const parent = this;
			const files = e.target.files;

			if (files.length) {
				const file = files[0];
				const ext = file.name.split(".").pop().toLowerCase();
				if (!(ext === "xlsx" || ext === "xls")) {
					this.$q.dialog({
						title: "Information",
						message: `Please select Ms Excel!`,
						persistent: true
					});
					return false;
				} else {
					this.$q.loading.hide();
				}

				const reader = new FileReader();
				reader.readAsArrayBuffer(file);
				reader.onload = async function (e) {
					const data = new Uint8Array(reader.result);
					const workbook = XLSX.read(data, { type: "array" });
					const sheet = workbook.Sheets[workbook.SheetNames[0]];
					const json = XLSX.utils.sheet_to_json(sheet);

					parent.$q.loading.hide();

					parent.$emit("update:modelValue", json);

					parent.$emit("done", json);
				};
			}

			e.target.value = "";
		}
	}
};
</script>
