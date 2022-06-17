let CONSULTAS_BACKEND_URL
if (process.env.VUE_APP_BACKEND_URL) { CONSULTAS_BACKEND_URL = process.env.VUE_APP_BACKEND_URL } else { CONSULTAS_BACKEND_URL = 'http://localhost:5000' }

export default {
  CONSULTAS_BACKEND_URL,
  CONSULTAS_SUBPATH: process.env.VUE_APP_CONSULTAS_SUBPATH,
  AUTH_URL: '/login',
  ABOUT_URL: '/about',
  AUTH_ACCESS_TOKEN_KEY: 'access_token',
  AUTH_USER_KEY: 'current_user'

}
