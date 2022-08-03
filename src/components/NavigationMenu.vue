<template>
	<q-item clickable tag="a" :target="target" :href="link" v-if="typeof condition === 'boolean' ? condition : condition()">
		<q-item-section v-if="icon" avatar>
			<q-icon :name="icon" />
		</q-item-section>

		<q-item-section>
			<q-item-label>{{ title }}</q-item-label>
			<q-item-label caption>
				{{ caption }}
			</q-item-label>
		</q-item-section>
	</q-item>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
	name: "NavigationMenu",
	props: {
		title: { type: String, required: true },
		caption: { type: String, default: "" },
		link: { type: String, default: "#" },
		icon: { type: String, default: "" },
		target: { type: String, default: "_self" },
		condition: { type: [Function, Boolean], default: true }
	}
});
</script>
