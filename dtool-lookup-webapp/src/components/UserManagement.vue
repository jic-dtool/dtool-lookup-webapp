<template>
  <div class="user-management">
    <v-card variant="elevated" rounded="lg" class="fill-height">
      <!-- Header -->
      <v-card-title class="d-flex align-center justify-space-between pa-4 border-b">
        <div class="d-flex align-center">
          <v-icon size="24" color="primary" class="mr-2">mdi-account-group</v-icon>
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

      <!-- Loading State -->
      <div v-if="loading" class="d-flex justify-center align-center pa-8">
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
          class="elevation-0"
          item-value="username"
        >
          <!-- Username Column -->
          <template #item.username="{ item }">
            <div class="d-flex align-center">
              <v-avatar size="32" color="primary" class="mr-3">
                <span class="text-body-2 text-white">{{ item.username.charAt(0).toUpperCase() }}</span>
              </v-avatar>
              <span class="font-weight-medium">{{ item.username }}</span>
            </div>
          </template>

          <!-- Admin Status Column -->
          <template #item.is_admin="{ item }">
            <v-chip
              :color="item.is_admin ? 'primary' : 'grey'"
              variant="tonal"
              size="small"
            >
              {{ item.is_admin ? 'Admin' : 'User' }}
            </v-chip>
          </template>

          <!-- Search Permissions Column -->
          <template #item.search_permissions_on_base_uris="{ item }">
            <div class="d-flex flex-wrap gap-1">
              <v-chip
                v-for="uri in (item.search_permissions_on_base_uris || []).slice(0, 2)"
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
              <span v-if="(item.search_permissions_on_base_uris || []).length === 0" class="text-medium-emphasis text-caption">
                None
              </span>
            </div>
          </template>

          <!-- Register Permissions Column -->
          <template #item.register_permissions_on_base_uris="{ item }">
            <div class="d-flex flex-wrap gap-1">
              <v-chip
                v-for="uri in (item.register_permissions_on_base_uris || []).slice(0, 2)"
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
              <span v-if="(item.register_permissions_on_base_uris || []).length === 0" class="text-medium-emphasis text-caption">
                None
              </span>
            </div>
          </template>

          <!-- Actions Column -->
          <template #item.actions="{ item }">
            <div class="d-flex gap-1">
              <v-btn
                icon="mdi-pencil"
                size="small"
                variant="text"
                color="primary"
                @click="openEditDialog(item)"
              />
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
        </v-data-table>
      </div>
    </v-card>

    <!-- Add User Dialog -->
    <v-dialog v-model="showAddUserDialog" max-width="500" persistent>
      <v-card rounded="lg">
        <v-card-title class="text-h6 pa-4 border-b">
          <v-icon size="24" color="primary" class="mr-2">mdi-account-plus</v-icon>
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
          <v-btn
            variant="text"
            @click="closeAddUserDialog"
          >
            Cancel
          </v-btn>
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

    <!-- Edit User Dialog -->
    <v-dialog v-model="showEditDialog" max-width="600" persistent>
      <v-card v-if="editingUser" rounded="lg">
        <v-card-title class="text-h6 pa-4 border-b">
          <v-icon size="24" color="primary" class="mr-2">mdi-account-edit</v-icon>
          Edit User: {{ editingUser.username }}
        </v-card-title>
        <v-card-text class="pa-4">
          <!-- Admin Status -->
          <v-switch
            v-model="editingUser.is_admin"
            label="Administrator"
            color="primary"
            hide-details
            class="mb-4"
            :disabled="editingUser.username === currentUsername"
          />

          <!-- Search Permissions -->
          <div class="mb-4">
            <div class="text-subtitle-2 mb-2">Search Permissions</div>
            <v-select
              v-model="editingUser.search_permissions_on_base_uris"
              :items="availableBaseUris"
              label="Select base URIs"
              variant="outlined"
              density="compact"
              multiple
              chips
              closable-chips
              hide-details
            />
          </div>

          <!-- Register Permissions -->
          <div>
            <div class="text-subtitle-2 mb-2">Register Permissions</div>
            <v-select
              v-model="editingUser.register_permissions_on_base_uris"
              :items="availableBaseUris"
              label="Select base URIs"
              variant="outlined"
              density="compact"
              multiple
              chips
              closable-chips
              hide-details
            />
          </div>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn
            variant="text"
            @click="closeEditDialog"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="tonal"
            :loading="saving"
            @click="saveUser"
          >
            Save Changes
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
          Are you sure you want to delete user <strong>{{ userToDelete?.username }}</strong>?
          This action cannot be undone.
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn
            variant="text"
            @click="showDeleteDialog = false"
          >
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
const saving = ref(false);
const deleting = ref(false);
const error = ref<string | null>(null);
const searchQuery = ref("");

// Dialogs
const showAddUserDialog = ref(false);
const showEditDialog = ref(false);
const showDeleteDialog = ref(false);

// Form data
const newUser = reactive({
  username: "",
  is_admin: false,
});
const newUserErrors = reactive({
  username: "",
});

const editingUser = ref<UserInfo | null>(null);
const originalUser = ref<UserInfo | null>(null);
const userToDelete = ref<UserInfo | null>(null);

// Table headers
const headers = [
  { title: "Username", key: "username", sortable: true },
  { title: "Role", key: "is_admin", sortable: true, width: "100" },
  { title: "Search Permissions", key: "search_permissions_on_base_uris", sortable: false },
  { title: "Register Permissions", key: "register_permissions_on_base_uris", sortable: false },
  { title: "Actions", key: "actions", sortable: false, width: "100" },
];

// Computed
const currentUsername = computed(() => auth.username);

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;
  const query = searchQuery.value.toLowerCase();
  return users.value.filter(user =>
    user.username.toLowerCase().includes(query)
  );
});

const availableBaseUris = computed(() => baseUris.value);

// Methods
function formatUri(uri: string): string {
  // Extract just the bucket/path part for display
  return uri.replace(/^s3:\/\//, "").split("/")[0] || uri;
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
    baseUris.value = baseUriList.map(b => b.base_uri);
  } catch (e) {
    console.error("Failed to load user data:", e);
    error.value = "Failed to load user data. Please try again.";
  } finally {
    loading.value = false;
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

  if (users.value.some(u => u.username === newUser.username)) {
    newUserErrors.username = "Username already exists";
    return;
  }

  newUserErrors.username = "";
  saving.value = true;

  try {
    await dserverApi.createUser(newUser.username, { is_admin: newUser.is_admin });
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

function openEditDialog(user: UserInfo): void {
  originalUser.value = {
    ...user,
    search_permissions_on_base_uris: user.search_permissions_on_base_uris || [],
    register_permissions_on_base_uris: user.register_permissions_on_base_uris || [],
  };
  editingUser.value = {
    ...user,
    search_permissions_on_base_uris: [...(user.search_permissions_on_base_uris || [])],
    register_permissions_on_base_uris: [...(user.register_permissions_on_base_uris || [])],
  };
  showEditDialog.value = true;
}

function closeEditDialog(): void {
  showEditDialog.value = false;
  editingUser.value = null;
  originalUser.value = null;
}

async function saveUser(): Promise<void> {
  if (!editingUser.value || !originalUser.value) return;

  saving.value = true;

  try {
    const username = editingUser.value.username;

    // Update admin status if changed
    if (editingUser.value.is_admin !== originalUser.value.is_admin) {
      await dserverApi.updateUserAdmin(username, editingUser.value.is_admin);
    }

    // Update search permissions
    const addedSearchPerms = editingUser.value.search_permissions_on_base_uris.filter(
      uri => !originalUser.value!.search_permissions_on_base_uris.includes(uri)
    );
    const removedSearchPerms = originalUser.value.search_permissions_on_base_uris.filter(
      uri => !editingUser.value!.search_permissions_on_base_uris.includes(uri)
    );

    for (const uri of addedSearchPerms) {
      await dserverApi.grantSearchPermission(username, uri);
    }
    for (const uri of removedSearchPerms) {
      await dserverApi.revokeSearchPermission(username, uri);
    }

    // Update register permissions
    const addedRegisterPerms = editingUser.value.register_permissions_on_base_uris.filter(
      uri => !originalUser.value!.register_permissions_on_base_uris.includes(uri)
    );
    const removedRegisterPerms = originalUser.value.register_permissions_on_base_uris.filter(
      uri => !editingUser.value!.register_permissions_on_base_uris.includes(uri)
    );

    for (const uri of addedRegisterPerms) {
      await dserverApi.grantRegisterPermission(username, uri);
    }
    for (const uri of removedRegisterPerms) {
      await dserverApi.revokeRegisterPermission(username, uri);
    }

    notifications.success(`User "${username}" updated successfully`);
    closeEditDialog();
    await loadData();
  } catch (e) {
    console.error("Failed to update user:", e);
    notifications.error("Failed to update user. Please try again.");
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
    notifications.success(`User "${userToDelete.value.username}" deleted successfully`);
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
