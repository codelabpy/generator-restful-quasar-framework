<template lang="pug">
//-
  c-select: Componente que encapsula funcionalidades similares para todos los q-select de la app
          a fin de conseguir una mayor reutilizacion de código
  Author: Pedro Flores
  Fecha: 2022-07-22

q-select(:options="csoptions")

</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'

const props = defineProps({
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
</script>
