<script setup lang="ts">
const {pagePermissions} = usePagePermissions()
interface Props {
  label?:string
  icon?:string
  loading?:boolean
}

const props = withDefaults(defineProps<Props>(),{
  icon: 'pi pi-plus',
})

</script>

<template>
<!--  v-if="user.role?.permission?.can_add"-->

  <Button
          v-if="pagePermissions.can_add"
          :loading="loading"
          :size="props.label ? '' :'small'"
          :icon="props.icon"
          :label="props.label"
          severity="success"></Button>
</template>
