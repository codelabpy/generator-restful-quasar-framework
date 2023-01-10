<template lang="pug">
//-
  c-input: Componente que encapsula funcionalidades similares para todos los q-input de la app
          a fin de conseguir una mayor reutilización de código
  Author: Pedro Flores
  Fecha: 2022-08-25

q-input(
  :label='label ? `${label}${required ? " *" : ""}` : null'
  :maxlength='maxLength ? maxLength : null'
  :rules='validationRules')
  template(v-if='hint' v-slot:hint) {{ hint }}

</template>

<script setup>
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
  maxLength: {
    type: Number,
    default: null
  },
  minLength: {
    type: Number,
    default: null
  }
})
// TODO: Delete this comment when vue-eslint-parser is >= v9.0.0
// eslint-disable-next-line no-unused-vars
const validationRules = [
  val => !(props.required && !val) || i18n.global.t('cinput_validation_required'),
  val => !(props.minLength && val && typeof val === 'string' && val.length < props.minLength) || `Cantidad de caracteres no puede ser menor a ${props.minLength}`
]
</script>
