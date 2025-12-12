<script setup lang="ts">

import type { IDocumentType,IDocumentTag } from '~/repository/document/types'
import type { ICompanyType } from '~/repository/company/types'
import { useToast } from 'primevue/usetoast';
const toast = useToast()

const { $api } = useNuxtApp()

// Props и emits
const props = defineProps<{
  docType?: IDocumentType | null
  loading?: boolean
  is_edit_mode?: boolean
}>()

const emits = defineEmits(['created','cancel'])

// Тип для формы
interface FormData {
  id?: string
  name: string
  slug: string
  aliases_ids: number[]
  applicable_company_type_ids: number[]
}

// Реактивные данные
const formData = reactive<FormData>({
  name: '',
  slug: '',
  aliases_ids: [],
  applicable_company_type_ids: []
})

// Опции для селектов

const documentTags = ref<IDocumentTag[]>([])
const companyTypes = ref<ICompanyType[]>([])
const tagsLoading = ref(false)
const companyTypesLoading = ref(false)

// Состояние UI
const showPreview = ref(false)
const showTagDialog = ref(false)
const newTagName = ref('')

// Вычисляемые свойства
const isNameValid = computed(() => formData.name.trim().length > 0)
const isFormValid = computed(() => isNameValid.value && formData.slug)

const selectedTagsNames = computed(() => {
  return formData.aliases_ids.map(tagId =>
      documentTags.value.find(tag => tag.id === tagId)?.name || `Тег #${tagId}`
  )
})

const selectedCompanyTypesNames = computed(() => {
  return formData.applicable_company_type_ids.map(companyTypeId =>
      companyTypes.value.find(ct => ct.id === companyTypeId)?.name || `Тип #${companyTypeId}`
  )
})

// Методы
const getTagName = (tagId: number) => {
  const tag = documentTags.value.find(t => t.id === tagId)
  return tag?.name || `Тег #${tagId}`
}

const getCompanyTypeName = (companyTypeId: number) => {
  const companyType = companyTypes.value.find(ct => ct.id === companyTypeId)
  return companyType?.name || `Тип #${companyTypeId}`
}

const loadDocumentTags = async () => {
  try {
    tagsLoading.value = true
    // Предполагаем, что есть endpoint для получения тегов
    documentTags.value = await $api.document.tags()
  } catch (error) {
    console.error('Ошибка загрузки тегов:', error)
  } finally {
    tagsLoading.value = false
  }
}

const loadCompanyTypes = async () => {
  try {
    companyTypesLoading.value = true
    // Предполагаем, что есть endpoint для получения типов компаний
    companyTypes.value = await $api.company.types()
  } catch (error) {
    console.error('Ошибка загрузки типов компаний:', error)
  } finally {
    companyTypesLoading.value = false
  }
}

const createTag = async () => {
  if (!newTagName.value.trim()) return

  try {
    const newTag = await $api.document.create_tag({ name: newTagName.value })
    documentTags.value.push(newTag)
    formData.aliases_ids.push(newTag.id)
    newTagName.value = ''
    showTagDialog.value = false
  } catch (error) {
    console.error('Ошибка создания тега:', error)
  }
}
const { pending, send, form } = useForm({
  apiFn: props.is_edit_mode ? $api.document.update_type :$api.document.create_type,
  formData: formData,
  asFormData: false,
  onSuccess: async (res)=>{
    console.log(res);
    toast.add({ severity: 'success',summary:'Успешно', detail:props.is_edit_mode ? 'Тип изменен':'Тип создан' , life: 3000 });
    emits('created')
  }
})
const handleSubmit = async () => {
  if (!isFormValid.value) return

  const submitData: FormData = {
    name: formData.name.trim(),
    aliases_ids: [...formData.aliases_ids],
    applicable_company_type_ids: [...formData.applicable_company_type_ids]
  }
  await send()

}

// Инициализация формы при изменении props.docType
watch(() => props.docType, (docType) => {
  if (docType) {
    formData.id = docType.id
    formData.name = docType.name
    formData.slug = docType.slug
    formData.aliases_ids = docType.aliases_ids || docType.aliases.map(tag => tag.id)
    formData.applicable_company_type_ids = docType.applicable_company_type_ids ||
        docType.applicable_company_types.map(ct => ct.id)
  } else {
    // Сброс формы
    Object.assign(formData, {
      name: '',
      aliases_ids: [],
      applicable_company_type_ids: []
    })
  }
}, { immediate: true })

// Загрузка справочников при монтировании
onMounted(async () => {
  await Promise.all([
    loadDocumentTags(),
    loadCompanyTypes()
  ])
})
</script>

<template>
  {{is_edit_mode}}
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div class="grid md:grid-cols-2 gap-6">
      <!-- Основная информация -->
      <div class="space-y-4">
        <h4 class="font-semibold text-gray-900">Основная информация</h4>

        <div class="field">
          <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
            Название типа документа *
          </label>
          <InputText
              id="name"
              v-model="formData.name"
              class="w-full"
              placeholder="Выписка из ЕГРЮЛ"
              :invalid="!isNameValid"
              required
          />
          <small v-if="!isNameValid" class="p-error text-xs">
            Название обязательно
          </small>
        </div>
        <div class="field">
          <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
            Код типа *
          </label>
          <InputText
              id="name"
              v-model="formData.slug"
              class="w-full"
              placeholder="Код"

              required
          />
          <small v-if="!isNameValid" class="p-error text-xs">
            Название обязательно
          </small>
        </div>

        <!-- Алиасы (теги) -->
        <div class="field">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Алиасы (теги)
          </label>
          <MultiSelect
              v-model="formData.aliases_ids"
              :options="documentTags"
              optionLabel="name"
              optionValue="id"
              placeholder="Выберите теги"
              :filter="true"
              class="w-full"
              :loading="tagsLoading"
          >
            <template #value="slotProps">
              <div v-if="slotProps.value && slotProps.value.length" class="flex flex-wrap gap-1">
                <Chip
                    v-for="tagId in slotProps.value"
                    :key="tagId"
                    :label="getTagName(tagId)"
                    class="text-xs"
                />
              </div>
              <span v-else class="text-gray-400">
                Теги не выбраны
              </span>
            </template>
          </MultiSelect>
          <div class="flex justify-end mt-1">
            <Button
                type="button"
                icon="pi pi-plus"
                label="Создать тег"
                class="p-button-text p-button-sm"
                @click="showTagDialog = true"
            />
          </div>
        </div>
      </div>

      <!-- Типы компаний -->
      <div class="space-y-4">
        <h4 class="font-semibold text-gray-900">Настройки</h4>

        <!-- Применимые типы компаний -->
        <div class="field">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Применимые типы компаний
          </label>
          <MultiSelect
              v-model="formData.applicable_company_type_ids"
              :options="companyTypes"
              optionLabel="name"
              optionValue="id"
              placeholder="Выберите типы компаний"
              :filter="true"
              class="w-full"
              :loading="companyTypesLoading"
          >
            <template #value="slotProps">
              <div v-if="slotProps.value && slotProps.value.length" class="flex flex-wrap gap-1">
                <Chip
                    v-for="companyTypeId in slotProps.value"
                    :key="companyTypeId"
                    :label="getCompanyTypeName(companyTypeId)"
                    class="text-xs bg-green-100 text-green-800"
                />
              </div>
              <span v-else class="text-gray-400">
                Типы компаний не выбраны
              </span>
            </template>
          </MultiSelect>
          <small class="text-gray-500 text-xs block mt-1">
            Документ будет доступен для выбранных типов компаний
          </small>
        </div>
      </div>
    </div>



    <!-- Кнопки действий -->
    <div class="flex justify-between gap-3 pt-4 border-t">

      <div class="flex gap-3">
        <Button
            type="button"
            label="Отмена"
            class="p-button-text p-button-secondary"
            @click="$emit('cancel')"
            :disabled="loading"
        />
        <Button
            type="submit"
            :label="props.docType ? 'Сохранить' : 'Добавить'"
            class="p-button-primary"
            :loading="loading"
            :disabled="!isFormValid || loading"
        />
      </div>
    </div>
  </form>

  <!-- Диалог создания тега -->
  <Dialog
      v-model:visible="showTagDialog"
      header="Создать тег"
      :style="{ width: '400px' }"
      :modal="true"
  >
    <div class="space-y-4">
      <InputText
          v-model="newTagName"
          placeholder="Название тега"
          class="w-full"
          @keyup.enter="createTag"
      />
      <div class="flex justify-end gap-2">
        <Button label="Отмена" class="p-button-text" @click="showTagDialog = false" />
        <Button label="Создать" class="p-button-primary" @click="createTag" />
      </div>
    </div>
  </Dialog>
</template>


<style scoped>
.field {
  @apply space-y-1;
}

:deep(.p-multiselect) {
  width: 100%;
}

:deep(.p-chips) {
  width: 100%;
}

:deep(.p-multiselect-token) {
  @apply text-xs;
}

.preview-chip {
  @apply text-xs px-2 py-1 rounded-full;
}
</style>