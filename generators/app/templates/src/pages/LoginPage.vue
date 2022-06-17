<template lang="pug">
div.fullscreen.flex.flex-center
  div.q-pa-md.login-container
    q-form
      q-card.q-pa-lg
        h4.text-center.text-h4.no-margin.q-pb-sm <%=projectNameTitleCase%>
        h6.text-center.text-h6.no-margin.q-pb-lg Iniciar sesión
        div.q-gutter-md
          q-input.text-body1(v-model="username" type="text" outlined label="Username *")
          q-input.text-body1(v-model="password" type="password" outlined label="Password *")

        p.text-center.text-negative.text-body1.q-pt-md {{errorMessage}}
        div.text-center.q-pt-md
          q-btn(label="Login" color="primary" @click.prevent="login")
</template>

<script>
import auth from 'src/auth.js'
export default {
  data () {
    return {
      username: '',
      password: '',
      errorMessage: null,
      loginIn: false
    }
  },
  methods: {
    login () {
      this.loginIn = true
      auth.login(this.username, this.password).then(username => {
        this.$router.push('/')
        this.username = username
      }).catch(error => {
        this.errorMessage = error.message
      }).finally(() => {
        this.loginIn = false
      })
    }
  }
}
</script>

<style lang="scss">
.login-container {
  max-width: 500px;
  width: 50vw;
}

</style>
