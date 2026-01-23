<script setup lang="ts">

import type {IDocumentResponseResult} from "~/repository/document/types";

const props = defineProps<{
  item: IDocumentResponseResult
}>()

const {$api} = useNuxtApp()
const toast = useToast()
const selectedVersions = ref<string[]>([])
const downloading = ref(false)

// Проверяем, все ли версии выбраны
const allSelected = computed({
  get: () => selectedVersions.value.length === props.item.versions.length,
  set: (value) => {
    if (value) {
      selectedVersions.value = props.item.versions.map(v => v.uuid)
    } else {
      selectedVersions.value = []
    }
  }
})

// Скачивание выбранных версий
const downloadSelected = async () => {
  if (selectedVersions.value.length === 0) {
    toast.add({
      severity: 'warn',
      summary: 'Предупреждение',
      detail: 'Выберите хотя бы одну версию для скачивания',
      life: 3000
    })
    return
  }

  downloading.value = true
  console.log(selectedVersions.value)

  try{

    const raw = await $api.document.download_versions({version_uuids:selectedVersions.value})

// 🔥 Оборачиваем в настоящий Blob
    const blob = new Blob([raw], { type: 'application/zip' })

    if (blob) {
      const url = window.URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = url
      a.download = `test.zip`

      document.body.appendChild(a)
      a.click()

      a.remove()
      window.URL.revokeObjectURL(url)
    }
  }catch(error){
    console.log(error)
  }finally{
    downloading.value = false
  }
  try {
    // Вариант 1: Скачать каждый файл отдельно
    // for (const versionUuid of selectedVersions.value) {
    //   const version = props.item.versions.find(v => v.uuid === versionUuid)
    //   if (version?.file) {
    //     const link = document.createElement('a')
    //     link.href = version.file
    //     link.download = decodeURIComponent(version.file.split('/').pop() || 'document')
    //     link.click()
    //   }
    // }

    // Вариант 2: Если у вас есть API для массового скачивания (ZIP)
    // const response = await $api.document.downloadMultiple({
    //   version_uuids: selectedVersions.value
    // })
    // const link = document.createElement('a')
    // link.href = response.download_url
    // link.download = 'documents.zip'
    // link.click()

    toast.add({
      severity: 'success',
      summary: 'Успешно',
      detail: `Скачивание ${selectedVersions.value.length} файлов начато`,
      life: 3000
    })

    selectedVersions.value = []
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Не удалось скачать файлы',
      life: 3000
    })
  } finally {
    downloading.value = false
  }
}

// Просмотр файла
const viewFile = (fileUrl: string) => {
  window.open(fileUrl, '_blank')
}
</script>

<template>
  <div class="bg-white border rounded-xl p-4 grid grid-cols-1 md:flex gap-4 items-start">
    <div class="hidden md:block">
      <i class="pi pi-copy text-2xl"></i>
    </div>
    <div class="grow-[0] md:grow-[1] ">
      <div class="grid grid-cols-1 md:flex flex-wrap justify-between gap-3 mb-2">
        <p class="font-medium text-lg">{{ item.document_type_name || 'Без типа' }}</p>
        <Button
            v-if="selectedVersions.length > 0"
            size="small"
            severity="success"
            icon="pi pi-download"
            class="w-[190px]"
            :loading="downloading"
            @click="downloadSelected"
            label="Скачать выбранное"
        />
      </div>
      <div class="flex gap-2 items-center text-gray-500 mb-2">
        <i class="pi pi-building"></i>
        <p>{{ item.company?.company_type?.name }} "{{ item.company?.name }}"
          •
          ИНН: {{ item.company.inn }}</p>
      </div>

      <div class="">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <Checkbox
                v-model="allSelected"
                :binary="true"
                inputId="select-all"
            />
            <label for="select-all" class="font-medium cursor-pointer">
              Версии ({{ selectedVersions.length }}/{{ item.versions.length }})
            </label>
          </div>


        </div>

        <div v-for="version in item.versions" :key="version.uuid" class="border-b last:border-b-0 py-2">
          <div class="grid grid-cols-1 md:grid-cols-12 gap-2">
            <div class="grid-cols-12 md:col-span-8 flex items-start gap-2">
              <Checkbox
                  v-model="selectedVersions"
                  :value="version.uuid"
                  :inputId="version.uuid"
              />
              <div class="flex-1">
                <p class="text-sm font-medium mb-1 whitespace-normal break-words overflow-wrap-anywhere break-all">
                  {{ decodeURIComponent(version.file?.split('/').pop() || 'Файл') }}
                </p>
                <div class="flex items-center gap-3 text-xs text-gray-500">
                  <span>
                    <i class="pi pi-calendar"></i>
                    {{ new Date(version.upload_date).toLocaleDateString() }}
                  </span>
                  <span>{{ version.file_size }}</span>
                  <span v-if="version.status_display" class="px-2 py-1 bg-gray-100 rounded">
                    {{ version.status_display }}
                  </span>
                </div>
              </div>
            </div>
            <div class="grid-cols-12 md:col-span-4">
              <div class="flex items-center gap-2 w-full md:justify-end">
                <Button
                    size="small"
                    outlined
                    icon="pi pi-eye"
                    severity="secondary"
                    @click="viewFile(version.file)"
                />
                <Button
                    size="small"
                    severity="info"
                    icon="pi pi-download"
                    @click="selectedVersions = [version.uuid]; downloadSelected()"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>