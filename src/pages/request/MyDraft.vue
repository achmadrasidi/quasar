<template>
	<q-page class="pwa">
		<View
			title="All Request"
			icon="list"
			api="/request/draft"
			open="/request/"
			remove="/request"
			:columns="columns"
			row-key="Id"
			:sort="{ by: 'Name' }"
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
			{ name: "Name", label: "Name", field: "Name", align: "left", sortable: true },
			{
				name: "Created",
				label: "Created",
				field: "Created",
				format: (v) => moment(v).format("LLL"),
				align: "left",
				sortable: true
			},
			{
				name: "Updated",
				label: "Updated",
				field: "Updated",
				format: (v) => moment(v).format("LLL"),
				align: "left",
				sortable: true
			}
		];

		return { columns };
	}
};
</script>
