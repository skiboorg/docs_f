<script setup lang="ts">
import type { IDocumentType, IDocumentTag } from "~/repository/document/types";
import type { ICompanyType } from "~/repository/company/types";

const { pagePermissions } = usePagePermissions()
const { $api } = useNuxtApp()


// Реактивные переменные
const searchQuery = ref('')
const showDialog = ref(false)
const showAddDialog = ref(false)
const editingDocType = ref<IDocumentType | null>(null)

// Загрузка данных с типизацией
const { data: document_types, pending, error, refresh } = useHttpRequest(
    useAsyncData<IDocumentType[]>('document-types', () => $api.document.types()),
    'Ошибка при загрузке типов документов'
);

// Вычисляемые свойства
const filteredDocumentTypes = computed(() => {
  if (!document_types.value || !searchQuery.value) return document_types.value || []

  const query = searchQuery.value.toLowerCase()
  return document_types.value.filter(docType =>
      docType.name.toLowerCase().includes(query) ||
      docType.aliases.some((alias: IDocumentTag) =>
          alias.name.toLowerCase().includes(query)
      ) ||
      docType.applicable_company_types.some((companyType: ICompanyType) =>
          companyType.name.toLowerCase().includes(query)
      )
  )
})

const dialogHeader = computed(() =>
    editingDocType.value ? 'Редактировать тип документа' : 'Добавить тип документа'
)

// Методы
const editDocumentType = (docType: IDocumentType) => {
  editingDocType.value = {
    ...docType,
    aliases_ids: docType.aliases.map(alias => alias.id),
    applicable_company_type_ids: docType.applicable_company_types.map(ct => ct.id)
  }
  showDialog.value = true
}

const addDocumentType = () => {
  editingDocType.value = null
  showDialog.value = true
}

const handleFormSubmit = async (formData: any) => {
  try {
    if (editingDocType.value?.id) {
      // Обновление существующего типа
      const updated = await $api.document.update(editingDocType.value.id, formData)
      const index = document_types.value?.findIndex(d => d.id === editingDocType.value?.id)
      if (index !== -1 && document_types.value) {
        document_types.value[index] = updated
      }
    } else {
      // Создание нового типа
      const newDocType = await $api.document.create(formData)
      if (document_types.value) {
        document_types.value.push(newDocType)
      }
    }

    showDialog.value = false
    editingDocType.value = null
    refresh() // Обновляем данные с сервера
  } catch (err) {
    console.error('Ошибка сохранения:', err)
  }
}


const deleteDocumentType = async (id: number) => {
  try {
    await $api.document.delete_type(id)
    if (document_types.value) {
      document_types.value = document_types.value.filter(docType => docType.id !== id)
    }
    await refresh() // Обновляем данные с сервера
  } catch (err) {
    console.error('Ошибка удаления:', err)
  }
}

// Утилитные функции
const getAliasesString = (docType: IDocumentType): string => {
  return docType.aliases.map(alias => alias.name).join(', ')
}

const getCompanyTypesString = (docType: IDocumentType): string => {
  return docType.applicable_company_types.map(ct => ct.name).join(', ')
}

// Обработчики событий
watch(() => showAddDialog.value, (val) => {
  if (val) {
    addDocumentType()
    showAddDialog.value = false
  }
})
</script>

<template>
  <div class="max-w-6xl mx-auto">
    <!-- Заголовок -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Типы документов</h1>
      <p class="text-gray-600 text-lg">Справочник типов документов</p>
    </div>

    <!-- Панель действий -->
    <div class="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div class="flex justify-between items-center">
        <div class="flex items-center space-x-4">
          <InputText
              v-model="searchQuery"
              placeholder="Поиск по названию, тегам или типам компаний..."
              class="w-80"
          />


          <!-- Статистика -->
          <div class="text-sm text-gray-500">
            Найдено: {{ filteredDocumentTypes?.length || 0 }} из {{ document_types?.length || 0 }}
          </div>
        </div>

        <Button

            label="Добавить тип"
            icon="pi pi-plus"
            class="p-button-primary"
            @click="showAddDialog = true"
            :loading="pending"
        />
      </div>
    </div>

    <!-- Состояние загрузки -->
    <div v-if="pending" class="text-center py-10">
      <ProgressSpinner />
      <p class="mt-2 text-gray-500">Загрузка типов документов...</p>
    </div>

    <!-- Состояние ошибки -->
    <div v-else-if="error" class="text-center py-10">
      <i class="pi pi-exclamation-triangle text-red-500 text-4xl mb-4"></i>
      <p class="text-red-500 mb-4">Ошибка при загрузке данных</p>
      <Button label="Повторить" icon="pi pi-refresh" @click="refresh" />
    </div>

    <!-- Список типов документов -->
    <div v-else-if="filteredDocumentTypes && filteredDocumentTypes.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <Card
          v-for="docType in filteredDocumentTypes"
          :key="docType.id"
          class="hover:shadow-lg transition-shadow duration-200"
      >
        <template #title>
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">{{ docType.name }}</h3>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Код: {{ docType.slug }}</span>
              </div>
            </div>
            <div class="flex gap-2">
              <Button

                  icon="pi pi-pencil"
                  class="p-button-text p-button-sm"
                  @click="editDocumentType(docType)"
              />
              <Button

                  icon="pi pi-trash"
                  class="p-button-text p-button-sm p-button-danger"
                  @click="deleteDocumentType(docType.id)"
              />
            </div>
          </div>
        </template>

        <template #content>
          <div class="space-y-4">
            <!-- Теги/алиасы -->
            <div>
              <div class="flex items-center gap-2 mb-2">
                <i class="pi pi-tag text-gray-400"></i>
                <span class="text-sm font-medium text-gray-700">Теги:</span>
              </div>
              <div class="flex flex-wrap gap-2">
                <Chip
                    v-for="alias in docType.aliases"
                    :key="alias.id"
                    :label="alias.name"
                    class="text-xs"
                />
                <span v-if="docType.aliases.length === 0" class="text-sm text-gray-400">
                  Теги не указаны
                </span>
              </div>
            </div>

            <!-- Применимые типы компаний -->
            <div>
              <div class="flex items-center gap-2 mb-2">
                <i class="pi pi-building text-gray-400"></i>
                <span class="text-sm font-medium text-gray-700">Типы компаний:</span>
              </div>
              <div class="flex flex-wrap gap-2">
                <Chip
                    v-for="companyType in docType.applicable_company_types"
                    :key="companyType.id"
                    :label="companyType.name"
                    class="text-xs bg-green-100 text-green-800"
                />
                <span v-if="docType.applicable_company_types.length === 0" class="text-sm text-gray-400">
                  Типы компаний не указаны
                </span>
              </div>
            </div>

<!--            &lt;!&ndash; Статистика &ndash;&gt;-->
<!--            <div class="grid grid-cols-2 gap-4 text-sm text-gray-500 pt-4 border-t">-->
<!--              <div>-->
<!--                <div class="font-medium">Тегов:</div>-->
<!--                <div>{{ docType.aliases.length }}</div>-->
<!--              </div>-->
<!--              <div>-->
<!--                <div class="font-medium">Типов компаний:</div>-->
<!--                <div>{{ docType.applicable_company_types.length }}</div>-->
<!--              </div>-->
<!--            </div>-->
          </div>
        </template>
      </Card>
    </div>

    <!-- Состояние пустого списка -->
    <div v-else class="text-center py-10">
      <i class="pi pi-inbox text-gray-400 text-4xl mb-4"></i>
      <p class="text-gray-500">Типы документов не найдены</p>
      <p v-if="searchQuery" class="text-gray-400 text-sm mt-2">
        Попробуйте изменить запрос поиска
      </p>
      <Button
          v-if="pagePermissions?.canCreate"
          label="Добавить первый тип"
          icon="pi pi-plus"
          class="mt-4"
          @click="showAddDialog = true"
      />
    </div>

    <!-- Диалог добавления/редактирования -->
    <Dialog
        v-model:visible="showDialog"
        :header="dialogHeader"
        :style="{ width: '700px' }"
        :modal="true"
        :closable="false"
    >
      <ModalDocumentType
          :doc-type="editingDocType"
          :loading="pending"
          @submit="handleFormSubmit"
          @cancel="showDialog = false"
      />
    </Dialog>

    <!-- Диалог подтверждения удаления -->
    <ConfirmDialog></ConfirmDialog>
  </div>
</template>

<style scoped>
.card-hover:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease;
}

:deep(.p-card-title) {
  margin-bottom: 0.5rem !important;
}

:deep(.p-card-content) {
  padding-top: 0.5rem !important;
}
</style>