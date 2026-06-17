<template>
  <div class="user-management">
    <v-card variant="elevated" rounded="lg" class="fill-height">
      <!-- Header -->
      <v-card-title
        class="d-flex align-center justify-space-between pa-4 border-b"
      >
        <div class="d-flex align-center">
          <v-icon size="24" color="primary" class="mr-2"
            >mdi-account-group</v-icon
          >
          <span class="text-h6">User Management</span>
        </div>
        <v-btn
          color="primary"
          variant="tonal"
          prepend-icon="mdi-account-plus"
          @click="showAddUserDialog = true"
        >
          Add User
        </v-btn>
      </v-card-title>

      <!-- Initial Loading State (only before first load; keep table mounted on reloads) -->
      <div
        v-if="initialLoading"
        class="d-flex justify-center align-center pa-8"
      >
        <v-progress-circular indeterminate color="primary" size="48" />
      </div>

      <!-- Error State -->
      <v-alert v-else-if="error" type="error" variant="tonal" class="ma-4">
        {{ error }}
        <template #append>
          <v-btn variant="text" color="error" @click="loadData">Retry</v-btn>
        </template>
      </v-alert>

      <!-- Users List -->
      <div v-else class="pa-4">
        <v-text-field
          v-model="searchQuery"
          prepend-inner-icon="mdi-magnify"
          label="Search users..."
          variant="outlined"
          density="compact"
          hide-details
          clearable
          class="mb-4"
        />

        <v-data-table
          :headers="headers"
          :items="filteredUsers"
          :loading="loading"
          v-model:expanded="expandedRows"
          class="elevation-0"
          item-value="username"
          show-expand
        >
          <!-- Username Column -->
          <template #item.username="{ item }">
            <div class="d-flex align-center">
              <v-avatar size="32" color="primary" class="mr-3">
                <span class="text-body-2 text-white">{{
                  item.username.charAt(0).toUpperCase()
                }}</span>
              </v-avatar>
              <span class="font-weight-medium">{{ item.username }}</span>
            </div>
          </template>

          <!-- Display Name Column -->
          <template #item.display_name="{ item }">
            <span v-if="item.display_name" class="text-body-2">{{
              item.display_name
            }}</span>
            <span v-else class="text-caption text-medium-emphasis"
              >Not set</span
            >
          </template>

          <!-- Admin Status Column -->
          <template #item.is_admin="{ item }">
            <v-chip
              :color="item.is_admin ? 'primary' : 'grey'"
              variant="tonal"
              size="small"
            >
              {{ item.is_admin ? "Admin" : "User" }}
            </v-chip>
          </template>

          <!-- Search Permissions Column -->
          <template #item.search_permissions_on_base_uris="{ item }">
            <div class="d-flex flex-wrap gap-1">
              <v-chip
                v-for="uri in (
                  item.search_permissions_on_base_uris || []
                ).slice(0, 2)"
                :key="uri"
                size="x-small"
                variant="outlined"
                color="secondary"
              >
                {{ formatUri(uri) }}
              </v-chip>
              <v-chip
                v-if="(item.search_permissions_on_base_uris || []).length > 2"
                size="x-small"
                variant="text"
                color="grey"
              >
                +{{ item.search_permissions_on_base_uris.length - 2 }} more
              </v-chip>
              <span
                v-if="(item.search_permissions_on_base_uris || []).length === 0"
                class="text-medium-emphasis text-caption"
              >
                None
              </span>
            </div>
          </template>

          <!-- Register Permissions Column -->
          <template #item.register_permissions_on_base_uris="{ item }">
            <div class="d-flex flex-wrap gap-1">
              <v-chip
                v-for="uri in (
                  item.register_permissions_on_base_uris || []
                ).slice(0, 2)"
                :key="uri"
                size="x-small"
                variant="outlined"
                color="success"
              >
                {{ formatUri(uri) }}
              </v-chip>
              <v-chip
                v-if="(item.register_permissions_on_base_uris || []).length > 2"
                size="x-small"
                variant="text"
                color="grey"
              >
                +{{ item.register_permissions_on_base_uris.length - 2 }} more
              </v-chip>
              <span
                v-if="
                  (item.register_permissions_on_base_uris || []).length === 0
                "
                class="text-medium-emphasis text-caption"
              >
                None
              </span>
            </div>
          </template>

          <!-- Actions Column -->
          <template #item.actions="{ item }">
            <div class="d-flex gap-1">
              <v-btn
                icon="mdi-delete"
                size="small"
                variant="text"
                color="error"
                :disabled="item.username === currentUsername"
                @click="openDeleteDialog(item)"
              />
            </div>
          </template>

          <!-- Expanded Row - Inline Permission Editor -->
          <template #expanded-row="{ columns, item }">
            <tr>
              <td :colspan="columns.length" class="pa-4 bg-grey-lighten-4">
                <div class="permission-editor">
                  <div class="text-subtitle-2 mb-3 d-flex align-center">
                    <v-icon size="18" class="mr-2">mdi-shield-key</v-icon>
                    Manage User: {{ item.username }}
                  </div>

                  <!-- Display Name -->
                  <v-card variant="outlined" class="pa-3 mb-3">
                    <div class="d-flex align-center mb-2">
                      <v-icon size="18" class="mr-2" color="primary"
                        >mdi-badge-account</v-icon
                      >
                      <span class="text-body-2">Display Name</span>
                    </div>
                    <div class="d-flex align-center gap-2">
                      <v-text-field
                        :model-value="
                          pendingDisplayName[item.username] ??
                          item.display_name ??
                          ''
                        "
                        label="Display name (optional)"
                        variant="outlined"
                        density="compact"
                        hide-details
                        clearable
                        class="flex-grow-1"
                        @update:model-value="
                          (val: string | null) =>
                            (pendingDisplayName[item.username] = val || '')
                        "
                      />
                      <v-btn
                        icon="mdi-check"
                        size="small"
                        color="primary"
                        variant="tonal"
                        :disabled="
                          (pendingDisplayName[item.username] ??
                            item.display_name ??
                            '') === (item.display_name ?? '')
                        "
                        :loading="savingDisplayName === item.username"
                        @click="saveDisplayName(item.username)"
                      />
                    </div>
                  </v-card>

                  <!-- Admin Toggle -->
                  <v-card variant="outlined" class="pa-3 mb-3">
                    <div class="d-flex align-center justify-space-between">
                      <div class="d-flex align-center">
                        <v-icon size="18" class="mr-2" color="primary"
                          >mdi-shield-account</v-icon
                        >
                        <span class="text-body-2">Administrator Status</span>
                      </div>
                      <v-switch
                        :model-value="item.is_admin"
                        color="primary"
                        density="compact"
                        hide-details
                        :disabled="
                          item.username === currentUsername ||
                          savingAdmin === item.username
                        "
                        :loading="savingAdmin === item.username"
                        @update:model-value="
                          (val: boolean | null) =>
                            val !== null &&
                            toggleAdminStatus(item.username, val)
                        "
                      />
                    </div>
                    <div
                      v-if="item.username === currentUsername"
                      class="text-caption text-medium-emphasis mt-1"
                    >
                      You cannot change your own admin status
                    </div>
                  </v-card>

                  <v-row>
                    <!-- Search Permissions -->
                    <v-col cols="12" md="6">
                      <v-card variant="outlined" class="pa-3">
                        <div class="text-caption text-medium-emphasis mb-2">
                          <v-icon size="14" class="mr-1">mdi-magnify</v-icon>
                          Search Permissions
                        </div>

                        <!-- Current permissions -->
                        <div
                          v-if="
                            (item.search_permissions_on_base_uris || [])
                              .length > 0
                          "
                          class="mb-3"
                        >
                          <div class="text-caption mb-1">Current:</div>
                          <div class="d-flex flex-wrap gap-1">
                            <v-chip
                              v-for="uri in item.search_permissions_on_base_uris"
                              :key="uri"
                              size="small"
                              variant="tonal"
                              color="secondary"
                              closable
                              :loading="
                                savingPermission ===
                                `search-revoke-${item.username}-${uri}`
                              "
                              @click:close="
                                revokeSearchPermission(item.username, uri)
                              "
                            >
                              {{ formatUri(uri) }}
                            </v-chip>
                          </div>
                        </div>
                        <div
                          v-else
                          class="text-caption text-medium-emphasis mb-3"
                        >
                          No search permissions assigned
                        </div>

                        <!-- Add new permission -->
                        <div v-if="getAvailableSearchUris(item).length > 0">
                          <div class="text-caption mb-1">Add permission:</div>
                          <div class="d-flex align-center gap-2">
                            <v-select
                              v-model="pendingSearchPermission[item.username]"
                              :items="getAvailableSearchUris(item)"
                              label="Select base URI"
                              variant="outlined"
                              density="compact"
                              hide-details
                              class="flex-grow-1"
                            />
                            <v-btn
                              icon="mdi-plus"
                              size="small"
                              color="secondary"
                              variant="tonal"
                              :disabled="
                                !pendingSearchPermission[item.username]
                              "
                              :loading="
                                savingPermission ===
                                `search-grant-${item.username}`
                              "
                              @click="grantSearchPermission(item.username)"
                            />
                          </div>
                        </div>
                        <div v-else class="text-caption text-medium-emphasis">
                          All base URIs assigned
                        </div>
                      </v-card>
                    </v-col>

                    <!-- Register Permissions -->
                    <v-col cols="12" md="6">
                      <v-card variant="outlined" class="pa-3">
                        <div class="text-caption text-medium-emphasis mb-2">
                          <v-icon size="14" class="mr-1"
                            >mdi-database-plus</v-icon
                          >
                          Register Permissions
                        </div>

                        <!-- Current permissions -->
                        <div
                          v-if="
                            (item.register_permissions_on_base_uris || [])
                              .length > 0
                          "
                          class="mb-3"
                        >
                          <div class="text-caption mb-1">Current:</div>
                          <div class="d-flex flex-wrap gap-1">
                            <v-chip
                              v-for="uri in item.register_permissions_on_base_uris"
                              :key="uri"
                              size="small"
                              variant="tonal"
                              color="success"
                              closable
                              :loading="
                                savingPermission ===
                                `register-revoke-${item.username}-${uri}`
                              "
                              @click:close="
                                revokeRegisterPermission(item.username, uri)
                              "
                            >
                              {{ formatUri(uri) }}
                            </v-chip>
                          </div>
                        </div>
                        <div
                          v-else
                          class="text-caption text-medium-emphasis mb-3"
                        >
                          No register permissions assigned
                        </div>

                        <!-- Add new permission -->
                        <div v-if="getAvailableRegisterUris(item).length > 0">
                          <div class="text-caption mb-1">Add permission:</div>
                          <div class="d-flex align-center gap-2">
                            <v-select
                              v-model="pendingRegisterPermission[item.username]"
                              :items="getAvailableRegisterUris(item)"
                              label="Select base URI"
                              variant="outlined"
                              density="compact"
                              hide-details
                              class="flex-grow-1"
                            />
                            <v-btn
                              icon="mdi-plus"
                              size="small"
                              color="success"
                              variant="tonal"
                              :disabled="
                                !pendingRegisterPermission[item.username]
                              "
                              :loading="
                                savingPermission ===
                                `register-grant-${item.username}`
                              "
                              @click="
                                grantRegisterPermissionInline(item.username)
                              "
                            />
                          </div>
                        </div>
                        <div v-else class="text-caption text-medium-emphasis">
                          All base URIs assigned
                        </div>
                      </v-card>
                    </v-col>
                  </v-row>
                </div>
              </td>
            </tr>
          </template>
        </v-data-table>
      </div>
    </v-card>

    <!-- Add User Dialog -->
    <v-dialog v-model="showAddUserDialog" max-width="500" persistent>
      <v-card rounded="lg">
        <v-card-title class="text-h6 pa-4 border-b">
          <v-icon size="24" color="primary" class="mr-2"
            >mdi-account-plus</v-icon
          >
          Add New User
        </v-card-title>
        <v-card-text class="pa-4">
          <v-text-field
            v-model="newUser.username"
            label="Username"
            variant="outlined"
            density="compact"
            :error-messages="newUserErrors.username"
            class="mb-4"
          />
          <v-switch
            v-model="newUser.is_admin"
            label="Administrator"
            color="primary"
            hide-details
            class="mb-4"
          />
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="closeAddUserDialog"> Cancel </v-btn>
          <v-btn
            color="primary"
            variant="tonal"
            :loading="saving"
            @click="createUser"
          >
            Add User
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card rounded="lg">
        <v-card-title class="text-h6 pa-4 border-b">
          <v-icon size="24" color="error" class="mr-2">mdi-alert</v-icon>
          Delete User
        </v-card-title>
        <v-card-text class="pa-4">
          Are you sure you want to delete user
          <strong>{{ userToDelete?.username }}</strong
          >? This action cannot be undone.
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="showDeleteDialog = false">
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="tonal"
            :loading="deleting"
            @click="confirmDeleteUser"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from "vue";
import { dserverApi } from "@/services/dserverApi";
import type { UserInfo } from "@/services/dserverApi";
import { useAuthStore } from "@/stores/auth";
import { useNotificationStore } from "@/stores/notifications";

const auth = useAuthStore();
const notifications = useNotificationStore();

// State
const users = ref<UserInfo[]>([]);
const baseUris = ref<string[]>([]);
const loading = ref(true);
const initialLoading = ref(true);
const saving = ref(false);
const deleting = ref(false);
const error = ref<string | null>(null);
const searchQuery = ref("");

// Expanded rows for inline permission editing
const expandedRows = ref<string[]>([]);

// Inline permission management state
const savingPermission = ref<string | null>(null);
const savingAdmin = ref<string | null>(null);
const savingDisplayName = ref<string | null>(null);
const pendingSearchPermission = reactive<Record<string, string>>({});
const pendingRegisterPermission = reactive<Record<string, string>>({});
const pendingDisplayName = reactive<Record<string, string>>({});

// Dialogs
const showAddUserDialog = ref(false);
const showDeleteDialog = ref(false);

// Form data
const newUser = reactive({
  username: "",
  is_admin: false,
});
const newUserErrors = reactive({
  username: "",
});

const userToDelete = ref<UserInfo | null>(null);

// Table headers
const headers = [
  { title: "Username", key: "username", sortable: true },
  { title: "Display Name", key: "display_name", sortable: true },
  { title: "Role", key: "is_admin", sortable: true, width: "100" },
  {
    title: "Search Permissions",
    key: "search_permissions_on_base_uris",
    sortable: false,
  },
  {
    title: "Register Permissions",
    key: "register_permissions_on_base_uris",
    sortable: false,
  },
  { title: "Actions", key: "actions", sortable: false, width: "100" },
];

// Computed
const currentUsername = computed(() => auth.username);

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;
  const query = searchQuery.value.toLowerCase();
  return users.value.filter((user) =>
    user.username.toLowerCase().includes(query),
  );
});

// Methods
function formatUri(uri: string): string {
  // Extract just the bucket/path part for display
  return uri.replace(/^s3:\/\//, "").split("/")[0] || uri;
}

// Get base URIs not yet assigned for search permission
function getAvailableSearchUris(user: UserInfo): string[] {
  const currentPerms = user.search_permissions_on_base_uris || [];
  return baseUris.value.filter((uri) => !currentPerms.includes(uri));
}

// Get base URIs not yet assigned for register permission
function getAvailableRegisterUris(user: UserInfo): string[] {
  const currentPerms = user.register_permissions_on_base_uris || [];
  return baseUris.value.filter((uri) => !currentPerms.includes(uri));
}

// Inline permission management functions
async function saveDisplayName(username: string): Promise<void> {
  const newDisplayName = pendingDisplayName[username];
  if (newDisplayName === undefined) return;

  savingDisplayName.value = username;
  try {
    // Use null to clear the display name, or the new value
    const displayNameValue = newDisplayName === "" ? null : newDisplayName;
    await dserverApi.updateUser(username, { display_name: displayNameValue });
    notifications.success(`Display name updated for "${username}"`);
    delete pendingDisplayName[username];
    await loadData();
  } catch (e) {
    console.error("Failed to update display name:", e);
    notifications.error("Failed to update display name");
  } finally {
    savingDisplayName.value = null;
  }
}

async function toggleAdminStatus(
  username: string,
  isAdmin: boolean,
): Promise<void> {
  savingAdmin.value = username;
  try {
    await dserverApi.updateUserAdmin(username, isAdmin);
    notifications.success(
      `User "${username}" ${isAdmin ? "promoted to admin" : "demoted from admin"}`,
    );
    await loadData();
  } catch (e) {
    console.error("Failed to update admin status:", e);
    notifications.error("Failed to update admin status");
  } finally {
    savingAdmin.value = null;
  }
}

async function grantSearchPermission(username: string): Promise<void> {
  const uri = pendingSearchPermission[username];
  if (!uri) return;

  savingPermission.value = `search-grant-${username}`;
  try {
    await dserverApi.grantSearchPermission(username, uri);
    notifications.success(`Search permission granted on ${formatUri(uri)}`);
    delete pendingSearchPermission[username];
    await loadData();
  } catch (e) {
    console.error("Failed to grant search permission:", e);
    notifications.error("Failed to grant search permission");
  } finally {
    savingPermission.value = null;
  }
}

async function revokeSearchPermission(
  username: string,
  uri: string,
): Promise<void> {
  savingPermission.value = `search-revoke-${username}-${uri}`;
  try {
    await dserverApi.revokeSearchPermission(username, uri);
    notifications.success(`Search permission revoked from ${formatUri(uri)}`);
    await loadData();
  } catch (e) {
    console.error("Failed to revoke search permission:", e);
    notifications.error("Failed to revoke search permission");
  } finally {
    savingPermission.value = null;
  }
}

async function grantRegisterPermissionInline(username: string): Promise<void> {
  const uri = pendingRegisterPermission[username];
  if (!uri) return;

  savingPermission.value = `register-grant-${username}`;
  try {
    await dserverApi.grantRegisterPermission(username, uri);
    notifications.success(`Register permission granted on ${formatUri(uri)}`);
    delete pendingRegisterPermission[username];
    await loadData();
  } catch (e) {
    console.error("Failed to grant register permission:", e);
    notifications.error("Failed to grant register permission");
  } finally {
    savingPermission.value = null;
  }
}

async function revokeRegisterPermission(
  username: string,
  uri: string,
): Promise<void> {
  savingPermission.value = `register-revoke-${username}-${uri}`;
  try {
    await dserverApi.revokeRegisterPermission(username, uri);
    notifications.success(`Register permission revoked from ${formatUri(uri)}`);
    await loadData();
  } catch (e) {
    console.error("Failed to revoke register permission:", e);
    notifications.error("Failed to revoke register permission");
  } finally {
    savingPermission.value = null;
  }
}

async function loadData(): Promise<void> {
  loading.value = true;
  error.value = null;

  try {
    const [userList, baseUriList] = await Promise.all([
      dserverApi.listUsers(),
      dserverApi.listBaseURIs(),
    ]);
    users.value = userList;
    baseUris.value = baseUriList.map((b) => b.base_uri);
  } catch (e) {
    console.error("Failed to load user data:", e);
    error.value = "Failed to load user data. Please try again.";
  } finally {
    loading.value = false;
    initialLoading.value = false;
  }
}

function closeAddUserDialog(): void {
  showAddUserDialog.value = false;
  newUser.username = "";
  newUser.is_admin = false;
  newUserErrors.username = "";
}

async function createUser(): Promise<void> {
  // Validate
  if (!newUser.username.trim()) {
    newUserErrors.username = "Username is required";
    return;
  }

  if (users.value.some((u) => u.username === newUser.username)) {
    newUserErrors.username = "Username already exists";
    return;
  }

  newUserErrors.username = "";
  saving.value = true;

  try {
    await dserverApi.createUser(newUser.username, {
      is_admin: newUser.is_admin,
    });
    notifications.success(`User "${newUser.username}" created successfully`);
    closeAddUserDialog();
    await loadData();
  } catch (e) {
    console.error("Failed to create user:", e);
    notifications.error("Failed to create user. Please try again.");
  } finally {
    saving.value = false;
  }
}

function openDeleteDialog(user: UserInfo): void {
  userToDelete.value = user;
  showDeleteDialog.value = true;
}

async function confirmDeleteUser(): Promise<void> {
  if (!userToDelete.value) return;

  deleting.value = true;

  try {
    await dserverApi.deleteUser(userToDelete.value.username);
    notifications.success(
      `User "${userToDelete.value.username}" deleted successfully`,
    );
    showDeleteDialog.value = false;
    userToDelete.value = null;
    await loadData();
  } catch (e) {
    console.error("Failed to delete user:", e);
    notifications.error("Failed to delete user. Please try again.");
  } finally {
    deleting.value = false;
  }
}

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.user-management {
  height: 100%;
}

.gap-1 {
  gap: 4px;
}

.border-b {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
