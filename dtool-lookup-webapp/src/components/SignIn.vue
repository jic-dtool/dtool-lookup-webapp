<template>
  <div class="sign-in-wrapper">
    <v-container class="fill-height" fluid>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="10" md="8" lg="6">
          <v-card elevation="12" class="overflow-hidden">
            <v-row no-gutters>
              <!-- Sign In Form -->
              <v-col
                cols="12"
                :md="rightPanelActive ? 6 : 6"
                :order="rightPanelActive ? 2 : 1"
                class="pa-0"
              >
                <v-card-text class="pa-8">
                  <div class="text-center mb-6">
                    <v-avatar size="80">
                      <v-img :src="logoSrc" alt="Logo" />
                    </v-avatar>
                  </div>

                  <h1
                    class="text-h5 font-weight-bold text-center mb-6"
                    v-html="
                      rightPanelActive
                        ? fourthContainerHeading
                        : firstContainerTitle
                    "
                  ></h1>

                  <!-- Sign In Form (shown when not right panel active) -->
                  <div v-if="!rightPanelActive">
                    <!-- Auth store error message for unauthorized users (ORCID login but not registered) -->
                    <v-alert
                      v-if="auth.status === 'unauthorized' && auth.error"
                      type="warning"
                      class="mb-4"
                      closable
                      @click:close="auth.clearError()"
                    >
                      <template #title>
                        {{ auth.error.message }}
                      </template>
                      {{ auth.error.details }}
                    </v-alert>

                    <!-- OAuth2 Login Button (if enabled) -->
                    <div v-if="oauth2Enabled" class="mb-4">
                      <v-btn
                        color="primary"
                        size="large"
                        block
                        :href="oauth2LoginUrl"
                        :loading="auth.isLoading"
                        prepend-icon="mdi-login"
                      >
                        Sign in with {{ oauth2ProviderName }}
                      </v-btn>

                      <div
                        v-if="showUsernamePasswordForm"
                        class="d-flex align-center my-4"
                      >
                        <v-divider />
                        <span class="mx-3 text-grey">or</span>
                        <v-divider />
                      </div>
                    </div>

                    <!-- Username/Password Form (if enabled) -->
                    <v-form
                      v-if="showUsernamePasswordForm"
                      @submit.prevent="handleUsernamePasswordLogin"
                    >
                      <v-text-field
                        v-model="username"
                        label="Username"
                        prepend-inner-icon="mdi-account"
                        variant="outlined"
                        density="comfortable"
                        class="mb-3"
                        :disabled="signInLoading"
                        required
                      />

                      <v-text-field
                        v-model="password"
                        label="Password"
                        prepend-inner-icon="mdi-lock"
                        type="password"
                        variant="outlined"
                        density="comfortable"
                        class="mb-3"
                        :disabled="signInLoading"
                        required
                      />

                      <v-alert
                        v-if="signInFailed"
                        type="error"
                        density="compact"
                        class="mb-4"
                      >
                        Invalid username or password
                      </v-alert>

                      <v-btn
                        type="submit"
                        color="primary"
                        size="large"
                        block
                        :loading="signInLoading"
                        :disabled="signInLoading"
                      >
                        Sign In
                      </v-btn>
                    </v-form>
                  </div>

                  <!-- Resources (shown when right panel active) -->
                  <div v-else>
                    <p
                      v-html="fourthContainerIntro"
                      class="text-body-1 mb-4"
                    ></p>
                    <v-list density="compact" class="bg-transparent">
                      <v-list-item
                        v-for="(resource, index) in fourthContainerResources"
                        :key="index"
                        :href="resource.url"
                        target="_blank"
                        prepend-icon="mdi-link"
                      >
                        <v-list-item-title>{{
                          resource.text
                        }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </div>
                </v-card-text>
              </v-col>

              <!-- Info Panel -->
              <v-col
                cols="12"
                md="6"
                :order="rightPanelActive ? 1 : 2"
                class="d-none d-md-flex"
              >
                <v-sheet
                  class="fill-height w-100 d-flex flex-column align-center justify-center pa-8"
                  :style="overlayGradient"
                >
                  <h1
                    class="text-h5 font-weight-bold text-white text-center mb-4"
                    v-html="
                      rightPanelActive
                        ? thirdContainerHeading
                        : secondContainerTitle
                    "
                  ></h1>

                  <p
                    class="text-body-1 text-white text-center mb-6"
                    v-html="
                      rightPanelActive
                        ? thirdContainerMessage
                        : secondContainerMessage
                    "
                  ></p>

                  <v-btn
                    variant="outlined"
                    color="white"
                    @click="
                      rightPanelActive
                        ? deactivateRightPanel()
                        : activateRightPanel()
                    "
                  >
                    {{ rightPanelActive ? "Return to Sign In" : "More Info" }}
                  </v-btn>
                </v-sheet>
              </v-col>
            </v-row>
          </v-card>

          <!-- Mobile info button -->
          <div class="d-md-none text-center mt-4">
            <v-btn
              variant="text"
              color="primary"
              @click="
                rightPanelActive ? deactivateRightPanel() : activateRightPanel()
              "
            >
              {{ rightPanelActive ? "Return to Sign In" : "More Info" }}
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import axios from "axios";
import type { AxiosError, AxiosResponse } from "axios";
import type { ResourceLink } from "@/types";
import { tokenGeneratorUrl, oauth2LoginUrl } from "@/config";
import { useNotificationStore } from "@/stores/notifications";
import { useAuthStore } from "@/stores/auth";

interface TokenResponse {
  token?: string;
}

const notifications = useNotificationStore();
const auth = useAuthStore();

const username = ref<string | null>(null);
const password = ref<string | null>(null);
const signInFailed = ref(false);
const signInInfo = ref<TokenResponse | null>(null);
const signInLoading = ref(false);
const rightPanelActive = ref(false);

const logoSrc =
  process.env.VUE_APP_LANDING_PAGE_ICON_PATH || "/icons/128x128/dtool_logo.png";

// OAuth2 configuration
const oauth2Enabled = process.env.VUE_APP_OAUTH2_ENABLED === "true";
const oauth2ProviderName = process.env.VUE_APP_OAUTH2_PROVIDER_NAME || "OAuth2";
// oauth2LoginUrl is imported from @/config (env-configurable via VUE_APP_OAUTH2_LOGIN_URL)
// Show username/password form if OAuth2 is disabled or if explicitly enabled
const showUsernamePasswordForm =
  !oauth2Enabled || process.env.VUE_APP_SHOW_USERNAME_PASSWORD_FORM === "true";
const firstContainerTitle =
  process.env.VUE_APP_FIRST_CONTAINER_TITLE || "Sign In";
const secondContainerTitle =
  process.env.VUE_APP_SECOND_CONTAINER_TITLE || "Welcome to Dtool";
const secondContainerMessage =
  process.env.VUE_APP_SECOND_CONTAINER_MESSAGE ||
  "Make your data more resilient, portable and easy to work with by packaging files & metadata into self-contained datasets.";
const thirdContainerHeading =
  process.env.VUE_APP_THIRD_CONTAINER_HEADING || "Access Your Account";
const thirdContainerMessage =
  process.env.VUE_APP_THIRD_CONTAINER_MESSAGE ||
  "To log in, use the default credentials: Username - <strong>testuser</strong>, Password - <strong>test_password</strong>.";
const fourthContainerHeading =
  process.env.VUE_APP_FOURTH_CONTAINER_HEADING || "Supporting Documentation";
const fourthContainerIntro =
  process.env.VUE_APP_FOURTH_CONTAINER_INTRO ||
  "Please refer to the following resources for more information:";
const fourthContainerResources: ResourceLink[] = process.env
  .VUE_APP_FOURTH_CONTAINER_RESOURCES
  ? JSON.parse(process.env.VUE_APP_FOURTH_CONTAINER_RESOURCES)
  : [
      {
        text: "dtool-lookup-webapp repository",
        url: "https://github.com/livMatS/dtool-lookup-webapp",
      },
      {
        text: "dserver REST API documentation",
        url: "https://demo.dtool.dev/lookup/doc/swagger",
      },
      {
        text: "dtool documentation",
        url: "https://dtool.readthedocs.io/",
      },
    ];

const loginCredentials = computed(() => {
  return { username: username.value, password: password.value };
});

const overlayGradient = computed(() => {
  return {
    background:
      "linear-gradient(135deg, #6A1B9A 0%, #7B1FA2 50%, #9C27B0 75%, #AB47BC 100%)",
  };
});

async function handleUsernamePasswordLogin(): Promise<void> {
  signInLoading.value = true;
  signInFailed.value = false;
  auth.clearError();

  try {
    const response: AxiosResponse<TokenResponse> = await axios.post(
      tokenGeneratorUrl,
      loginCredentials.value,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    signInInfo.value = response.data;
    if (
      signInInfo.value &&
      "token" in signInInfo.value &&
      signInInfo.value.token
    ) {
      // Use auth store to login (this verifies the token works)
      const success = await auth.login(signInInfo.value.token);
      if (!success) {
        // Auth store will have set the error
        signInFailed.value = true;
      }
    } else {
      signInFailed.value = true;
    }
  } catch (error) {
    const axiosError = error as AxiosError;

    // Determine error type and show appropriate message
    if (axiosError.code === "ERR_NETWORK") {
      notifications.error(
        "Unable to connect to authentication server. Please check that the token generator service is running.",
        10000,
      );
    } else if (axiosError.response?.status === 401) {
      signInFailed.value = true;
    } else if (axiosError.response?.status === 403) {
      notifications.error("Access denied. Please check your credentials.");
    } else if (axiosError.response?.status === 500) {
      notifications.error(
        "Authentication server error. Please try again later.",
      );
    } else {
      notifications.error(`Authentication failed: ${axiosError.message}`);
    }
  } finally {
    signInLoading.value = false;
  }
}

function activateRightPanel(): void {
  rightPanelActive.value = true;
}

function deactivateRightPanel(): void {
  rightPanelActive.value = false;
}
</script>

<style scoped>
.sign-in-wrapper {
  min-height: 100vh;
  background: #f5f5f5;
}
</style>
