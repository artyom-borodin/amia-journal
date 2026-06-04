import { createApp } from "vue";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import Aura from "@primevue/themes/aura";
import "primeicons/primeicons.css";

import App from "./App.vue";
import router from "./router";
import "./assets/styles/main.css";
import { APP_CONSTANTS } from "./config/constants";

import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import Select from "primevue/select";
import MultiSelect from "primevue/multiselect";
import Dialog from "primevue/dialog";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ColumnGroup from "primevue/columngroup";
import Row from "primevue/row";
import Textarea from "primevue/textarea";
import Message from "primevue/message";
import Card from "primevue/card";
import DatePicker from "primevue/datepicker";
import AutoComplete from "primevue/autocomplete";
import Avatar from "primevue/avatar";

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
  locale: APP_CONSTANTS.LOCALE_CONFIG,
});

app.component("Button", Button);
app.component("InputText", InputText);
app.component("Password", Password);
app.component("Select", Select);
app.component("MultiSelect", MultiSelect);
app.component("Dialog", Dialog);
app.component("DataTable", DataTable);
app.component("Column", Column);
app.component("ColumnGroup", ColumnGroup);
app.component("Row", Row);
app.component("Textarea", Textarea);
app.component("Message", Message);
app.component("Card", Card);
app.component("DatePicker", DatePicker);
app.component("AutoComplete", AutoComplete);
app.component("Avatar", Avatar);

app.mount("#app");
