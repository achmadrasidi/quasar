<template>
	<q-list>
		<div v-for="link in menu" :key="link.title">
			<q-expansion-item
				default-opened
				v-if="link.items"
				v-show="
					typeof link.condition === 'undefined' ? true : typeof link.condition === 'function' ? link.condition() : link.condition
				"
				:icon="link.icon"
				:label="link.title"
				:caption="link.caption"
			>
				<div class="bg-grey-2">
					<NavigationMenu class="q-ml-md" v-for="child in link.items" :key="child.title" v-bind="child" />
				</div>
			</q-expansion-item>

			<NavigationMenu
				v-else-if="link.title && link.link"
				v-show="
					typeof link.condition === 'undefined' ? true : typeof link.condition === 'function' ? link.condition() : link.condition
				"
				v-bind="link"
			/>

			<q-item-label
				v-else-if="link.title"
				v-show="
					typeof link.condition === 'undefined' ? true : typeof link.condition === 'function' ? link.condition() : link.condition
				"
				header
				overline
				class="q-pb-sm"
			>
				{{ link.title }}
			</q-item-label>
			<div v-else class="q-mt-sm"></div>
		</div>
	</q-list>
</template>
<script>
import NavigationMenu from "src/components/NavigationMenu.vue";

export default {
	components: { NavigationMenu },
	props: {
		menu: { type: Array, required: true }
	}
};
</script>
<style lang="scss" scoped>
:deep {
	.q-item {
		.q-item__section--side.q-item__section--avatar {
			padding-right: 0px;
			min-width: 40px;
		}
	}
}
</style>
