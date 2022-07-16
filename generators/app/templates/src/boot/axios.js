import { LocalStorage, Notify } from 'quasar'
import { boot } from 'quasar/wrappers'
import axios from 'axios'
import constants from 'src/constants'
import auth from 'src/auth'

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create({ baseURL: constants.CONSULTAS_BACKEND_URL, withCredentials: true })

export default boot(({ app, router }) => {
  api.defaults.headers.common.Authorization = `Bearer ${auth.accessToken}`

  api.interceptors.request.use(
    async config => {
      const token = LocalStorage.getItem(constants.AUTH_ACCESS_TOKEN_KEY)
      if (config.url !== '/login' && !token) {
        Notify.create({
          type: 'warning',
          message: 'Sesión expirada, por favor ingrese sus credenciales nuevamente'
        })
        auth.logout()
        router.push(constants.AUTH_URL)
      }
      return config
    })

  api.interceptors.response.use(
    response => response,
    error => {
      if (auth.isTokenError(error)) {
        Notify.create({
          type: 'warning',
          message: 'Sesión expirada, por favor ingrese sus credenciales nuevamente'
        })
        auth.logout()
        router.push(constants.AUTH_URL)
        return new Promise(() => {})
      } else {
        return Promise.reject(error)
      }
    })

  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
})

export { api }
