import { boot } from 'quasar/wrappers'
import auth from 'src/auth'
import constants from 'src/constants'

export default boot(({ router }) => {
  router.beforeEach((from, to, next) => {
    if (!auth.currentUser && ![constants.AUTH_URL].includes(from.path)) {
      next(constants.AUTH_URL)
    } else {
      next()
    }
  })
})
