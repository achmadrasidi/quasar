<template>
	<q-page padding>
		<q-card>
			<q-form @submit="submit">
				<q-toolbar>
					<q-toolbar-title>Test</q-toolbar-title>
				</q-toolbar>
				<q-separator v-if="data.RequestNumber" />
				<q-card-section v-if="data.RequestNumber" class="row">
					<div class="col-4">
						<q-input readonly dense outlined label="Request Number" :model-value="data.RequestNumber" />
					</div>
					<div class="col-4 q-pl-md">
						<q-input readonly dense outlined label="Submitted Date" :model-value="formatDate(data.SubmittedDate)" />
					</div>
					<div class="col-4 q-pl-md">
						<q-input readonly dense outlined label="Statue" :model-value="data.Status" />
					</div>
				</q-card-section>
				<q-separator />
				<q-card-section class="q-gutter-md">
					<Select
						:readonly="readonly"
						dense
						outlined
						label="CBU"
						v-model="data.CBU"
						type="parameter"
						parameter="cbu"
						lazy-rules
						hide-bottom-space
						:rules="[(val) => (val && val.length > 1) || 'This field is required!']"
					/>
					<q-input
						:readonly="readonly"
						dense
						outlined
						label="Name"
						v-model="data.Name"
						lazy-rules
						hide-bottom-space
						:rules="[(val) => (val && val.length > 1) || 'This field is required!']"
					/>
					<q-input :readonly="readonly" type="textarea" dense outlined label="Description" v-model="data.Description" />

					<File :readonly="readonly" label="Attachment" v-model="data.Attachment" />

					<File :readonly="readonly" label="Attachment" v-model="data.AdditionalAttachment" multiple />
				</q-card-section>
				<q-separator v-if="data.RequestNumber" />
				<q-card-section v-if="data.RequestNumber" class="q-gutter-md">
					<Workflow title="Approval" :workflow="workflow" />
					<History title="History" :histories="histories" />
				</q-card-section>
				<q-separator />
				<q-card-section class="q-gutter-md text-right">
					<q-btn v-if="canSubmit" type="submit" rounded label="Save" color="positive" @click="data.Action = 0" />
					<q-btn v-if="canSubmit" type="submit" rounded label="Submit" color="teal" @click="data.Action = 1" />
					<q-btn v-if="canApprove" rounded label="Approve" color="positive" @click="approval(1)" />
					<q-btn v-if="canApprove" rounded label="Reject" color="negative" @click="approval(2)" />
					<q-btn v-if="canApprove" rounded label="Sendback" color="orange" @click="approval(3)" />
					<q-btn rounded label="Cancel" color="negative" @click="$router.go(-1)" />
				</q-card-section>
			</q-form>
		</q-card>
	</q-page>
</template>
<script>
import { ref } from "vue";
import Select from "src/components/input/Select.vue";
import RestService from "src/services/RestService";
import { useRoute } from "vue-router";
import Workflow from "src/components/Workflow.vue";
import History from "src/components/History.vue";
import File from "src/components/input/File.vue";
import User from "src/services/User";
import moment from "moment";

export default {
	components: { Select, Workflow, History, File },
	setup() {
		const id = useRoute().params.id;
		const data = ref({});
		const workflow = ref({});
		const histories = ref([]);
		const readonly = ref(true);

		if (id === "new") {
			readonly.value = false;
		} else {
			RestService.get({ path: "request/" + id }).then((res) => {
				data.value = res.data;

				if (res.data.Level > 0) {
					RestService.get({ path: "request/workflow/" + res.data.DocId }).then((res) => {
						workflow.value = res.data.workflow;
						histories.value = res.data.histories;
					});

					if (res.data.Level === 4) {
						readonly.value = false;
					}
				} else {
					readonly.value = false;
				}
			});
		}

		return { data, readonly, workflow, histories };
	},
	computed: {
		canSubmit() {
			if (!this.readonly && (!this.data.Level || this.data.Level === 4)) return true;
			return false;
		},
		canApprove() {
			const currApprover = this.workflow.currentApprover;
			if (!currApprover) return false;
			const { email } = User.get();

			return this.data.Level === 1 && email === currApprover.email ? true : false;
		}
	},
	methods: {
		formatDate(v) {
			return moment(v).format("LLL");
		},
		submit() {
			if (this.data.Action) {
				this.$q
					.dialog({
						title: "Submit Request",
						prompt: { placeholder: "Comment . . .", outlined: true, model: "", type: "textarea" },
						cancel: true,
						persistent: true
					})
					.onOk((data) => {
						this.data.Comment = data;
						this.doSubmit();
					});
			} else {
				this.doSubmit();
			}
		},
		async doSubmit() {
			const { status } = await RestService.post({ path: "request", data: this.data });
			if (status === 200 || status === 201) {
				if (this.data.Action) {
					this.$q.dialog({ title: "Information", message: "Request has been Submitted" }).onOk(() => this.$router.go(-1));
				} else {
					this.$router.go(-1);
				}
			}
		},
		async approval(action) {
			let sAction = null,
				xAction = null;
			switch (action) {
				case 1:
					sAction = "Approve";
					xAction = "approve";
					break;
				case 2:
					sAction = "Reject";
					xAction = "reject";
					break;
				case 3:
					sAction = "Sendback";
					xAction = "send back";
					break;
			}

			const token = await RestService.get({ path: "/request/get/token/" + this.data.DocId });

			this.$q
				.dialog({
					html: true,
					title: `${sAction} Request: <br><b><small>${this.data.RequestNumber}</small></b>`,
					prompt: {
						placeholder: "Comment . . .",
						outlined: true,
						model: "",
						type: "textarea",
						isValid: (val) => (action === 1 ? true : val.length > 0)
					},
					cancel: true,
					persistent: true
				})
				.onOk((data) => this.doApproval(token.data.token, xAction, sAction, data));
		},
		async doApproval(token, xAction, sAction, comment) {
			const { email } = User.get();
			const payload = { action: xAction, token, email, comment };

			try {
				const { status } = await RestService.post({ path: process.env.CORE + "/workflow/approval", data: payload });
				if (status === 200 || status === 201) {
					this.$q.dialog({ title: "Information", message: sAction + " Success" }).onOk(() => this.$router.go(-1));
				}
			} catch (err) {
				console.error(err);
				this.$q.dialog({ title: err.statusCode + " " + err.error, message: err.message });
			}
		}
	}
};
</script>
<style lang="scss" scoped></style>
