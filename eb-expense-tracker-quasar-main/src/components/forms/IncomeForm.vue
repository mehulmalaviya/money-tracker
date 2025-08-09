<template>
  <q-form @submit="handleSubmit" class="income-form">
    <div class=" q-gutter-md">
      <div class="col-12">
        <q-input
          v-model="formData.title"
          label="Income Title"
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
          label="Amount"
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
          :options="incomeCategoryOptions"
          label="Category"
          :error="!!errors.category_id"
          :error-message="errors.category_id"
          option-value="value"
          option-label="label"
          emit-value
          map-options
          outlined
          dense
          clearable
          class="ui-select"
        />
      </div>

      <div class="col-12 col-md-6">
        <q-input
          v-model="formData.date"
          label="Date"
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
          label="Description"
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
        label="Cancel"
        color="grey-6"
        outline
        @click="$emit('cancel')"
        class="ui-button"
      />
      <q-btn type="submit" label="Save" color="positive" :loading="loading" class="ui-button" />
    </div>
  </q-form>
</template>

<script setup lang="ts">
import { incomeSchema, type IncomeForm } from 'src/schemas';
import { useCategoriesStore } from 'src/stores/categories';
import type { Income } from 'src/types';
import { computed, onMounted, reactive, ref } from 'vue';

interface Props {
  income?: Income | undefined | null;
  loading?: boolean;
}

interface Emits {
  (e: 'submit', data: IncomeForm): void;
  (e: 'cancel'): void;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<Emits>();

const categoriesStore = useCategoriesStore();

const formData = reactive<IncomeForm>({
  title: props.income?.title || '',
  amount: props.income?.amount || 0,
  category_id: props.income?.category_id || '',
  date: props.income?.date || new Date().toISOString().split('T')[0] || new Date().toISOString(),
  description: props.income?.description || '',
});

const errors = ref<Partial<Record<keyof IncomeForm, string>>>({});

const incomeCategoryOptions = computed(() => {
  const incomeCategories = categoriesStore.categories.filter(
    (category) => category.category_type === 'income' || category.category_type === 'both',
  );

  return incomeCategories.map((category) => ({
    label: category.name,
    value: category.id,
  }));
});

function validateForm() {
  try {
    incomeSchema.parse(formData);
    errors.value = {};
    return true;
  } catch (error) {
    if (error instanceof Error) {
      const zodError = JSON.parse(error.message);
      errors.value = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      zodError.forEach((err: any) => {
        errors.value[err.path[0] as keyof IncomeForm] = err.message;
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

onMounted(() => {
  if (categoriesStore.categories.length === 0) {
    void categoriesStore.fetchCategories();
  }
});
</script>

<style lang="scss" scoped>
.income-form {
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
