<template>
	<div class="components-history">
		<div v-if="title" class="text-h6 text-dark">{{ title }}</div>
		<q-markup-table flat>
			<thead>
				<tr>
					<th>Date</th>
					<th>User</th>
					<th>Action</th>
					<th>Comment</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="(history, index) in histories" :key="index">
					<td>{{ moment(history.createdAt).format("LLL") }}</td>
					<td>
						{{
							history.user && history.user.title
								? history.user.name + " | " + history.user.title
								: history.user.name
								? history.user.name
								: "unknown"
						}}
					</td>
					<td>{{ titleCase(history.action) }}</td>
					<td>{{ history.comment || "-" }}</td>
				</tr>
			</tbody>
		</q-markup-table>
	</div>
</template>

<script>
import moment from "moment";
import Utils from "src/services/utils/Index";

export default {
	props: {
		title: { type: String },
		histories: { type: Array, required: true }
	},
	setup() {
		return { moment };
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
		},
		titleCase(v) {
			return Utils.String.titleCase(v);
		}
	}
};
</script>
<style lang="scss" scoped>
tr {
	th {
		font-size: 14px;
		font-weight: bold;
		text-align: left;
	}
}
</style>
