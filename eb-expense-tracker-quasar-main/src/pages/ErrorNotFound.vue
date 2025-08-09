<template>
  <q-page class="error-page flex flex-center">
    <div class="error-content text-center">
      <div class="error-illustration">
        <q-icon name="error_outline" size="8rem" color="grey-4" />
      </div>

      <h1 class="error-title">404</h1>
      <h2 class="error-subtitle">Page Not Found</h2>
      <p class="error-description">The page you're looking for doesn't exist or has been moved.</p>

      <div class="error-actions">
        <q-btn
          label="Go to Dashboard"
          color="primary"
          size="lg"
          @click="$router.push('/dashboard')"
          class="error-button"
        />

        <q-btn
          label="Go Back"
          color="grey-6"
          size="lg"
          outline
          @click="$router.go(-1)"
          class="error-button"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
// 404 Error page
</script>

<style lang="scss" scoped>
.error-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.error-content {
  max-width: 500px;
  padding: 2rem;

  .error-illustration {
    margin-bottom: 2rem;
  }

  .error-title {
    font-size: 6rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0;
    line-height: 1;
  }

  .error-subtitle {
    font-size: 2rem;
    font-weight: 600;
    color: #374151;
    margin: 1rem 0;
  }

  .error-description {
    font-size: 1.1rem;
    color: #6b7280;
    margin: 1.5rem 0 2rem 0;
    line-height: 1.6;
  }

  .error-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;

    .error-button {
      border-radius: 8px;
      text-transform: none;
      font-weight: 600;
      min-width: 140px;
    }
  }
}
</style>
