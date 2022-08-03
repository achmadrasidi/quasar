<template>
	<q-form class="components-form" @submit="submit">
		<q-resize-observer @resize="setHeight" />
		<q-card ref="card" class="shadow-1 text-dark">
			<q-item class="form-title bg-grey-12">
				<q-item-section :avatar="icon ? true : false">
					<q-avatar v-if="icon">
						<q-icon :name="icon" size="md" />
					</q-avatar>
				</q-item-section>
				<q-item-section class="text-h6"> {{ title }} </q-item-section>
				<q-item-section side>
					<slot name="toolbar" />
				</q-item-section>
			</q-item>

			<q-card-section ref="content" class="scroll">
				<slot name="body" v-bind:model="vdata" v-bind:readonly="vreadonly" />
			</q-card-section>
			<q-card-actions align="right" class="form-action bg-grey-12">
				<slot name="action" v-bind:model="vdata" v-bind:readonly="vreadonly" />
				<q-btn v-if="!vreadonly && saveBtn && (vApi.post || vApi.patch)" type="submit" color="positive" icon="save" label="Save" />
				<q-btn v-if="vreadonly && deleteBtn && vApi.delete" color="red" icon="delete" label="Delete" @click="remove" />
				<q-btn
					v-if="vreadonly && editBtn"
					color="orange"
					icon="edit"
					label="Edit"
					@click="
						vreadonly = false;
						mode = 'update';
					"
				/>
				<q-btn
					v-if="closeBtn"
					color="blue-grey"
					icon="close"
					label="Cancel"
					@click="closeBtn.fn ? closeBtn.fn(vreadonly, vdata) : close()"
				/>
			</q-card-actions>
		</q-card>
	</q-form>
</template>

<script>
import { ref } from "vue";
import { dom } from "quasar";
import RestService from "src/services/RestService";
import Utils from "src/services/utils/Index";
const { css, offset } = dom;

export default {
	name: "CForm",
	props: {
		title: { type: String, required: true },
		icon: { type: String },
		api: { type: [String, Object], required: true },
		formKey: { type: String },
		fields: { type: Array },
		saveBtn: { type: [Object, Boolean], default: () => true },
		editBtn: { type: [Object, Boolean], default: () => true },
		deleteBtn: { type: [Object, Boolean], default: () => true },
		closeBtn: { type: [Object, Boolean], default: () => true },
		successFn: { type: Function, default: null }
	},
	setup() {
		return {
			mode: ref("create"),
			vreadonly: ref(false),
			vdata: ref({}),
			vApi: ref({ get: null, post: null, put: null, delete: null })
		};
	},

	mounted() {
		if (typeof this.api === "string") {
			this.vApi.get = this.api + (this.formKey ? "/" + this.formKey : "");
			this.vApi.post = this.api;
			this.vApi.patch = this.api + (this.formKey ? "/" + this.formKey : "");
			this.vApi.delete = this.api + (this.formKey ? "/" + this.formKey : "");
		} else {
			this.vApi = this.api;
		}

		this.init();
	},
	methods: {
		setHeight() {
			const vh = this.$q.screen.height;
			let { top } = offset(this.$refs.card.$el);
			top = top < 0 ? 70 : top;
			const mb = top - 50;
			const action = this.$el.querySelector(".form-action").clientHeight;
			const hAction = (action || 44) - 44;
			const height = vh - top - mb - hAction - 100;

			css(this.$refs.content.$el, { maxHeight: height + "px" });
			if (this.$q.screen.xs) {
				css(this.$refs.content.$el, { height: height + "px" });
			} else {
				css(this.$refs.content.$el, { height: "auto" });
			}
		},

		async init() {
			this.mode = "create";
			const id = this.formKey;
			if (id && id !== "new") {
				this.mode = "update";
				try {
					const { data } = await RestService.get({ path: this.vApi.get });
					this.vdata = data;
					this.vreadonly = true;
				} catch (e) {
					console.error(e.message);
				}
			}

			this.$emit("init", this.vdata);
		},

		async submit() {
			let rest = RestService;
			const options = {};

			switch (this.mode) {
				case "create":
					rest = rest.post;
					options.path = this.vApi.post;

					options.data = Utils.Object.set(this.fields, this.vdata);
					break;

				case "update":
					options.path = this.vApi.patch;
					rest = rest.patch;
					options.data = Utils.Object.set(this.fields, this.vdata);
					break;
			}

			try {
				const { data } = await rest(options);
				if (data) this.successResult(data);
			} catch (e) {
				console.error(e.message);
			}
		},

		remove() {
			this.mode = "delete";
			this.$q
				.dialog({
					title: "Confirmation",
					message: `Are you sure want to delete this document?`,
					html: true,
					cancel: true,
					persistent: true
				})
				.onOk(async () => {
					try {
						const { data } = await RestService.delete({ path: this.vApi.delete });
						if (data) this.successResult(data);
					} catch (e) {
						console.error(e.message);
					}
				});
		},

		successResult(data) {
			const msg = `${Utils.String.camelCaseToString(this.mode)} ${this.title} success`;
			this.$q.dialog({ title: "Success", message: msg }).onOk(() => {
				if (this.successFn) {
					this.successFn(data);
				} else {
					this.close();
				}
			});
		},

		close() {
			if (this.$router.options.history.state.back.indexOf("/login") === 0) {
				this.$router.push("/");
			} else {
				this.$router.go(-1);
			}
		}
	}
};
</script>
<style lang="scss" scoped>
.scroll {
	padding: 0px;
}

:deep {
	.form-action {
		padding: 10px 8px 0px 8px;

		.q-btn {
			padding: 0 20px;
			margin-left: 16px;
			margin-bottom: 8px;

			.on-left {
				margin-right: 8px;
			}
		}
	}

	.q-field--readonly {
		.q-field__inner {
			.q-field__control {
				background: #eeeeee80;
			}
		}
	}
}

@media (max-width: $breakpoint-xs-max) {
	:deep {
		.form-action {
			.q-btn {
				padding: 0 8px;
				margin-left: 8px;
				font-size: 10px;

				.on-left {
					margin-right: 4px;
				}
			}
		}
	}
}
</style>
