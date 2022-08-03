<template lang="pug">
//-
  CTable: Component que encapsula funcionalidades similares para todos los q-table de la app
          a fin de conseguir una mayor reutilizacion de código
  Author: Pedro Flores
  Fecha: 2022-07-20

q-table(
  :title="title"
  :rows="rows"
  :columns="columns"
  row-key="name"
  no-data-label="No hay datos"
  no-results-label="El filtro no encontró resultados"
  :loading="loading"
  :loading-label="'Cargando...'"
  v-model:pagination="pagination"
  :filter="filter"
)
  template(v-slot:top-left)
    .row
      q-icon(v-if="icon" :name="icon" size="1.5rem")
      .q-pl-md.q-table__title {{ title }}
  template(v-slot:top-right)
    .col-9
      q-input(borderless dense debounce="300" v-model="filter" placeholder="Buscar" filled color="positive" )
        template(v-slot:append)
          q-icon(name="search")
    .row.col-3
      q-btn(@click="$emit('add')" color="positive" icon="add" round flat)
        q-tooltip Nuevo
  template(v-slot:body="props")
    q-tr(:props="props")
      q-td(v-for="col in props.cols" :key="col.name" :props="props")
        template(v-if="col.name === 'action'")
          q-btn(@click="editClicked(props.row)" color="positive" icon="edit" round flat dense)
            q-tooltip Edit
          q-btn(@click="viewClicked(props.row)" color="positive" icon="remove_red_eye" round flat dense)
            q-tooltip Visualizar
        template(v-else) {{ col.value }}
  template(v-slot:no-data="{ icon, message, filter }")
    .full-width.row.flex-center.q-gutter-sm
      span {{ message }}
      q-icon(size="2em" :name="filter ? 'filter_b_and_w' : icon")
</template>

<script>
import { ref } from 'vue'

export default {
  props: {
    title: {
      type: String,
      default: null
    },
    icon: {
      type: String,
      default: 'home'
    },
    rows: {
      type: Array,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    },
    columns: {
      type: Object,
      default: null
    }
  },
  emits: ['add', 'edit', 'view', 'request'],
  setup(_, ctx) {
    const filter = ref('')
    const pagination = ref(null)

    const editClicked = (row) => {
      ctx.emit('edit', row)
    }

    const viewClicked = (row) => {
      ctx.emit('view', row)
    }

    return {
      pagination,
      filter,
      editClicked,
      viewClicked
    }
  }
}
</script>
