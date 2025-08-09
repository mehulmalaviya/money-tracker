/* eslint-disable @typescript-eslint/no-empty-object-type */
import { boot } from 'quasar/wrappers';
import { createI18n } from 'vue-i18n';
import { LocalStorage } from 'quasar';

import en from 'src/i18n/en-US';
import gu from 'src/i18n/gu-IN';

export type MessageLanguages = keyof typeof en;
export type MessageSchema = typeof en;

declare module 'vue-i18n' {
  export interface DefineLocaleMessage extends MessageSchema {}
  export interface DefineDateTimeFormat {}
  export interface DefineNumberFormat {}
}

// Get saved language or default to 'en'
const savedLanguage = LocalStorage.getItem('app-language') || 'en';

export default boot(({ app }) => {
  const i18n = createI18n({
    locale: savedLanguage as string,
    legacy: false,
    globalInjection: true,
    messages: {
      en,
      gu,
    },
  });

  // Save language changes to localStorage
  const { locale } = i18n.global;

  // Watch for locale changes and persist them
  if (typeof window !== 'undefined') {
    let originalLocale = locale.value;
    Object.defineProperty(locale, 'value', {
      get() {
        return originalLocale;
      },
      set(newValue) {
        originalLocale = newValue;
        LocalStorage.set('app-language', newValue);
      },
    });
  }

  app.use(i18n);
});
