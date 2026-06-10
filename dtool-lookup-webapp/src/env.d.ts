declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<object, object, unknown>;
  export default component;
}

declare module "filesize";

// Build-time configuration injected by Vue CLI (webpack) from VUE_APP_*
// environment variables via process.env.
declare namespace NodeJS {
  interface ProcessEnv {
    VUE_APP_DTOOL_LOOKUP_SERVER_URL: string;
    VUE_APP_DTOOL_LOOKUP_SERVER_TOKEN_GENERATOR_URL: string;
    VUE_APP_LANDING_PAGE_ICON_PATH?: string;
    VUE_APP_FIRST_CONTAINER_TITLE?: string;
    VUE_APP_SECOND_CONTAINER_TITLE?: string;
    VUE_APP_SECOND_CONTAINER_MESSAGE?: string;
    VUE_APP_THIRD_CONTAINER_HEADING?: string;
    VUE_APP_THIRD_CONTAINER_MESSAGE?: string;
    VUE_APP_FOURTH_CONTAINER_HEADING?: string;
    VUE_APP_FOURTH_CONTAINER_INTRO?: string;
    VUE_APP_FOURTH_CONTAINER_RESOURCES?: string;
    VUE_APP_OFFER_DTOOL_README_YAML_DOWNLOAD?: string;
    VUE_APP_OFFER_DTOOL_JSON_DOWNLOAD?: string;
    VUE_APP_SHOW_INFO_MENU_ENTRY?: string;
    VUE_APP_INFO_CONTENT?: string;
    VUE_APP_DTOOL_JSON_PATH?: string;
    VUE_APP_DTOOL_README_YAML_PATH?: string;
  }
}
