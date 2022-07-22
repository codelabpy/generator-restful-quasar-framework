import { boot } from 'quasar/wrappers'
import CTable from '../components/CTable.vue'

export default boot(async ({ app }) => {
  app.component('CTable', CTable)
})
