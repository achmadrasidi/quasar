<template>
	<q-page class="pwa">
		<Form title="Parameters" icon="tune" api="parameter" :form-key="$route.params.id" @init="init">
			<template v-slot:body="{ model, readonly }">
				<div class="q-pa-md q-gutter-md">
					<q-select
						:readonly="readonly"
						outlined
						dense
						options-dense
						emit-value
						map-options
						label="Type"
						v-model="model.Type"
						:options="types"
						hide-bottom-space
						lazy-rules
						:rules="[(val) => (val && val.length > 0) || 'This field is required!']"
						@update:model-value="init(model)"
					/>

					<q-input
						:readonly="readonly"
						outlined
						dense
						label="Key"
						v-model="model.Key"
						hide-bottom-space
						lazy-rules
						:rules="[
							(val) => (val && val.length > 0) || 'This field is required!',
							(val) => val.match(new RegExp('^[a-z0-9_]*$')) || 'Only allowed lowercase alphanumeric and underscores!'
						]"
					/>

					<q-input
						:readonly="readonly"
						outlined
						dense
						label="Name"
						v-model="model.Name"
						hide-bottom-space
						lazy-rules
						:rules="[(val) => (val && val.length > 0) || 'This field is required!']"
					/>

					<q-checkbox
						:disable="readonly"
						left-label
						v-model="model.NeedAuthentication"
						label="Need authentication to access this Parameters?"
					/>

					<q-input type="textarea" :readonly="readonly" outlined dense label="Description" v-model="model.Description" />

					<q-input
						v-if="model.Type === 'string' || model.Type === 'number' || model.Type === 'text' || model.Type === 'array'"
						:type="model.Type === 'number' ? 'number' : model.Type === 'text' || model.Type === 'array' ? 'textarea' : ''"
						:readonly="readonly"
						outlined
						dense
						label="Value"
						v-model="model.Value"
						hide-bottom-space
						lazy-rules
						:rules="[(val) => (val && val.length > 0) || 'This field is required!']"
					/>

					<Datepicker
						v-if="model.Type === 'date'"
						:readonly="readonly"
						outlined
						dense
						label="Value"
						v-model="model.Value"
						hide-bottom-space
						lazy-rules
						:rules="[(val) => (val && val.length > 0) || 'This field is required!']"
					/>

					<q-checkbox v-if="model.Type === 'boolean'" :disable="readonly" left-label v-model="model.Value" label="Value" />

					<Image v-if="model.Type === 'image'" :readonly="readonly" label="Value" v-model="model.Value" />

					<File
						v-if="model.Type === 'images' || model.Type === 'resource' || model.Type === 'resources'"
						:readonly="readonly"
						label="Value"
						v-model="model.Value"
						:imageOnly="model.Type === 'images'"
						:multiple="model.Type === 'images' || model.Type === 'resources'"
					/>

					<ArrayString
						v-if="model.Type === 'array-string'"
						:readonly="readonly"
						outlined
						dense
						required
						label="Value"
						v-model="model.Value"
					/>

					<Code v-if="model.Type === 'json'" :readonly="readonly" label="Value" v-model="model.Value" />

					<User
						v-if="model.Type === 'user'"
						:readonly="readonly"
						outlined
						dense
						label="Value"
						v-model="model.Value"
						hide-bottom-space
						required
					/>

					<Users
						v-if="model.Type === 'users'"
						:readonly="readonly"
						outlined
						dense
						label="Value"
						v-model="model.Value"
						hide-bottom-space
						required
						unique
					/>
				</div>
			</template>
		</Form>
	</q-page>
</template>

<script>
import Form from "src/components/Form.vue";
import RestService from "src/services/RestService";
import { ref } from "vue";
import Datepicker from "src/components/input/Datepicker.vue";
import Image from "src/components/input/Image.vue";
import File from "src/components/input/File.vue";
import ArrayString from "src/components/input/ArrayString.vue";
import Code from "src/components/input/Code.vue";
import User from "src/components/input/User.vue";
import Users from "src/components/input/Users.vue";

export default {
	components: { Form, Datepicker, Image, File, ArrayString, Code, User, Users },
	setup() {
		return { types: ref([]) };
	},
	async mounted() {
		const typesRaw = await RestService.get({ path: "parameter/cfg/types" });
		this.types = Object.keys(typesRaw.data).map((key) => ({ label: key.replace(/_/g, " "), value: typesRaw.data[key] }));
	},
	methods: {
		init(data) {
			data.NeedAuthentication = data.NeedAuthentication ? true : false;

			switch (data.Type) {
				case "boolean":
					data.Value = parseInt(data.Value) ? true : false;
					break;
				case "images":
				case "resources":
				case "array-string":
				case "json":
				case "user":
				case "users":
					data.Value = data.Value ? JSON.parse(data.Value) : null;
					break;
			}
		}
	}
};
</script>
<style lang="scss" scoped></style>
