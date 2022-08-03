<template>
	<q-page class="pwa">
		<View
			title="All Request"
			icon="list"
			api="/request"
			open="/request/"
			:columns="columns"
			row-key="Id"
			:sort="{ by: 'RequestNumber', descending: true }"
		/>
	</q-page>
</template>

<script>
import View from "src/components/View.vue";
import moment from "moment";

export default {
	components: { View },
	setup() {
		const columns = [
			{ name: "RequestNumber", label: "Request Number", field: "RequestNumber", align: "left", sortable: true },
			{ name: "Requestor", label: "Requestor", field: "Requestor", format: (v) => v.name, align: "left" },
			{ name: "Name", label: "Name", field: "Name", align: "left", sortable: true },
			{ name: "Status", label: "Status", field: "Status", align: "left", sortable: true },
			{ name: "Responsible", label: "Responsible", field: "Responsible", format: (v) => v?.name || "-", align: "left" },
			{
				name: "SubmittedDate",
				label: "Submitted",
				field: "SubmittedDate",
				format: (v) => moment(v).format("LLL"),
				align: "left",
				sortable: true
			}
		];

		return { columns };
	}
};
</script>
