<template>
  <q-layout view="lHh Lpr lFf">
    <!-- HEADER -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title>User Management</q-toolbar-title>
        <q-space />
        <q-btn flat icon="logout" label="Logout" @click="logout" />
      </q-toolbar>
    </q-header>

    <!-- SIDEBAR -->
    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered>
      <q-list>
        <q-item clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>
          <q-item-section>Dashboard</q-item-section>
        </q-item>
        <q-item clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="group" />
          </q-item-section>
          <q-item-section>Users</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- MAIN CONTENT -->
    <q-page-container>
      <q-page class="q-pa-md">

        <!-- REGISTER OR EDIT FORM -->
        <q-card class="q-pa-md q-mb-md">
          <q-card-section>
            <div class="text-h6">{{ editUserId ? 'Edit User' : 'Register User' }}</div>

            <q-form @submit.prevent="editUserId ? updateUser(editUserId) : registerUser" class="q-gutter-md">
              <q-input filled label="Email" v-model="form.email" type="email" required />
              <q-input filled label="Password" v-model="form.password" :disable="editUserId !== null" :required="!editUserId" type="password" />

              <q-select filled label="Role" v-model="form.role" :options="roleOptions" required />

              <q-input
                v-if="form.role === 'simple'"
                filled
                label="Master ID"
                v-model="form.master_id"
                required
              />

              <div class="row q-col-gutter-sm">
                <div class="col">
                  <q-btn
                    :label="editUserId ? 'Update' : 'Register'"
                    color="primary"
                    type="submit"
                    class="full-width"
                  />
                </div>
                <div class="col" v-if="editUserId">
                  <q-btn
                    label="Cancel"
                    color="negative"
                    flat
                    class="full-width"
                    @click="cancelEdit"
                  />
                </div>
              </div>
            </q-form>

            <q-banner v-if="message" :class="messageClass" class="q-mt-md">
              {{ message }}
            </q-banner>
          </q-card-section>
        </q-card>

        <!-- USER LIST -->
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">User List</div>
            <q-table
              :rows="users"
              :columns="columns"
              row-key="id"
              flat
              bordered
              separator="horizontal"
              :pagination="{ rowsPerPage: 10 }"
            >
              <template #body-cell-actions="props">
                <q-td class="q-gutter-sm">
                  <q-btn icon="edit" dense flat color="primary" @click="startEdit(props.row)" />
                  <q-btn icon="delete" dense flat color="negative" @click="deleteUser(props.row.id)" />
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>

      </q-page>
    </q-page-container>
  </q-layout>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from 'src/boot/supabase'

interface User {
  id: string
  email: string
  role: 'master' | 'simple'
  master_id?: string | null
}

const form = ref({ email: '', password: '', role: '', master_id: '' })
const users = ref<User[]>([])
const message = ref('')
const messageClass = ref('bg-green-1 text-green-10')
const editUserId = ref<string | null>(null)
const leftDrawerOpen = ref(true)

const roleOptions = ['master', 'simple']

const columns = [
  { name: 'email', label: 'Email', field: 'email' },
  { name: 'role', label: 'Role', field: 'role' },
  { name: 'master_id', label: 'Master ID', field: 'master_id' },
  { name: 'actions', label: 'Actions', field: 'actions', sortable: false },
]

async function fetchUsers() {
  const { data, error } = await supabase.from('users').select('*')
  if (!error) users.value = data as User[]
}

async function registerUser() {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: form.value.email,
    password: form.value.password,
  })
  if (authError || !authData.user?.id) {
    message.value = authError?.message || 'Auth failed'
    messageClass.value = 'bg-red-1 text-red-10'
    return
  }

  const { error: dbError } = await supabase.from('users').insert({
    id: authData.user.id,
    email: form.value.email,
    role: form.value.role,
    master_id: form.value.role === 'simple' ? form.value.master_id : null,
  })

  if (dbError) {
    message.value = dbError.message
    messageClass.value = 'bg-red-1 text-red-10'
  } else {
    message.value = 'User registered successfully'
    messageClass.value = 'bg-green-1 text-green-10'
    resetForm()
    await fetchUsers()
  }
}

function startEdit(user: User) {
  editUserId.value = user.id
  form.value = {
    email: user.email,
    password: '', // not editable during edit
    role: user.role,
    master_id: user.master_id || '',
  }
}

function cancelEdit() {
  resetForm()
  editUserId.value = null
}

async function updateUser(id: string) {
  const { error } = await supabase.from('users')
    .update({
      email: form.value.email,
      role: form.value.role,
      master_id: form.value.role === 'simple' ? form.value.master_id : null,
    })
    .eq('id', id)

  if (error) {
    message.value = error.message
    messageClass.value = 'bg-red-1 text-red-10'
  } else {
    message.value = 'User updated successfully'
    messageClass.value = 'bg-green-1 text-green-10'
    resetForm()
    editUserId.value = null
    await fetchUsers()
  }
}

async function deleteUser(id: string) {
  const { error } = await supabase.from('users').delete().eq('id', id)
  if (error) {
    message.value = error.message
    messageClass.value = 'bg-red-1 text-red-10'
  } else {
    message.value = 'User deleted.'
    messageClass.value = 'bg-green-1 text-green-10'
    await fetchUsers()
  }
}

function resetForm() {
  form.value = { email: '', password: '', role: '', master_id: '' }
}

async function logout() {
  await supabase.auth.signOut()
  // location.reload()
}

onMounted(fetchUsers)
</script>
<style scoped>
.q-form .q-input, .q-select {
  width: 100%;
}
</style>
