<script setup lang="ts">
import {usePagePermissions} from "~/composables/usePagePermissions";

const {pagePermissions} = usePagePermissions()
interface Props {
  label?:string
  icon?:string
}

const props = withDefaults(defineProps<Props>(),{
  icon: 'pi pi-eye',
})


</script>

<template>
  <!--  v-if="user.role?.permission?.can_add"-->
  <Button
      v-if="pagePermissions.can_view"
      :size="props.size ? '' :'small'"
      :icon="props.icon"
      :label="props.label"
      severity="secondary"></Button>
</template>

