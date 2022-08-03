<template>
	<div class="components-workflow">
		<div v-if="title" class="text-h6 text-dark">{{ title }}</div>
		<q-stepper v-model="sequence" color="primary" flat animated alternative-labels>
			<q-step
				v-for="(approver, index) in approvers"
				:key="index"
				:name="index"
				:title="getApprover(approver)"
				:caption="getTitle(approver)"
				:done="sequence > index"
				done-color="positive"
				:active-color="status === 'Reject' && index === sequence ? 'negative' : 'warning2'"
				:active-icon="status === 'Reject' && index === sequence ? 'clear' : 'edit'"
				icon="assignment"
			>
			</q-step>
		</q-stepper>
	</div>
</template>

<script>
import { ref } from "vue";

export default {
	props: {
		title: { type: String },
		workflow: { type: Object, required: true }
	},
	setup(props) {
		const sequence = ref(props.workflow.sequence);
		const status = ref(props.workflow.status);
		const approvers = ref(props.workflow.approvers);

		return { sequence, status, approvers };
	},
	watch: {
		workflow(v) {
			this.sequence = v.sequence;
			this.status = v.status;
			this.approvers = v.approvers;
		}
	},
	methods: {
		getApprover(app) {
			let name = [app.name];
			if (app.additionalApprover && app.additionalApprover.length) {
				const addApp = app.additionalApprover.map((el) => el.name);
				name = name.concat(addApp);
			}

			return name.join(" / ");
		},
		getTitle(app) {
			let title = [app.title];
			if (app.additionalApprover && app.additionalApprover.length) {
				const addApp = app.additionalApprover.map((el) => el.title);
				title = title.concat(addApp);
			}

			return title.join(" / ");
		}
	}
};
</script>
<style lang="scss" scoped>
::v-deep .q-stepper__content.q-panel-parent {
	display: none;
}
</style>
