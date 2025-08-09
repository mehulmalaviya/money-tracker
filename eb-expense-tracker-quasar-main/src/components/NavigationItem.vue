<template>
  <q-item
    clickable
    v-ripple
    :active="isActive"
    active-class="nav-item-active"
    @click="handleClick"
    class="nav-item"
  >
    <q-item-section avatar>
      <q-icon :name="item.icon" class="nav-icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label class="nav-label">{{ item.label }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

interface NavigationItem {
  name: string;
  label: string;
  icon: string;
  route: string;
}

interface Props {
  item: NavigationItem;
}

interface Emits {
  (e: 'navigate', route: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const route = useRoute();

const isActive = computed(() => {
  return route.path === props.item.route;
});

function handleClick() {
  emit('navigate', props.item.route);
}
</script>

<style lang="scss" scoped>
.nav-item {
  border-radius: 8px;
  margin: 0.25rem 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(59, 130, 246, 0.1);
  }

  .nav-icon {
    color: #6b7280;
    transition: color 0.2s ease;
  }

  .nav-label {
    color: #374151;
    font-weight: 500;
    transition: color 0.2s ease;
  }

  &.nav-item-active {
    background: rgba(59, 130, 246, 0.1);
    border-left: 3px solid #3b82f6;

    .nav-icon {
      color: #3b82f6;
    }

    .nav-label {
      color: #3b82f6;
      font-weight: 600;
    }
  }
}
</style>