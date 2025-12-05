<script setup>
const props = defineProps({
  status: {
    type: String,
    default: 'missing'
  }
})

const statusIcons = {
  obsolete: 'pi pi-exclamation-triangle',
  missing: 'pi pi-times-circle',
  approved: 'pi pi-check-circle',

}

const statusClasses = {
  obsolete: 'text-yellow-500',
  missing: 'text-red-500',
  approved: 'text-green-500',
}
</script>

<template>
  <i :class="[statusIcons[status], statusClasses[status]]" />
</template>