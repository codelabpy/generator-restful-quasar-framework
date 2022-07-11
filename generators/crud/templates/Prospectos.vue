<template lang="pug">
q-page(padding)

  // Vista de listado
  section(v-if="view === 'list'")
    .q-pa-md
      q-table(
        title="Prospecto"
        :rows="rows"
        :columns="columns"
        @request="onRequest"
        row-key="name"
        no-data-label="No hay datos"
        no-results-label="El filtro no encontró resultados"
        :loading="loading"
        :loading-label="'Cargando...'"
        v-model:pagination="pagination"
        :filter="filter"
      )
        template(v-slot:top-right)
          .col-9
            q-input(borderless dense debounce="300" v-model="filter" placeholder="Buscar" filled color="positive" )
              template(v-slot:append)
                q-icon(name="search")
          .row.col-3
            q-btn(@click="newProspect()" color="positive" icon="add" round flat)
              q-tooltip Nuevo
        template(v-slot:body="props")
          q-tr(:props="props")
            q-td(v-for="col in props.cols" :key="col.name" :props="props")
              template(v-if="col.name === 'action'")
                q-btn(@click="viewProspect(props.row)" color="positive" icon="remove_red_eye" round flat dense)
                  q-tooltip Visualizar
                q-btn(@click="verifyProspect(props.row)" color="positive" icon="done" round flat dense)
                  q-tooltip Verificar
              template(v-else) {{ col.value }}
        template(v-slot:no-data="{ icon, message, filter }")
          .full-width.row.flex-center.q-gutter-sm
            span {{ message }}
            q-icon(size="2em" :name="filter ? 'filter_b_and_w' : icon")

  // Vista de creacion
  section(v-if="view === 'new'")
    q-card.avalon-card-page
      q-card-section
        .text-h6 Nuevo Prospecto
        .text-subtitle2 Complete los datos solicitados
      q-separator

      q-card-section.flex.flex-center
        q-card(flat bordered v-bind:style="{'width': '60%'}")
          q-card-section
            q-form(@submit="onSubmit" ref="prospectForm" class="q-gutter-md" color="positive")

              .row
                .col-4.q-pa-md
                  // Tipo de Documento
                  q-select(
                    bottom-slots v-model="prospecto.tipo_documento"
                    :options="tipoDocumentoList" option-value="id" option-label="valor"
                    @update:model-value="val => tipoDocumentoSelected = val" label="Tipo Documento"
                    class="q-mb-md" color="positive"
                  )

                .col-8.q-pa-md
                  // Documento
                  q-input(v-model="prospecto.ci" label="Número de documento *" color="positive"
                    lazy-rules class="q-mb-md" v-if="tipoDocumentoSelected?.valor === 'CI'"
                    :rules="[ val => val && val.length > 0 || 'Por favor, ingrese el número de documento']")
                    template(v-slot:hint) Ingrese el número de documento sin puntos decimales

                  // RUC
                  q-input(v-model="prospecto.ruc" label="RUC *" color="positive"
                    lazy-rules class="q-mb-md" v-if="tipoDocumentoSelected?.valor === 'RUC'"
                    :rules="[ val => val && val.length > 0 || 'Por favor, ingrese el RUC']")
                    template(v-slot:hint) Puede ser el RUC de la persona física o jurídica

              // Asesor
              q-select(
                bottom-slots v-model="prospecto.asesor_id"
                :options="asesorList" option-value="id" :option-label="opt => `${opt.nombres} ${opt.apelidos}`"
                label="Asesor *" class="q-mb-md" color="positive" emit-value map-options
              )

          q-separator

          q-card-actions(align="around")
            q-btn(@click="view = 'list'" flat) Volver
            q-btn(flat color="positive" @click.prevent="onSubmit" :loading="loading") Grabar

  // Vista de visualización
  section(v-if="view === 'view'")
    q-card.avalon-card-page
      q-card-section
        .text-h6 Visualizar Prospecto
        //.text-subtitle2 Complete los datos solicitados
      q-separator

      ProspectoView(:prospecto="prospecto")
      q-separator

      q-card-actions(align="around")
        q-btn(@click="view = 'list'" flat) Volver
        //q-btn(flat color="positive") Aceptar

  // Vista de verificacion
  section(v-if="view === 'verify'")
    q-card.avalon-card-page
      q-card-section
        .text-h6 Verificar Prospecto
        .text-subtitle2 Acciones sobre el prospecto
      q-separator

      q-card-section
        q-card(flat bordered)
          q-card-section
            pre {{ prospecto }}
            q-form(@submit="onSubmit" ref="prospectForm")
          q-separator

          q-card-actions(align="around")
            q-btn(@click="view = 'list'" flat) Volver
            q-btn(flat color="positive") Aceptar

</template>

<script>
import { date, useQuasar } from 'quasar'
import { onMounted, ref } from 'vue'
import { api } from 'boot/axios'
import ProspectoView from 'src/partials/ProspectoView.vue'

const columns = [
  {
    name: 'fecha_alta',
    label: 'Fecha de Alta',
    align: 'left',
    field: row => date.formatDate(row.fecha_alta, 'YYYY-MM-DD'),
    sortable: true
  },
  {
    name: 'tipo_documento',
    label: 'Tipo de Documento',
    align: 'left',
    field: row => row.tipo_documento?.valor,
    sortable: true
  },
  {
    name: 'ci',
    label: 'Documento',
    align: 'left',
    field: 'ci',
    sortable: true
  },
  {
    name: 'razon_social',
    label: 'Nombre / Razón Social',
    align: 'left',
    field: 'razon_social',
    sortable: true
  },
  {
    name: 'estado',
    label: 'Estado',
    align: 'left',
    field: row => row.estado_prospecto.valor,
    sortable: true
  },
  {
    name: 'usuario_alta',
    label: 'Usuario de alta',
    align: 'left',
    field: 'usuario_alta',
    sortable: true
  },
  {
    name: 'asesor',
    label: 'Asesor',
    align: 'left',
    field: row => `${row.asesor.nombres} ${row.asesor.apelidos}`,
    sortable: true
  },
  {
    name: 'action',
    align: 'center',
    label: 'Acciones',
    field: 'action'
  }
]

const clearProspecto = () => {
  return {
    tipo_documento: null,
    tipo_documento_id: null,
    ci: null,
    ruc: null,
    asesor_id: null
  }
}

export default {
  name: 'ProspectosPage',
  components: { ProspectoView },
  setup() {
    const $q = useQuasar()

    const view = ref('list')
    const rows = ref([])
    const filter = ref('')
    const loading = ref(false)
    const pagination = ref({
      sortBy: 'fecha_alta',
      descending: true,
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 0 // xx if getting data from a server
    })
    const prospecto = ref(clearProspecto())
    const asesorList = ref([])
    const tipoDocumentoList = ref([])
    const tipoDocumentoSelected = ref(null)

    const onRequest = (props) => {
      const { page, rowsPerPage, sortBy, descending } = props.pagination
      const filter = props.filter
      console.log(sortBy, descending)

      // Init loading
      loading.value = true

      // Merge params in object for backend
      const paramsBackend = { page, rowsPerPage, sortBy, descending, jsondepth: 1 }

      api.post('/search/prospecto', { ci: filter }, { params: paramsBackend })
        .then(response => {
          rows.value = response.data.items
          // Se configura paginacion
          pagination.value.page = page
          pagination.value.rowsPerPage = rowsPerPage
          pagination.value.sortBy = sortBy
          pagination.value.descending = descending
          pagination.value.rowsNumber = response.data.total
          // console.log(response.data)
        })
        .catch(() => {
          $q.notify({
            color: 'red-5',
            textColor: 'white',
            icon: 'warning',
            message: 'Ocurrió un error al obtener la lista de prospectos'
          })
        })
        // eslint-disable-next-line no-return-assign
        .finally(() =>
          // Finish loading
          loading.value = false
        )
    }

    const newProspect = () => {
      prospecto.value = clearProspecto()
      view.value = 'new'
    }

    const viewProspect = async (instance) => {
      prospecto.value = instance
      view.value = 'view'
    }

    const verifyProspect = (instance) => {
      prospecto.value = instance
      view.value = 'verify'
    }

    const onSubmit = () => {
      // Ajustes antes de la grabación
      prospecto.value.tipo_documento_id = prospecto.value.tipo_documento.id
      if (tipoDocumentoSelected.value.valor === 'RUC') {
        prospecto.value.ci = prospecto.value.ruc
      }
      console.log(prospecto.value)
      loading.value = true

      // TODO: sincronizar con respuesta del backend
      api.post('/prospecto', prospecto.value)
        .then(response => {
          // console.log(response.data)
          $q.notify({
            color: 'green-4',
            textColor: 'white',
            icon: 'cloud_done',
            message: 'El prospecto fue agregado'
          })
          // Se redirecciona a la lista de prospectos
          view.value = 'list'
          onRequest({
            pagination: pagination.value,
            filter: undefined
          })
        })
        .catch(() => {
          $q.notify({
            color: 'red-5',
            textColor: 'white',
            icon: 'warning',
            message: 'Ocurrió un error al grabar el prospecto'
          })
        })
        // eslint-disable-next-line no-return-assign
        .finally(() =>
          loading.value = false
        )
    }

    onMounted(async () => {
      onRequest({
        pagination: pagination.value,
        filter: undefined
      })

      // Se obtienen los datos de los selectores
      asesorList.value = (await api.get('/asesor', { params: { pagination: false } })).data
      tipoDocumentoList.value = (await api.post('/search/parametro', { dominio: 'tipo_documento' }, { params: { pagination: false } })).data
      // console.log(tipoDocumentoList.value)
    })

    return {
      view,
      columns,
      rows,
      filter,
      prospecto,
      loading,
      asesorList,
      tipoDocumentoList,
      tipoDocumentoSelected,
      pagination,
      newProspect,
      viewProspect,
      verifyProspect,
      onSubmit,
      onRequest
    }
  }
}
</script>
