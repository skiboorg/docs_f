<script setup lang="ts">
import type { ICompanyListResponse, ICompany } from "~/repository/company/types";
import type {IDocumentType} from "~/repository/document/types";

const { $api } = useNuxtApp()

const toast = useToast()

// Реактивные переменные
const searchQuery = ref('')
const page = ref(1)
const showCompanyDialog = ref(false)
const showAddCompanyDialog = ref(false)
const editingCompany = ref<ICompany | null>(null)

// Загрузка данных
const { data: companies_response, pending, error, refresh } = useHttpRequest(
    useAsyncData<ICompanyListResponse>('companies_response', () =>  $api.company.all({
      params: {
        page: page.value,
        search: searchQuery.value || undefined
      }
    })
    ),
    'Ошибка при загрузке типов документов'
);

console.log(companies_response)
// Вычисляемые свойства
const companies = computed(() => companies_response.value?.results || [])
const totalCount = computed(() => companies_response.value?.count || 0)
const hasNextPage = computed(() => !!companies_response.value?.next)
const hasPreviousPage = computed(() => !!companies_response.value?.previous)

const filteredCompanies = computed(() => {
  if (!companies.value || !searchQuery.value) return companies.value

  const query = searchQuery.value.toLowerCase()
  return companies.value.filter(company =>
      company.name.toLowerCase().includes(query) ||
      company.inn.toLowerCase().includes(query) ||
      company.director_name?.toLowerCase().includes(query) ||
      company.company_type.name.toLowerCase().includes(query)
  )
})

const dialogHeader = computed(() =>
    editingCompany.value ? 'Редактировать компанию' : 'Добавить компанию'
)

// Методы
const editCompany = (company: ICompany) => {
  editingCompany.value = { ...company }
  showCompanyDialog.value = true
}

const addCompany = () => {
  editingCompany.value = null
  showCompanyDialog.value = true
}

const handleFormSubmit = async (companyData: any) => {
  try {
    if (editingCompany.value) {
      // Обновление существующей компании
      const updated = await $api.company.update(editingCompany.value.uuid, companyData)
      toast.add({ severity: 'success', summary: 'Успешно', detail: 'Компания обновлена', life: 3000 })

      // Обновляем данные в списке
      const index = companies.value.findIndex(c => c.uuid === editingCompany.value?.uuid)
      if (index !== -1) {
        companies.value[index] = updated
      }
    } else {
      // Создание новой компании
      const newCompany = await $api.company.create(companyData)
      toast.add({ severity: 'success', summary: 'Успешно', detail: 'Компания создана', life: 3000 })
      companies.value.unshift(newCompany)
      refresh() // Обновляем общее количество
    }

    showCompanyDialog.value = false
    editingCompany.value = null
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось сохранить компанию', life: 5000 })
    console.error('Ошибка сохранения:', err)
  }
}

const confirmDelete = async (company: ICompany) => {
    await $api.company.delete(company.id)
    toast.add({ severity: 'success', summary: 'Успешно', detail: 'Компания удалена', life: 3000 })
    await refresh() // Обновляем общее количество

}

const loadNextPage = () => {
  if (hasNextPage.value) {
    page.value++
    refresh()
  }
}

const loadPreviousPage = () => {
  if (hasPreviousPage.value) {
    page.value--
    refresh()
  }
}



// Обработчики событий
watch(() => showAddCompanyDialog.value, (val) => {
  if (val) {
    addCompany()
    showAddCompanyDialog.value = false
  }
})
</script>

<template>
  <div class="max-w-6xl mx-auto">
    <!-- Заголовок -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Компании</h1>
      <p class="text-gray-600 text-lg">Управление реестром компаний</p>
    </div>

    <!-- Панель поиска и действий -->
    <div class="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <!-- Поиск -->
        <div class="flex-1 w-full sm:max-w-md">
          <InputText
              v-model="searchQuery"
              placeholder="Поиск по названию, ИНН, директору или типу..."
              class="w-full"
          >

          </InputText>
        </div>

        <!-- Статистика -->
        <div class="text-sm text-gray-600">
          Найдено: {{ totalCount }} компаний
        </div>

        <!-- Кнопки действий -->
        <div class="flex gap-3 w-full sm:w-auto">
          <Button
              label="Добавить компанию"
              icon="pi pi-plus"
              class="p-button-primary"
              @click="showAddCompanyDialog = true"
              :loading="pending"
          />
          <Button
              icon="pi pi-refresh"
              class="p-button-outlined p-button-secondary"
              @click="refresh"
              :loading="pending"
          />
        </div>
      </div>
    </div>

    <!-- Состояние загрузки -->
    <div v-if="pending && page === 1" class="text-center py-10">
      <ProgressSpinner />
      <p class="mt-2 text-gray-500">Загрузка компаний...</p>
    </div>

    <!-- Состояние ошибки -->
    <div v-else-if="error" class="text-center py-10">
      <i class="pi pi-exclamation-triangle text-red-500 text-4xl mb-4"></i>
      <p class="text-red-500 mb-4">Ошибка при загрузке данных</p>
      <Button label="Повторить" icon="pi pi-refresh" @click="refresh" />
    </div>

    <!-- Список компаний -->
    <div v-else class="space-y-4">
      <Card
          v-for="company in filteredCompanies"
          :key="company.uuid"
          class="hover:shadow-lg transition-shadow duration-200"
      >
        <template #title>
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">{{ company.name }}</h3>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">ИНН: {{ company.inn }}</span>
                <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">{{ company.company_type?.name }}</span>
              </div>
            </div>
            <div class="flex gap-2">
              <Button
                  icon="pi pi-pencil"
                  class="p-button-text p-button-sm"
                  @click="editCompany(company)"
              />
              <Button
                  icon="pi pi-trash"
                  class="p-button-text p-button-sm p-button-danger"
                  @click="confirmDelete(company)"
              />
            </div>
          </div>
        </template>

        <template #content>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Основная информация -->
            <div class="space-y-2">
              <div>
                <span class="text-sm font-medium text-gray-700">Директор:</span>
                <p class="text-sm text-gray-900">{{ company.director_name || '—' }}</p>
              </div>
              <div>
                <span class="text-sm font-medium text-gray-700">Дата основания:</span>
                <p class="text-sm text-gray-900">
                  {{ company.founding_date ? new Date(company.founding_date).toLocaleDateString('ru-RU') : '—' }}
                </p>
              </div>
            </div>

            <!-- Финансовая информация -->
            <div class="space-y-2">
              <div>
                <span class="text-sm font-medium text-gray-700">Уставный капитал:</span>
                <p class="text-sm text-gray-900">
                  {{ company.authorized_capital ? parseFloat(company.authorized_capital).toLocaleString('ru-RU', { minimumFractionDigits: 2 }) + ' ₽' : '—' }}
                </p>
              </div>
              <div>
                <span class="text-sm font-medium text-gray-700">UUID:</span>
                <p class="text-sm text-gray-500 font-mono truncate">{{ company.uuid }}</p>
              </div>
            </div>
          </div>

          <!-- Дата создания -->
          <div class="mt-4 pt-4 border-t text-xs text-gray-500">
            Создано: {{ new Date(company.company_type?.created_at).toLocaleString('ru-RU') }}
          </div>
        </template>
      </Card>

      <!-- Пагинация -->
      <div v-if="totalCount > 0" class="flex justify-between items-center mt-6 pt-6 border-t">
        <div class="text-sm text-gray-600">
          Страница {{ page }} • Показано {{ companies.length }} из {{ totalCount }}
        </div>
        <div class="flex gap-2">
          <Button
              icon="pi pi-chevron-left"
              class="p-button-outlined p-button-secondary"
              @click="loadPreviousPage"
              :disabled="!hasPreviousPage || pending"
          />
          <Button
              icon="pi pi-chevron-right"
              class="p-button-outlined p-button-secondary"
              @click="loadNextPage"
              :disabled="!hasNextPage || pending"
          />
        </div>
      </div>
    </div>

    <!-- Состояние пустого списка -->
    <div v-if="!pending && !error && companies.length === 0" class="text-center py-10">
      <i class="pi pi-building text-gray-400 text-4xl mb-4"></i>
      <p class="text-gray-500">Компании не найдены</p>
      <p v-if="searchQuery" class="text-gray-400 text-sm mt-2">
        Попробуйте изменить запрос поиска
      </p>
      <Button
          label="Добавить первую компанию"
          icon="pi pi-plus"
          class="mt-4"
          @click="showAddCompanyDialog = true"
      />
    </div>

    <!-- Диалог добавления/редактирования компании -->
    <Dialog
        v-model:visible="showCompanyDialog"
        :header="dialogHeader"
        :style="{ width: '600px' }"
        :modal="true"
        :closable="false"
    >
      <ModalCompany
          :company="editingCompany"
          :loading="pending"
          @submit="handleFormSubmit"
          @cancel="showCompanyDialog = false"
      />
    </Dialog>

    <!-- Диалог подтверждения удаления -->
    <ConfirmDialog></ConfirmDialog>
    <Toast />
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