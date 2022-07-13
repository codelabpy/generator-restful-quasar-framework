<template lang="pug">
q-item(:to="route" clickable)
  q-item-section(avatar v-if="icon")
    q-icon(:name="icon")
  q-item-section
    q-item-label {{title}}
</template>

<script>

export default {
  name: 'MenuLinks',
  props: {
    title: {
      type: String,
      required: true
    },

    route: {
      type: String,
      default: ''
    },

    icon: {
      type: String,
      default: ''
    }
  }
}
</script>
