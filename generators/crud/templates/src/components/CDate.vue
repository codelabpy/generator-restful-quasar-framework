<template lang="pug">
//-
  c-date: Componente que encapsula funcionalidades similares para todos los q-date de
           la app a fin de conseguir una mayor reutilizacion de código
  Author: Pedro Flores
  Fecha: 2022-08-07

q-input(:model-value='modelValue' mask='####-##-##' @update:modelValue='updateValue')
  template(v-slot:append)
    q-icon.cursor-pointer(name='event')
      q-popup-proxy(transition-show='scale' transition-hide='scale' cover)
        q-date(:model-value='modelValue' mask='YYYY-MM-DD' @update:modelValue='updateValue')
          .row.items-center.justify-end
            q-btn(v-close-popup label='Close' color='primary' flat)

</template>

<script>
import { date } from 'quasar'

export default {
  props: {
    modelValue: {
      type: String,
      default: date.formatDate(Date.now(), 'YYYY-MM-DD')
    }
  },
  emits: ['update:modelValue'],

  setup(_, context) {
    const updateValue = (nuvalue) => {
      context.emit('update:modelValue', nuvalue)
    }

    return {
      updateValue
    }
  }
}
</script>
