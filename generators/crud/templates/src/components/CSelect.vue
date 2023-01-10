<template lang="pug">
//-
  c-select: Componente que encapsula funcionalidades similares para todos los q-select de la app
          a fin de conseguir una mayor reutilizacion de código
  Author: Pedro Flores
  Fecha: 2022-07-22

q-select(:options="csoptions" :label='label ? `${label}${required ? " *" : ""}` : null' :rules='validationRules')

</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import { i18n } from 'boot/i18n'

const props = defineProps({
  hint: {
    type: String,
    default: () => i18n.global.t('cinput_hint')
  },
  label: {
    type: String,
    default: null
  },
  required: {
    type: Boolean,
    default: null
  },
  path: {
    type: String,
    default: null
  }
})

const csoptions = ref([])

onMounted(async _ => {
  if (props.path) {
    try {
      const response = await api.get(props.path)
      csoptions.value = response.data.items
    } catch (error) {
      console.log(error)
    }
  }
})

// TODO: Delete this comment when vue-eslint-parser is >= v9.0.0
// eslint-disable-next-line no-unused-vars
const validationRules = [
  val => !(props.required && !val) || i18n.global.t('cinput_validation_required')
]
</script>
