<template>
	<div class="main bg-accent text-white">
		<div class="fof">
			<div class="text-h3">404 Not Found</div>
			<div class="q-pa-md">
				<q-btn label="Home" to="/" color="primary" />
			</div>
		</div>
	</div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
	name: "Error404"
});
</script>
<style lang="scss" scoped>
* {
	transition: all 0.6s;
}

html {
	height: 100%;
}

.main {
	display: table;
	width: 100%;
	height: 100vh;
	text-align: center;
	color: #888;
}

.fof {
	display: table-cell;
	vertical-align: middle;
}

.fof h1 {
	font-size: 50px;
	display: inline-block;
	padding-right: 12px;
	animation: type 0.5s alternate infinite;
}

@keyframes type {
	from {
		box-shadow: inset -3px 0px 0px #888;
	}
	to {
		box-shadow: inset -3px 0px 0px transparent;
	}
}
</style>
