<template>
	<div class="input-file">
		<div v-if="label" class="txt-label q-mb-xs">{{ label }}</div>
		<div
			class="file-upload scroll"
			@dragover="(e) => e.preventDefault()"
			@dragenter="(e) => e.preventDefault()"
			@drop="drop"
			:style="`width: ${width}; height: ${height}`"
		>
			<input
				ref="inputFile"
				type="file"
				:multiple="multiple"
				:accept="imageOnly ? 'image/*' : '*'"
				@change="getFile"
				style="display: none"
			/>
			<q-img v-for="(file, index) in vModel" :key="index" :src="getSrc(file)" ratio="1" width="160px" height="180px">
				<div class="absolute-top">
					{{
						file && file.ext
							? file.ext.toUpperCase()
							: resources[file] && resources[file].Ext
							? resources[file].Ext.toUpperCase()
							: "???"
					}}
				</div>
				<div class="absolute-full text-center q-gutter-sm">
					<q-btn
						v-if="resources[file] && resources[file].Key"
						round
						color="positive"
						size="sm"
						icon="file_download"
						@click="download(file)"
					/>
					<q-btn v-if="!readonly" round size="sm" color="negative" icon="delete" @click="deleteFile(index)" />
				</div>
				<div class="absolute-bottom text-center ellipsis-2-lines">
					<span class="text-bold">
						({{
							getSize(
								file && file.size ? file.size : resources[file] && resources[file].Size ? resources[file].Size * 1024 : 0
							)
						}})
					</span>
					{{
						file && file.ext
							? file.name
							: resources[file] && resources[file].Name
							? resources[file].Name.toUpperCase()
							: "unknown"
					}}
				</div>
			</q-img>
			<q-btn
				v-if="showAddButton()"
				outline
				round
				class="add-btn"
				color="blue-grey-10"
				text="black"
				size="xl"
				icon="add"
				@click="selectFile"
			/>
		</div>
		<div v-if="error" class="error-message text-red text-caption q-mt-xs q-ml-sm">{{ error }}</div>
	</div>
</template>

<script>
import RestService from "src/services/RestService";
import Utils from "src/services/utils/Index";
import { defineComponent } from "vue";
import { ref } from "vue";

export default defineComponent({
	name: "CIFile",
	props: {
		modelValue: { type: [Array, Object, String] },
		path: { type: String, default: process.env.RESOURCES || process.env.API + "resources/" },
		label: { type: String, default: null },
		rules: { type: Array, default: () => [] },
		imageOnly: { type: Boolean, default: false },
		multiple: { type: Boolean, default: false },
		readonly: { type: Boolean, default: false },
		allowedExt: { type: Array, default: () => [] },
		width: { type: String, default: "100%" },
		height: { type: String, default: "200px" }
	},
	setup() {
		return {
			resources: ref({}),
			error: ref(null),
			imageExts: ["apng", "bmp", "gif", "ico", "cur", "jpg", "jpeg", "jfif", "pjpeg", "pjp", "png", "svg", "webp"]
		};
	},
	computed: {
		vModel: {
			get() {
				return Array.isArray(this.modelValue) ? this.modelValue : this.modelValue ? [this.modelValue] : [];
			}
		}
	},
	watch: {
		vModel(v) {
			if (v) this.init();
		}
	},
	mounted() {
		this.init();
	},
	methods: {
		init() {
			this.vModel.forEach((v) => {
				if (typeof v === "string") {
					RestService.get({ path: this.path + v + "/json", errorNotification: false }).then((res) => {
						this.resources[v] = res.data;
					});
				}
			});
		},
		isImage(file) {
			if (!file) return false;

			if (file.mime) return file.mime.toLowerCase().indexOf("image/") > -1;

			const name = file.name || file.Name;
			const extFromFIle = name ? name.split(".").pop().toLowerCase() : null;
			const ext = extFromFIle || file.ext || file.Ext;
			if (ext) return this.imageExts.includes(ext.toLowerCase());

			return false;
		},
		showAddButton() {
			if (this.readonly) return false;

			if (!this.multiple) {
				if (this.vModel.length) return false;
			}

			return true;
		},
		getSrc(file) {
			if (typeof file === "string") {
				return this.isImage(this.resources[file]) ? this.path + file : "/images/file.png";
			} else {
				return this.isImage(file) ? file.base64 : "/images/file.png";
			}
		},
		updateValue(files) {
			if (this.multiple) {
				this.$emit("update:modelValue", files);
			} else {
				this.$emit("update:modelValue", files[0]);
			}
		},
		selectFile() {
			this.error = null;
			const input = this.$refs.inputFile;
			input.click();
		},
		getFile() {
			const input = this.$refs.inputFile;
			const files = input.files;
			this.addFile(files);
		},
		getSize(size) {
			return Utils.File.bytesToSize(size);
		},
		drop(e) {
			e.preventDefault();
			if (this.readonly) return false;
			const files = e.dataTransfer.files;
			if (!this.multiple && files.length > 1) {
				this.error = "Can only upload 1 file";
				return false;
			}

			this.addFile(files);
		},
		async addFile(files) {
			const res = [];
			for (const i in files) {
				const file = files[i];
				if (typeof file === "object") {
					const objFile = await Utils.File.setFile(file);
					let isAllowed = true;

					if (this.imageOnly) {
						isAllowed = this.isImage(objFile);
					} else {
						if (this.allowedExt.length) {
							isAllowed = this.allowedExt.some((el) => el.toLowerCase() === objFile.ext.toLowerCase());
						}
					}

					if (isAllowed) {
						const isExist = this.vModel.find((el) => el.name === objFile.name && el.size === objFile.size);

						if (!isExist) res.push(objFile);
					} else {
						let errorMessage = "";
						if (this.imageOnly) {
							errorMessage = "Only allowed image";
						} else {
							const allowedExt = this.allowedExt.map((el) => el.toLowerCase()).join(", ");
							errorMessage = `Extension "${objFile.ext}" is not allowed. Only allowed extension : ${allowedExt}`;
						}

						this.error = errorMessage;
					}
				}
			}

			if (this.multiple) {
				this.updateValue(this.vModel.concat(res));
			} else {
				this.updateValue(res);
			}

			this.$refs.inputFile.value = "";
		},
		download(file) {
			if (this.isMigration) {
				const resource = this.resources[file];
				const name = resource?.Name || null;
				const attUrl = `https://mailworkflowbucket.s3.ap-southeast-1.amazonaws.com/files/${name}`;
				window.open(attUrl, "_balnk");
			} else {
				window.open(this.path + file + "/download", "_balnk");
			}
		},
		deleteFile(index) {
			if (this.multiple) {
				const files = this.modelValue;
				files.splice(index, 1);
				this.updateValue(files);
			} else {
				this.updateValue([null]);
			}
		}
	}
});
</script>
<style lang="scss" scoped>
.txt-label {
	color: #00000099;
	font-weight: 400;
	font-size: 14px;
}

.file-upload {
	width: 100%;
	background-color: #eeeeee80;
	min-height: 200px;
	border: 2px dashed #cfd8dc;
	border-radius: 8px;
	padding-top: 8px;
	padding-left: 8px;
}

.q-img {
	margin-right: 8px;
	margin-bottom: 8px;
	border-radius: 24px;
}

.absolute-top {
	background: #455a64;
	width: fit-content;
	padding: 5px 10px !important;
	margin: 20px 2px;
	border-radius: 5px;
	font-weight: 500;
}

.absolute-full {
	background: none !important;
	margin-top: 50px;
}

.absolute-bottom {
	background: #455a64;
	width: calc(100% - 3px);
	max-height: 36px;
	padding: 4px;
	margin-left: 2px;
	margin-bottom: 18px;
	font-size: 10px;
}

.add-btn {
	font-size: 24px;
	margin: 50px 25px;

	&::before {
		border-style: dashed;
		border-width: 2px;
	}
}
</style>
