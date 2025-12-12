<script setup lang="ts">
import { useConfirm } from "primevue/useconfirm";
const {pagePermissions} = usePagePermissions()
const confirm = useConfirm();

interface Props {
  label?:string
  icon?:string
  message?:string
  severity?:string
  loading?:boolean
  text?:boolean
  check_role_permission?:boolean
}


const props = withDefaults(defineProps<Props>(),{
  icon: '',
  check_role_permission:true
})

const emits = defineEmits<{
  confirm: null
}>()

const confirmObj = (event) => {
  confirm.require({
    target: event.currentTarget,
    message: props.message || 'Вы уверены?',
    icon: 'pi pi-exclamation-triangle',
    rejectClass: 'p-button-secondary p-button-outlined p-button-sm',
    acceptClass: 'p-button-sm p-button-danger',
    rejectLabel: 'Нет',
    acceptLabel: 'Да',
    accept: () => {
      emits('confirm')
    },
    reject: () => {
      console.log('reject')
    }
  });
};
const is_show = computed(()=>{
  if (props.check_role_permission){
    return pagePermissions.value.can_delete
  } else {
    return true
  }
})
</script>

<template>
  <ConfirmPopup></ConfirmPopup>
  <Button
          v-if="is_show"
          @click="confirmObj($event)"
          :text = "!props.text"
          :severity="props.severity || 'danger'"
          :size="props.label ? '' :'small'"
          :icon="props.icon"
          :loading="loading"
          :label="props.label"
  />
</template>

