import { createApp } from "vue";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";
import Aura from "@primevue/themes/aura";
import "primeicons/primeicons.css";

import App from "./App.vue";
import router from "./router";
import "./assets/styles/main.css";

import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import Select from "primevue/select";
import Dialog from "primevue/dialog";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Textarea from "primevue/textarea";
import Message from "primevue/message";
import Card from "primevue/card";
import Toast from "primevue/toast";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: "none",
    },
  },
});
app.use(ToastService);

app.component("Button", Button);
app.component("InputText", InputText);
app.component("Password", Password);
app.component("Select", Select);
app.component("Dialog", Dialog);
app.component("DataTable", DataTable);
app.component("Column", Column);
app.component("Textarea", Textarea);
app.component("Message", Message);
app.component("Card", Card);
app.component("Toast", Toast);

app.mount("#app");
