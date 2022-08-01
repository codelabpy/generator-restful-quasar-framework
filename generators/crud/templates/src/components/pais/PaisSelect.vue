<template lang="pug">
//-
  pais-select: Componente reutilizable para seleccionar Pais
  Author: Pedro Flores
  Fecha: 2022-07-24

c-select(path="/pais" label="Seleccione un País *"
  option-value="id" option-label="nombre" emit-value map-options)

</template>
