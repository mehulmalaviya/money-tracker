<template>
    <div class="ui-card">
      <div v-if="$slots.header" class="ui-card__header">
        <slot name="header" />
      </div>
      <div class="ui-card__content">
        <slot />
      </div>
      <div v-if="$slots.footer" class="ui-card__footer">
        <slot name="footer" />
      </div>
    </div>
  </template>
  
  <style lang="scss" scoped>
  .ui-card {
    background: white;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    overflow: hidden;
  
    &__header {
      padding: 0 1.5rem 0 1.5rem;
      border-bottom: 1px solid #e2e8f0;
    }
  
    &__content {
      padding: 1.5rem;
    }
  
    &__footer {
      padding: 0 1.5rem 1.5rem 1.5rem;
      border-top: 1px solid #e2e8f0;
    }
  }
  </style>