import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { LocalStorage } from 'quasar';

export const useLanguageStore = defineStore('language', () => {
  const { locale } = useI18n();
  const currentLanguage = ref<string>(LocalStorage.getItem('app-language') || 'en');

  function setLanguage(newLanguage: string) {
    currentLanguage.value = newLanguage;
    locale.value = newLanguage;
    LocalStorage.set('app-language', newLanguage);
  }

  function getCurrentLanguage() {
    return currentLanguage.value;
  }

  function getLanguageLabel(lang: string) {
    return lang === 'en' ? 'English' : 'ગુજરાતી';
  }

  return {
    currentLanguage,
    setLanguage,
    getCurrentLanguage,
    getLanguageLabel,
  };
});
