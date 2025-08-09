<template>
  <q-form @submit="handleSubmit" class="category-form">
    <div class="form-grid">
      <div class="form-group">
        <q-input
          v-model="formData.name"
          :label="$t('categories.categoryName')"
          :error="!!errors.name"
          :error-message="errors.name"
          outlined
          dense
          class="ui-input"
        />
      </div>

      <div class="form-group">
        <q-select
          v-model="formData.category_type"
          :options="categoryTypeOptions"
          :label="$t('categories.categoryType')"
          :error="!!errors.category_type"
          :error-message="errors.category_type"
          outlined
          dense
          option-value="value"
          option-label="label"
          emit-value
          map-options
          class="ui-select"
        />
      </div>

      <div class="form-group">
        <q-select
          v-model="formData.icon"
          :options="iconOptions"
          :label="$t('categories.icon')"
          :error="!!errors.icon"
          :error-message="errors.icon"
          outlined
          dense
          option-value="value"
          option-label="label"
          emit-value
          map-options
          class="ui-select"
        >
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section avatar>
                <q-icon :name="scope.opt.value" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ scope.opt.label }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>

          <template v-slot:selected>
            <div v-if="formData.icon" class="selected-icon">
              <q-icon :name="formData.icon" class="q-mr-sm" />
              {{ iconOptions.find((opt) => opt.value === formData.icon)?.label }}
            </div>
          </template>
        </q-select>
      </div>

      <div class="form-group">
        <q-input
          v-model="formData.color"
          :label="$t('categories.color')"
          :error="!!errors.color"
          :error-message="errors.color"
          outlined
          dense
          class="ui-input"
        >
          <template v-slot:append>
            <q-icon name="palette" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-color
                  v-model="formData.color"
                  format-model="hex"
                  default-value="#1976D2"
                  class="color-picker"
                />
              </q-popup-proxy>
            </q-icon>
          </template>

          <template v-slot:prepend>
            <div class="color-preview" :style="{ backgroundColor: formData.color }"></div>
          </template>
        </q-input>
      </div>

      <div class="preview-section">
        <div class="preview-label">Preview:</div>
        <div class="category-preview">
          <q-avatar :color="formData.color || '#1976D2'" text-color="white" size="48px">
            <q-icon color="black" :name="formData.icon || 'category'" size="24px" />
          </q-avatar>
          <div class="preview-details">
            <span class="preview-name">{{ formData.name || 'Category Name' }}</span>
            <span class="preview-type">{{ getTypeLabel(formData.category_type) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="form-actions">
      <q-btn
        type="button"
        :label="$t('common.cancel')"
        color="grey-6"
        outline
        @click="$emit('cancel')"
        class="ui-button"
      />
      <q-btn
        type="submit"
        :label="$t('common.save')"
        color="primary"
        :loading="loading"
        class="ui-button"
      />
    </div>
  </q-form>
</template>

<script setup lang="ts">
import { categorySchema, type CategoryForm } from 'src/schemas';
import type { Category } from 'src/types';
import { computed, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

interface Props {
  category?: Category | undefined | null;
  loading?: boolean;
}

interface Emits {
  (e: 'submit', data: CategoryForm): void;
  (e: 'cancel'): void;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<Emits>();
const { t } = useI18n();

const formData = reactive<CategoryForm>({
  name: props.category?.name || '',
  icon: props.category?.icon || 'category',
  color: props.category?.color || '#1976D2',
  category_type: props.category?.category_type || 'expense',
});

const errors = ref<Partial<Record<keyof CategoryForm, string>>>({});

const categoryTypeOptions = [
  { label: t('categories.expense'), value: 'expense' },
  { label: t('categories.income'), value: 'income' },
  { label: t('categories.both'), value: 'both' },
];

const iconOptions = computed(() => {
  const baseIcons = [
    { label: 'Category', value: 'category' },
    { label: 'Shopping', value: 'shopping_cart' },
    { label: 'Food & Dining', value: 'restaurant' },
    { label: 'Transportation', value: 'directions_car' },
    { label: 'Entertainment', value: 'movie' },
    { label: 'Bills & Utilities', value: 'receipt' },
    { label: 'Healthcare', value: 'local_hospital' },
    { label: 'Education', value: 'school' },
    { label: 'Travel', value: 'flight' },
    { label: 'Home', value: 'home' },
    { label: 'Work', value: 'work' },
    { label: 'Sports', value: 'sports_soccer' },
    { label: 'Technology', value: 'computer' },
    { label: 'Clothing', value: 'checkroom' },
    { label: 'Gifts', value: 'card_giftcard' },
    { label: 'Pets', value: 'pets' },
  ];

  const incomeIcons = [
    { label: 'Salary', value: 'work' },
    { label: 'Freelance', value: 'laptop' },
    { label: 'Business', value: 'business' },
    { label: 'Investment', value: 'trending_up' },
    { label: 'Rental', value: 'home' },
    { label: 'Interest', value: 'account_balance' },
    { label: 'Dividend', value: 'paid' },
    { label: 'Bonus', value: 'star' },
    { label: 'Wallet', value: 'account_balance_wallet' },
  ];

  if (formData.category_type === 'income') {
    return [...incomeIcons, ...baseIcons];
  } else if (formData.category_type === 'both') {
    return [...baseIcons, ...incomeIcons];
  } else {
    return baseIcons;
  }
});

function getTypeLabel(type: string): string {
  const option = categoryTypeOptions.find((opt) => opt.value === type);
  return option ? option.label : type;
}

function validateForm() {
  try {
    categorySchema.parse(formData);
    errors.value = {};
    return true;
  } catch (error) {
    if (error instanceof Error) {
      const zodError = JSON.parse(error.message);
      errors.value = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      zodError.forEach((err: any) => {
        errors.value[err.path[0] as keyof CategoryForm] = err.message;
      });
    }
    return false;
  }
}

function handleSubmit() {
  if (validateForm()) {
    emit('submit', { ...formData });
  }
}
</script>

<style lang="scss" scoped>
.category-form {
  .form-grid {
    display: grid;
    gap: 1.5rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
  }

  .ui-input,
  .ui-select {
    :deep(.q-field__control) {
      border-radius: 6px;
    }
  }

  .selected-icon {
    display: flex;
    align-items: center;
  }

  .color-preview {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    border: 1px solid #e0e0e0;
  }

  .color-picker {
    width: 200px;
  }

  .preview-section {
    margin-top: 1rem;
    padding: 1rem;
    background: #f5f5f5;
    border-radius: 8px;

    .preview-label {
      font-weight: 600;
      color: #374151;
      margin-bottom: 0.75rem;
    }

    .category-preview {
      display: flex;
      align-items: center;
      gap: 1rem;

      .preview-details {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;

        .preview-name {
          font-weight: 500;
          color: #1f2937;
        }

        .preview-type {
          font-size: 0.875rem;
          color: #6b7280;
          text-transform: capitalize;
        }
      }
    }
  }

  .form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 2rem;

    .ui-button {
      border-radius: 6px;
      text-transform: none;
      font-weight: 500;
      min-width: 100px;
    }
  }
}
</style>
