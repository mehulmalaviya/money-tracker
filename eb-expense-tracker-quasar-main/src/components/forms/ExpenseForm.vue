<template>
  <q-form @submit="handleSubmit" class="expense-form">
    <div class="q-gutter-md">
      <div class="col-12">
        <q-input
          v-model="formData.title"
          :label="$t('expenses.expenseTitle')"
          :error="!!errors.title"
          :error-message="errors.title"
          outlined
          dense
          class="ui-input"
        />
      </div>

      <div class="col-12 col-md-6">
        <q-input
          v-model.number="formData.amount"
          :label="$t('expenses.amount')"
          :error="!!errors.amount"
          :error-message="errors.amount"
          type="number"
          step="0.01"
          min="0"
          outlined
          dense
          class="ui-input"
        />
      </div>

      <div class="col-12 col-md-6">
        <q-select
          v-model="formData.category_id"
          :options="categoryOptions"
          :label="$t('expenses.category')"
          :error="!!errors.category_id"
          :error-message="errors.category_id"
          option-value="value"
          option-label="label"
          emit-value
          map-options
          outlined
          dense
          class="ui-select"
        />
      </div>

      <div class="col-12 col-md-6">
        <q-input
          v-model="formData.date"
          :label="$t('expenses.date')"
          :error="!!errors.date"
          :error-message="errors.date"
          type="date"
          outlined
          dense
          class="ui-input"
        />
      </div>

      <div class="col-12">
        <q-input
          v-model="formData.description"
          :label="$t('expenses.description')"
          :error="!!errors.description"
          :error-message="errors.description"
          type="textarea"
          rows="3"
          outlined
          dense
          class="ui-input"
        />
      </div>
    </div>

    <div class="row q-gutter-sm q-mt-lg justify-end">
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
import { ref, reactive, computed, onMounted } from 'vue';
import { expenseSchema, type ExpenseForm } from 'src/schemas';
import { useCategoriesStore } from 'src/stores/categories';
import type { Expense } from 'src/types';

interface Props {
  expense?: Expense | undefined | null;
  loading?: boolean;
}

interface Emits {
  (e: 'submit', data: ExpenseForm): void;
  (e: 'cancel'): void;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<Emits>();

const categoriesStore = useCategoriesStore();

const formData = reactive<ExpenseForm>({
  title: props.expense?.title || '',
  amount: props.expense?.amount || 0,
  category_id: props.expense?.category_id || '',
  date: props.expense?.date || new Date().toISOString().split('T')[0] || new Date().toISOString(),
  description: props.expense?.description || '',
});

const errors = ref<Partial<Record<keyof ExpenseForm, string>>>({});

const categoryOptions = computed(() =>
  categoriesStore.categories.map((category) => ({
    label: category.name,
    value: category.id,
  })),
);

function validateForm() {
  try {
    expenseSchema.parse(formData);
    errors.value = {};
    return true;
  } catch (error) {
    if (error instanceof Error) {
      const zodError = JSON.parse(error.message);
      errors.value = {};
      zodError.forEach((err: { path: string[]; message: string }) => {
        errors.value[err.path[0] as keyof ExpenseForm] = err.message;
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

onMounted(async () => {
  if (categoriesStore.categories.length === 0) {
    await categoriesStore.fetchCategories();
  }
});
</script>

<style lang="scss" scoped>
.expense-form {
  .ui-input,
  .ui-select {
    :deep(.q-field__control) {
      border-radius: 6px;
    }
  }

  .ui-button {
    border-radius: 6px;
    text-transform: none;
    font-weight: 500;
  }
}
</style>
