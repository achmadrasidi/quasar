<template>
	<q-table
		ref="view"
		bordered
		class="components-view shadow-1"
		:rows="data"
		:row-key="rowKey"
		:columns="columns"
		v-model:pagination="pagination"
		:loading="loading"
		:filter="filter"
		@request="getData"
		binary-state-sort
	>
		<template v-slot:top>
			<q-resize-observer @resize="setHeight" />
			<q-icon v-if="icon" :name="icon" size="2em" class="q-mr-md text-grey-9" />
			<div v-if="title" class="text-h6 q-mr-md text-grey-9">{{ title }}</div>
			<q-btn
				v-if="add"
				rounded
				outline
				:round="$q.screen.width < 599"
				color="primary"
				icon="add"
				:label="$q.screen.width < 599 ? '' : 'Add'"
				:to="add"
			/>
			<slot v-if="$slots.header" name="header" />
			<q-space />
			<q-input
				rounded
				primary
				dense
				clearable
				:class="$q.screen.width < 599 ? 'q-mt-sm' : ''"
				standout="bg-blue-grey-8 text-white"
				debounce="500"
				v-model="filter"
				placeholder="Search"
				style="width: 250px"
			>
				<template v-slot:prepend>
					<q-icon name="search" />
				</template>
			</q-input>
			<q-btn
				v-if="!hideRefresh"
				outline
				round
				dense
				:class="'q-ml-sm ' + ($q.screen.width < 599 ? 'q-mt-sm' : '')"
				color="primary"
				icon="refresh"
				@click="getData"
			/>
		</template>

		<template v-slot:header="props">
			<q-tr :props="props">
				<q-th v-if="$slots.action || open || remove">Action</q-th>
				<q-th v-for="col in props.cols" :key="col.name" :props="props">
					{{ col.label }}
				</q-th>
			</q-tr>
		</template>

		<template v-slot:body="props">
			<q-tr :props="props">
				<q-td auto-width v-if="$slots.action || open || remove" class="q-gutter-sm">
					<slot name="action" v-bind:row="props.row" />
					<q-btn v-if="open" size="sm" color="positive" round dense :to="open + props.row[rowKey]" icon="open_in_new" />
					<q-btn v-if="remove" size="sm" color="negative" round dense @click="removeData(props.row)" icon="delete" />
				</q-td>
				<q-td
					v-for="col in props.cols"
					:key="col.name"
					:props="props"
					:class="col.class ? (typeof col.class === 'function' ? col.class(props.row) : col.class) : ''"
				>
					{{ col.value }}
				</q-td>
			</q-tr>
		</template>
	</q-table>
</template>
<script>
import RestService from "src/services/RestService";
import { defineComponent, ref, toRefs } from "vue";
import { dom } from "quasar";
import evaluate from "static-eval";
import { parse } from "esprima";

const { css, offset } = dom;

export default defineComponent({
	name: "CView",
	props: {
		title: { type: String },
		icon: { type: String },
		sort: { type: Object, validator: (v) => v && v.by },
		rowsPerPage: { type: Number, default: 25 },
		api: { type: String, required: true },
		add: { type: String },
		open: { type: String },
		remove: { type: String },
		hideRefresh: { type: Boolean, default: true },
		columns: {
			type: Array,
			required: true,
			validator: (values) => {
				return values.every((v) => v.name && v.label);
			}
		},
		rowKey: { type: String, required: true }
	},
	setup(props) {
		const { rowsPerPage, sort } = toRefs(props);
		const pagination = ref({ page: 1, rowsPerPage: rowsPerPage.value, rowsNumber: 0 });

		if (sort) {
			pagination.value.sortBy = sort.value.by;
			pagination.value.descending = sort.value.descending !== undefined ? sort.value.descending : false;
		}

		return { filter: ref(""), loading: ref(true), pagination, data: ref([]) };
	},
	mounted() {
		if (!this.api || !this.columns) return false;

		this.init();
	},
	methods: {
		setHeight() {
			const vh = this.$q.screen.height;
			let { top } = offset(this.$refs.view.$el);
			top = top < 0 ? 70 : top;
			const mb = top - 50;
			const height = vh - top - mb + "px";

			css(this.$refs.view.$el, { maxHeight: height });
			css(this.$refs.view.$el, { height: height });
		},

		async init() {
			if (this.sort) {
				this.pagination.sortBy = this.sort.by;
				this.pagination.descending = this.sort.descending !== undefined ? this.sort.descending : false;
			}

			if (this.api && Array.isArray(this.columns) && this.columns.length) {
				this.columns.forEach((el) => {
					if (el.isExpression) {
						const asc = parse(el.expression).body[0].expression;
						el.field = (row) => this.expression(asc, row);
					}
				});

				this.getData({ pagination: this.pagination, filter: undefined });
			}
		},

		async getData(props) {
			const pagination = (props && props.pagination) || this.pagination;

			this.loading = true;

			const res = await RestService.get({
				path: this.api,
				params: { pagination: pagination, filter: (props && props.filter) || this.filter }
			});

			const [items, total] = res.data;

			this.pagination = pagination;

			this.pagination.rowsNumber = total;
			this.data = items;

			this.loading = false;
		},

		expression(asc, row) {
			const ctx = {
				row,
				moment: this.$moment
			};
			try {
				return evaluate(asc, ctx) || "undefined";
			} catch (e) {
				console.error(e.message);
				return "undefined";
			}
		},

		async removeData(el) {
			const ck = this.sort.by ? this.sort.by : this.columns[0].name;
			const pk = el[this.rowKey];
			const key = el[ck];
			this.$q
				.dialog({
					title: "Confirm",
					message: key ? `Are you sure to delete "${key}"?` : "Are you sure to delete this document?",
					cancel: true,
					persistent: true
				})
				.onOk(async () => {
					const { status } = await RestService.delete({ path: this.remove + "/" + pk });

					if (status === 200) this.getData();
				});
		}
	}
});
</script>
<style lang="scss" scoped>
.components-view {
	.q-table__top,
	.q-table__bottom,
	thead tr:first-child th {
		background-color: #eee;
	}

	thead tr th {
		position: sticky;
		z-index: 1;
		font-weight: bold;
		font-size: 13px;
	}

	thead tr:first-child th {
		top: 0;
	}

	&.q-table--loading thead tr:last-child th {
		top: 48px;
	}
}
</style>
