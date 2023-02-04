import { createI18n } from 'vue-i18n'
import messages from 'src/i18n'

let i18n

export default ({ app }) => {
  // Create I18n instance
  i18n = createI18n({
    locale: 'es',
    globalInjection: true,
    messages,
    legacy: false
  })

  // Tell app to use the I18n instance
  app.use(i18n)
}

export { i18n }
