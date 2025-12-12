<script setup lang="ts">
const {pagePermissions} = usePagePermissions()
</script>

<template>
  <Button v-if="pagePermissions.can_edit"
          text
          severity="secondary"
          size="small"
          icon="pi pi-pencil"/>
</template>
