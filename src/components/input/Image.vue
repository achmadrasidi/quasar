<template>
	<div class="input-image">
		<div v-if="label" class="txt-label q-mb-xs">{{ label }}</div>
		<q-img
			:class="round ? 'round' : ''"
			:src="getSrc()"
			:ratio="ratio"
			:style="'width:' + width + ';height:' + height"
			@error="imgError = true"
		>
			<div class="image-action" v-if="!readonly">
				<q-btn round size="sm" color="positive" icon="photo_camera" @click="selectFile" />
				<q-btn
					v-if="modelValue"
					class="q-ml-sm"
					round
					size="sm"
					color="negative"
					icon="delete"
					@click="$emit('update:modelValue', null)"
				/>
			</div>
			<div v-if="error" class="error-container absolute-full text-subtitle flex flex-center text-negative text-center">
				{{ error }}
			</div>
		</q-img>
		<input ref="inputFile" type="file" @change="getFile" accept="image/*" style="display: none" />
	</div>
</template>
<script>
import Utils from "src/services/utils/Index";
import { ref } from "vue";

export default {
	name: "CIImage",
	props: {
		modelValue: { type: [String, Object], default: null },
		path: { type: String, default: process.env.RESOURCES || process.env.API + "resources/" },
		placeholder: { type: String, default: "/images/placeholder.png" },
		label: { type: String },
		readonly: { type: Boolean },
		round: { type: Boolean, default: false },
		ratio: { type: String, default: "1" },
		width: { type: String, default: "200px" },
		height: { type: String, default: "200px" }
	},
	setup() {
		const imageMimes = [
			"image/apng",
			"image/bmp",
			"image/gif	",
			"image/x-icon",
			"image/jpeg",
			"image/png",
			"image/svg+xml",
			"image/webp"
		];
		const imageExts = ["apng", "bmp", "gif", "ico", "cur", "jpg", "jpeg", "jfif", "pjpeg", "pjp", "png", "svg", "webp"];

		return { error: ref(null), imageMimes, imageExts, imgError: ref(null) };
	},

	methods: {
		isImagesByExt(ext) {
			return this.imageExts.some((el) => ext === el);
		},
		isImagesByMime(mime) {
			return this.imageMimes.some((el) => mime === el);
		},
		isImage(file) {
			if (file.mime) {
				return this.isImagesByMime(file.mime);
			}

			if (file.name) {
				const ext = file.name.split(".").pop().toLowerCase();
				return this.isImagesByExt(ext);
			}

			return false;
		},
		getSrc() {
			if (this.modelValue && this.modelValue.base64) return this.modelValue.base64;

			return this.imgError ? "/images/placeholder.png" : this.modelValue ? this.path + this.modelValue : this.placeholder;
		},
		selectFile(e) {
			this.error = null;
			const input = this.$refs.inputFile;
			input.click();
		},
		async getFile(e) {
			const files = e.target.files;
			const file = files[0];
			if (typeof file === "object") {
				const isAllowed = this.isImagesByMime(file.type);
				if (isAllowed) {
					try {
						const objFile = await Utils.File.setImage(file);
						this.$emit("update:modelValue", objFile);
					} catch (e) {
						this.error = e.message ? e.message : "Unknown Error!";
					}
				} else {
					this.error = "Only image allowed!";
				}
			}

			e.target.value = "";
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

.q-img {
	min-width: 100px;
	min-height: 100px;
	width: 100%;
	height: 100%;
	border-radius: 5px;
	background: #e9eef1;

	&.round {
		border-radius: 50%;
	}

	.q-img__content {
		border: 2px solid #ddd;
	}
}

.image-action {
	position: absolute;
	z-index: 2;
	background: none;
	width: 100%;
	text-align: center;
}

.error-container {
	background: #e9eef1;
}
</style>
