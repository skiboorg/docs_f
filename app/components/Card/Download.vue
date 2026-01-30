<script setup lang="ts">

import type {IDocumentResponseResult} from "~/repository/document/types";

const props = defineProps<{
  item: IDocumentResponseResult
}>()

const {$api} = useNuxtApp()
const toast = useToast()
const selectedVersions = ref<string[]>([])
const downloading = ref(false)
const isExpanded = ref(false) // Состояние аккордеона

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

const emits= defineEmits(['need_update'])

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

// Переключение аккордеона
const toggleAccordion = () => {
  isExpanded.value = !isExpanded.value
}
const updateVersion = async (payload) => {
  await $api.document.version_update(payload)
  emits('need_update')
}
</script>

<template>
  <div class="bg-white border rounded-xl p-4 grid grid-cols-1 md:flex gap-4 items-start">
    <div class="hidden md:block">
      <i class="pi pi-copy text-2xl"></i>
    </div>
    <div class="grow-[0] md:grow-[1]">
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
        <!-- Заголовок аккордеона -->
        <div
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
            @click="toggleAccordion"
        >
          <div class="flex items-center gap-2">
            <i :class="['pi', isExpanded ? 'pi-chevron-down' : 'pi-chevron-right']"></i>
            <span class="font-medium">
              Версии ({{ item.versions.length }})
              <span v-if="selectedVersions.length > 0" class="text-green-600">
                - Выбрано: {{ selectedVersions.length }}
              </span>
            </span>
          </div>
        </div>

        <!-- Содержимое аккордеона -->
        <transition
            enter-active-class="transition-all duration-300 ease-out"
            leave-active-class="transition-all duration-200 ease-in"
            enter-from-class="opacity-0 max-h-0"
            enter-to-class="opacity-100 max-h-[2000px]"
            leave-from-class="opacity-100 max-h-[2000px]"
            leave-to-class="opacity-0 max-h-0"
        >
          <div v-show="isExpanded" class="overflow-hidden">
            <div class="pt-3">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <Checkbox
                      v-model="allSelected"
                      :binary="true"
                      inputId="select-all"
                  />
                  <label for="select-all" class="font-medium cursor-pointer text-sm">
                    Выбрать все ({{ selectedVersions.length }}/{{ item.versions.length }})
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
                          icon="pi pi-check"
                          severity="info"
                          @click="updateVersion({uuid:version.uuid,is_current:!version.is_current})"
                          :outlined="!version.is_current"
                      />

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
        </transition>
      </div>
    </div>
  </div>
</template>


<!--<script setup lang="ts">-->

<!--import type {IDocumentResponseResult} from "~/repository/document/types";-->

<!--const props = defineProps<{-->
<!--  item: IDocumentResponseResult-->
<!--}>()-->

<!--const {$api} = useNuxtApp()-->
<!--const toast = useToast()-->
<!--const selectedVersions = ref<string[]>([])-->
<!--const downloading = ref(false)-->

<!--// Проверяем, все ли версии выбраны-->
<!--const allSelected = computed({-->
<!--  get: () => selectedVersions.value.length === props.item.versions.length,-->
<!--  set: (value) => {-->
<!--    if (value) {-->
<!--      selectedVersions.value = props.item.versions.map(v => v.uuid)-->
<!--    } else {-->
<!--      selectedVersions.value = []-->
<!--    }-->
<!--  }-->
<!--})-->

<!--// Скачивание выбранных версий-->
<!--const downloadSelected = async () => {-->
<!--  if (selectedVersions.value.length === 0) {-->
<!--    toast.add({-->
<!--      severity: 'warn',-->
<!--      summary: 'Предупреждение',-->
<!--      detail: 'Выберите хотя бы одну версию для скачивания',-->
<!--      life: 3000-->
<!--    })-->
<!--    return-->
<!--  }-->

<!--  downloading.value = true-->
<!--  console.log(selectedVersions.value)-->

<!--  try{-->

<!--    const raw = await $api.document.download_versions({version_uuids:selectedVersions.value})-->

<!--// 🔥 Оборачиваем в настоящий Blob-->
<!--    const blob = new Blob([raw], { type: 'application/zip' })-->

<!--    if (blob) {-->
<!--      const url = window.URL.createObjectURL(blob)-->

<!--      const a = document.createElement('a')-->
<!--      a.href = url-->
<!--      a.download = `test.zip`-->

<!--      document.body.appendChild(a)-->
<!--      a.click()-->

<!--      a.remove()-->
<!--      window.URL.revokeObjectURL(url)-->
<!--    }-->
<!--  }catch(error){-->
<!--    console.log(error)-->
<!--  }finally{-->
<!--    downloading.value = false-->
<!--  }-->
<!--  try {-->
<!--    toast.add({-->
<!--      severity: 'success',-->
<!--      summary: 'Успешно',-->
<!--      detail: `Скачивание ${selectedVersions.value.length} файлов начато`,-->
<!--      life: 3000-->
<!--    })-->

<!--    selectedVersions.value = []-->
<!--  } catch (error) {-->
<!--    toast.add({-->
<!--      severity: 'error',-->
<!--      summary: 'Ошибка',-->
<!--      detail: 'Не удалось скачать файлы',-->
<!--      life: 3000-->
<!--    })-->
<!--  } finally {-->
<!--    downloading.value = false-->
<!--  }-->
<!--}-->

<!--// Просмотр файла-->
<!--const viewFile = (fileUrl: string) => {-->
<!--  window.open(fileUrl, '_blank')-->
<!--}-->
<!--</script>-->

<!--<template>-->
<!--  <div class="bg-white border rounded-xl p-4 grid grid-cols-1 md:flex gap-4 items-start">-->
<!--    <div class="hidden md:block">-->
<!--      <i class="pi pi-copy text-2xl"></i>-->
<!--    </div>-->
<!--    <div class="grow-[0] md:grow-[1] ">-->
<!--      <div class="grid grid-cols-1 md:flex flex-wrap justify-between gap-3 mb-2">-->
<!--        <p class="font-medium text-lg">{{ item.document_type_name || 'Без типа' }}</p>-->
<!--        <Button-->
<!--            v-if="selectedVersions.length > 0"-->
<!--            size="small"-->
<!--            severity="success"-->
<!--            icon="pi pi-download"-->
<!--            class="w-[190px]"-->
<!--            :loading="downloading"-->
<!--            @click="downloadSelected"-->
<!--            label="Скачать выбранное"-->
<!--        />-->
<!--      </div>-->
<!--      <div class="flex gap-2 items-center text-gray-500 mb-2">-->
<!--        <i class="pi pi-building"></i>-->
<!--        <p>{{ item.company?.company_type?.name }} "{{ item.company?.name }}"-->
<!--          •-->
<!--          ИНН: {{ item.company.inn }}</p>-->
<!--      </div>-->

<!--      <div class="">-->
<!--        <div class="flex items-center justify-between mb-2">-->
<!--          <div class="flex items-center gap-2">-->
<!--            <Checkbox-->
<!--                v-model="allSelected"-->
<!--                :binary="true"-->
<!--                inputId="select-all"-->
<!--            />-->
<!--            <label for="select-all" class="font-medium cursor-pointer">-->
<!--              Версии ({{ selectedVersions.length }}/{{ item.versions.length }})-->
<!--            </label>-->
<!--          </div>-->


<!--        </div>-->

<!--        <div v-for="version in item.versions" :key="version.uuid" class="border-b last:border-b-0 py-2">-->
<!--          <div class="grid grid-cols-1 md:grid-cols-12 gap-2">-->
<!--            <div class="grid-cols-12 md:col-span-8 flex items-start gap-2">-->
<!--              <Checkbox-->
<!--                  v-model="selectedVersions"-->
<!--                  :value="version.uuid"-->
<!--                  :inputId="version.uuid"-->
<!--              />-->
<!--              <div class="flex-1">-->
<!--                <p class="text-sm font-medium mb-1 whitespace-normal break-words overflow-wrap-anywhere break-all">-->
<!--                  {{ decodeURIComponent(version.file?.split('/').pop() || 'Файл') }}-->
<!--                </p>-->
<!--                <div class="flex items-center gap-3 text-xs text-gray-500">-->
<!--                  <span>-->
<!--                    <i class="pi pi-calendar"></i>-->
<!--                    {{ new Date(version.upload_date).toLocaleDateString() }}-->
<!--                  </span>-->
<!--                  <span>{{ version.file_size }}</span>-->
<!--                  <span v-if="version.status_display" class="px-2 py-1 bg-gray-100 rounded">-->
<!--                    {{ version.status_display }}-->
<!--                  </span>-->
<!--                </div>-->
<!--              </div>-->
<!--            </div>-->
<!--            <div class="grid-cols-12 md:col-span-4">-->
<!--              <div class="flex items-center gap-2 w-full md:justify-end">-->
<!--                <Button-->
<!--                    size="small"-->
<!--                    outlined-->
<!--                    icon="pi pi-eye"-->
<!--                    severity="secondary"-->
<!--                    @click="viewFile(version.file)"-->
<!--                />-->
<!--                <Button-->
<!--                    size="small"-->
<!--                    severity="info"-->
<!--                    icon="pi pi-download"-->
<!--                    @click="selectedVersions = [version.uuid]; downloadSelected()"-->
<!--                />-->
<!--              </div>-->
<!--            </div>-->
<!--          </div>-->
<!--        </div>-->
<!--      </div>-->
<!--    </div>-->
<!--  </div>-->
<!--</template>-->