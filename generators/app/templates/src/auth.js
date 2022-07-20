import constants from './constants'
import { api } from './boot/axios'
import { LocalStorage } from 'quasar'

const auth = {
  currentUser: LocalStorage.getItem(constants.AUTH_USER_KEY),
  accessToken: LocalStorage.getItem(constants.AUTH_ACCESS_TOKEN_KEY),
  payload: undefined,
  login(username, password) {
    return api.post(constants.AUTH_URL, { username, password }).then(response => {
      this.currentUser = username
      this.accessToken = response.data.access_token
      this.payload = JSON.parse(atob(auth.accessToken.split('.')[1]))

      // Save to local storage in order to retrieve these values after page refresh
      LocalStorage.set(constants.AUTH_USER_KEY, username)
      LocalStorage.set(constants.AUTH_ACCESS_TOKEN_KEY, this.accessToken)

      // Update common Authorization header with the new access token
      api.defaults.headers.common.Authorization = `Bearer ${auth.accessToken}`

      return username
    }).catch(error => {
      if (error && error.response) {
        // Lets try to improve error messages to present them to the user
        switch (error.response.status) {
          case 400:
            return Promise.reject({
              message: 'Ingrese ambos datos, usuario y contraseña'
            })
          case 401:
            return Promise.reject({
              message: 'Usuario y/o password incorrectos'
            })
          default:
            return Promise.reject(error)
        }
      } else {
        return Promise.reject(error)
      }
    })
  },
  logout() {
    this.currentUser = undefined
    this.accessToken = undefined
    this.payload = undefined
    LocalStorage.clear()
    // LocalStorage.remove(constants.AUTH_ACCESS_TOKEN_KEY)
    // LocalStorage.remove(constants.AUTH_USER_KEY)
  },
  isTokenError(error) {
    return error.response &&
           error.response.status === 401 &&
           error.response.data &&
           error.response.data.error &&
           [
             'Token has expired',
             'Token has been revoked'
           ].includes(error.response.data.error)
  }
}
export default auth
