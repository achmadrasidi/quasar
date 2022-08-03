<template>
	<q-page class="pwa">
		<View
			title="Parameters"
			icon="tune"
			api="/parameter"
			add="/configuration/parameter/new"
			open="/configuration/parameter/"
			remove="/parameter"
			:columns="columns"
			row-key="Id"
			:sort="{ by: 'Name' }"
		/>
	</q-page>
</template>

<script>
import RestService from "src/services/RestService";
import View from "src/components/View.vue";
import moment from "moment";
import { ref } from "vue";

export default {
	components: { View },
	setup() {
		const types = ref({});

		const columns = [
			{ name: "Key", label: "Key", field: "Key", align: "left", sortable: true },
			{ name: "Name", label: "Name", field: "Name", align: "left", sortable: true },
      {
				name: "Type",
				label: "Type",
				field: "Type",
				field: (r) => types.value[r.Type],
				align: "left",
				sortable: true
			},
			{
				name: "NeedAuthentication",
				label: "Need Authentication?",
				field: "NeedAuthentication",
				format: (v) => (v ? "Yes" : "No"),
				align: "left",
				sortable: true
			},
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

		return { columns, types };
	},
	async mounted() {
		const typesRaw = await RestService.get({ path: "parameter/cfg/types" });
		this.types = Object.fromEntries(Object.entries(typesRaw.data).map(([k, v]) => [v, k]));
	}
};
</script>
