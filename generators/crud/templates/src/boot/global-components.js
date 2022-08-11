import { boot } from 'quasar/wrappers'
import CTable from '../components/CTable.vue'
import CSelect from '../components/CSelect.vue'
import CDate from '../components/CDate.vue'

export default boot(async ({ app }) => {
  app.component('CTable', CTable)
  app.component('CSelect', CSelect)
  app.component('CDate', CDate)
})
