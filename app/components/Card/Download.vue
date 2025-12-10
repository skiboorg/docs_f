<script setup lang="ts">

import type {IDocumentResponseResult} from "~/repository/document/types";

const props = defineProps<
    {
      item:IDocumentResponseResult
    }
>()
</script>

<template>
<div class="bg-white border rounded-xl p-4 flex gap-4 items-start">
  <div >
    <i class="pi pi-copy text-2xl"></i>
  </div>
  <div class="grow-[1]">
    <div class="flex gap-3 mb-2">
      <p class="font-medium text-lg">{{item.name}} ({{item.document_type_name}})</p>
      <Chip class="bg-green-400 p-1 text-sm items-center" label="Утвержден" icon="pi pi-check" />
    </div>
    <div class="flex gap-2 items-center text-gray-500 mb-2">
      <i class="pi pi-building "></i>
      <p>{{item.company.company_type.name}} "{{item.company.name}}"
        •
        ИНН: {{item.company.inn}}</p>
    </div>

    <div class="">
      <p class="mb-2">Версии</p>
      <div v-for="version in item.versions">
        <p class="text-sm text-gray-500 mb-2">{{version.file.split('/').reverse()[0]}}</p>
        <p class="text-sm text-gray-500">{{new Date(version.upload_date).toLocaleDateString()}} • {{version.file_size}}</p>
      </div>
    </div>


  </div>
  <div class="flex gap-2">
    <Button size="small" outlined severity="secondary" label="Просмотр"/>
    <Button size="small" severity="info" icon="pi pi-download" label="Скачать"/>
  </div>
</div>
</template>

<style scoped>

</style>