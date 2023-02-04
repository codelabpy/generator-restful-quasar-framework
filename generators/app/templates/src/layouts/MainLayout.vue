<template lang="pug">

q-layout.bg-grey-1.text-blue-gray-10(view="hHh lpr fFf")

  q-header.text-white(bordered)
    q-toolbar.q-gutter-md
      q-btn(dense flat round icon="menu" @click="toggleLeftDrawer")
      q-toolbar-title {{ $t('project_name') }}
      q-select(id='langSwitcher' style="min-width: 90px" label-color="white" :label="$t('general_language_label')"
        :options="$i18n.availableLocales" v-model="$i18n.locale" @update:modelValue="setLang")
      q-btn-dropdown(color='secondary' :label="user" icon="person")
        q-list
          q-item(clickable v-close-popup @click="logout")
            q-item-section(avatar)
              q-avatar(icon="logout" color="secondary" text-color="white")
            q-item-section
              q-item-label {{ $t('general_exit') }}

  q-drawer(bordered side="left" v-model="leftDrawerOpen" elevated)
    q-list(fixed)
      q-item-label(header) {{ $t('general_menu') }}
      MenuLinks(v-for="link in menuLinks" :key="link.title" v-bind="link")

  q-page-container
    router-view

</template>

<script>
import MenuLinks from 'components/MenuLinks.vue'
import auth from 'src/auth'
import constants from 'src/constants'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n.js'
import { useQuasar } from 'quasar'

export default {
  components: { MenuLinks },
  setup () {
    const $q = useQuasar()
    const router = useRouter()
    const route = useRoute()

    const leftDrawerOpen = ref(true)
    const user = ref(null)
    const actualPath = ref(null)

    const toggleLeftDrawer = () => {
      leftDrawerOpen.value = !leftDrawerOpen.value
    }

    const logout = () => {
      auth.logout()
      router.push({ path: constants.AUTH_URL })
    }

    onMounted(() => {
      user.value = auth.currentUser
    })

    watch(route, (to) => {
      actualPath.value = to.path
    }, { flush: 'pre', immediate: true, deep: true })

    const menuLinks = computed(() => [
      {
        title: i18n.global.t('general_start'),
        icon: 'home',
        permission: 'general',
        route: '/'
      }
    ])

    const setLang = (val) => {
      // TODO: This section needs some refactoring to avoid code duplication
      switch (val) {
        case 'es':
          import('quasar/lang/es').then(lang => { $q.lang.set(lang.default) })
          break
        default:
          import('quasar/lang/en-US').then(lang => { $q.lang.set(lang.default) })
          break
      }
    }

    return {
      setLang,
      leftDrawerOpen,
      user,
      menuLinks,
      toggleLeftDrawer,
      logout
    }
  }
}
</script>

<style>
#langSwitcher.q-field__native {
  color: white
}
</style>
