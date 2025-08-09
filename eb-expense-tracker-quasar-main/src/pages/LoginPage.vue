<template>
  <q-layout view="lHh lpr lFf" class="login-layout">
    <q-page-container>
      <q-page class="flex flex-center login-page">
        <q-card class="login-card shadow-24">
          <q-card-section class="text-center">
            <q-icon name="account_circle" size="64px" color="primary" />
            <h1 class="text-h5 q-mt-md">{{ $t('auth.login') }}</h1>
            <p class="text-subtitle2 text-grey-6">Welcome back to Expense Tracker</p>
          </q-card-section>

          <q-form @submit.prevent="handleLogin" class="q-gutter-md q-pa-md">
            <q-input
              v-model="formData.email"
              :label="$t('auth.email')"
              :error="!!errors.email"
              :error-message="errors.email"
              type="email"
              dense
              outlined
              rounded
              clearable
              class="ui-input"
            >
              <template #prepend>
                <q-icon name="email" />
              </template>
            </q-input>

            <q-input
              v-model="formData.password"
              :label="$t('auth.password')"
              :error="!!errors.password"
              :error-message="errors.password"
              :type="showPassword ? 'text' : 'password'"
              dense
              outlined
              rounded
              clearable
              class="ui-input"
            >
              <template #prepend>
                <q-icon name="lock" />
              </template>
              <template #append>
                <q-icon
                  :name="showPassword ? 'visibility' : 'visibility_off'"
                  class="cursor-pointer"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>

            <div class="text-center q-mt-md">
              <q-btn
                type="submit"
                :label="$t('auth.loginButton')"
                color="primary"
                :loading="authStore.loading"
                :disable="!formData.email || !formData.password"
                unelevated
                rounded
                class="full-width"
              />
            </div>
          </q-form>

          <q-separator class="q-my-md" />

          <div class="text-center text-caption text-grey-7 q-mb-sm">
            <q-btn
              label="Use Demo Credentials"
              flat
              size="sm"
              color="secondary"
              @click="fillDemoCredentials"
            />
          </div>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>
<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';
import { loginSchema, type LoginForm } from 'src/schemas';

const router = useRouter();
const authStore = useAuthStore();

const formData = reactive<LoginForm>({
  email: '',
  password: '',
});

const errors = ref<Partial<Record<keyof LoginForm, string>>>({});
const showPassword = ref(false);

function validateForm() {
  try {
    loginSchema.parse(formData);
    errors.value = {};
    return true;
  } catch (error) {
    if (error instanceof Error) {
      // const zodError = JSON.parse(error.message);
      // errors.value = {};
      // zodError.forEach((err:) => {
      //   errors.value[err.path[0] as keyof LoginForm] = err.message;
      // });
    }
    return false;
  }
}

async function handleLogin() {
  if (!validateForm()) return;
  const result = await authStore.login(formData.email, formData.password);
  if (result?.role === 'master') {
    void router.push('/admin');
  } else {
    void router.push('/dashboard');
  }
}

function fillDemoCredentials() {
  formData.email = 'demo@example.com';
  formData.password = 'demopass';
}
</script>
<style lang="scss" scoped>
.login-layout {
  background: linear-gradient(145deg, #e0f2f1, #ffffff);
  min-height: 100vh;
}

.login-page {
  padding: 2rem;
  background: radial-gradient(circle at top left, #827f7f 0%, #148796 100%);
}

.login-card {
  width: 100%;
  max-width: 420px;
  border-radius: 12px;
  animation: fadeInUp 0.4s ease-out;
  background-color: #ffffff;
}

.ui-input {
  :deep(.q-field__control) {
    border-radius: 10px;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

