<template lang="pug">

q-layout.bg-grey-1.text-blue-gray-10(view="hHh lpr fFf")

  q-header.text-white(bordered)
    q-toolbar.q-py-sm
      q-btn(dense flat round icon="menu" @click="toggleLeftDrawer")
      q-toolbar-title <%=projectNameTitleCase%>
      q-btn(color="secondary" label="Salir" @click="logout")

  q-drawer(bordered side="left" v-model="leftDrawerOpen")
    q-list
      q-item-label(header) Menú
      MenuLinks(v-for="link in menuLinks" :key="link.title" v-bind="link")

  q-page-container
    router-view

</template>

<script>
import MenuLinks from 'components/MenuLinks.vue'
import auth from 'src/auth'
import constants from 'src/constants'

const menuLinks = [
  {
    title: 'Inicio',
    icon: 'home',
    route: '/'
  }
]

export default {
  components: { MenuLinks },

  data () {
    return {
      leftDrawerOpen: false,
      user: null,
      menuLinks
    }
  },

  created () {
    this.user = auth.currentUser
  },

  methods: {
    toggleLeftDrawer () {
      this.leftDrawerOpen = !this.leftDrawerOpen
    },
    logout () {
      auth.logout()
      this.$router.push(constants.AUTH_URL)
    }

  }

}

</script>
