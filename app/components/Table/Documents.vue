<template>
  <div class="max-w-7xl mx-auto bg-white rounded-lg shadow-sm border">
    <!-- Заголовок -->
    <div class="p-6 border-b">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Таблица документов</h1>
      <p class="text-gray-600">Статус документов по всем компаниям</p>
    </div>

    <div class="flex flex-col lg:flex-row">

      <!-- Основная область с таблицей -->
      <div class="flex-1 p-6">
        <!-- Панель управления таблицей -->
        <div class="flex justify-between items-center mb-6">
          <div class="flex items-center space-x-4">
            <Button
                icon="pi pi-cog"
                class="p-button-text p-button-secondary"
                @click="toggleColumnSettings"
            />
            <span class="text-gray-600">Настройка колонки</span>
          </div>

          <div class="flex items-center space-x-4">
            <InputText
                v-model="searchText"
                placeholder="Поиск..."
                class="w-80"
            >
              <template #prefix>
                <i class="pi pi-search text-gray-400" />
              </template>
            </InputText>
          </div>
        </div>

        <!-- Всплывающее окно настроек колонок -->
        <OverlayPanel ref="op" class="w-80">
          <div class="p-4">
            <h4 class="font-semibold mb-4">Видимые колонки</h4>
            <div class="space-y-2">
              <div v-for="column in allColumns" :key="column.field" class="flex items-center">
                <Checkbox
                    v-model="visibleColumns"
                    :inputId="column.field"
                    :value="column.field"
                />
                <label :for="column.field" class="ml-2 text-gray-700 cursor-pointer">
                  {{ column.header }}
                </label>
              </div>
            </div>
          </div>
        </OverlayPanel>

        <!-- Таблица -->
        <DataTable
            :value="filteredDocuments"
            :paginator="true"
            :rows="10"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[5,10,20]"
            currentPageReportTemplate="Показано {first} - {last} из {totalRecords}"
            class="p-datatable-sm"
        >
          <Column field="company" header="Компания" :sortable="true">
            <template #body="slotProps">
              <div>
                <div class="font-medium">{{ slotProps.data.company.name }}</div>
                <div class="text-sm text-gray-500">ИНН: {{ slotProps.data.company.inn }}</div>
              </div>
            </template>
          </Column>

          <Column
              v-for="col in visibleColumnDefinitions"
              :key="col.field"
              :field="col.field"
              :header="col.header"
              :sortable="true"
          >
            <template #body="slotProps">
              <DocumentStatus :status="slotProps.data[col.field]" />
            </template>
          </Column>

          <Column header="Действия">
            <template #body>
              <Button
                  icon="pi pi-ellipsis-v"
                  class="p-button-text p-button-secondary"
              />
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script setup>
// Данные
const statuses = ref([
  { id: 'approved', label: 'Утвержден' },
  { id: 'missing', label: 'Отсутствует' },
  { id: 'obsolete', label: 'Не актуален' }
])

const companies = ref([
  { id: 'alpha', name: 'ООО "Альфа"', inn: '7745031902' },
  { id: 'beta', name: 'ООО "Бета"', inn: '7725100071' }
])

const kuznets = ref([
  { id: 'spb', name: 'Санкт-Петербург' },
  { id: 'files', name: 'Сочинение файлов' }
])

const veliksaDocs = ref([
  { id: 'extract', name: 'Выписка ОГРН' },
  { id: 'contract', name: 'Договор' },
  { id: 'stamp', name: 'Оттиск печати' },
  { id: 'inn', name: 'Свидетельство ИНН' },
  { id: 'charter', name: 'Устав' },
  { id: 'collection', name: 'Выборник без б' }
])

// Состояние фильтров
const selectedStatuses = ref([])
const selectedCompanies = ref([])
const selectedKuznets = ref([])
const selectedVeliksaDocs = ref([])
const searchText = ref('')


const allColumns = ref([
  { field: 'extractOgrn', header: 'Выписка ОГРН' },
  { field: 'contract', header: 'Договор' },
  { field: 'stamp', header: 'Оттиск печати' },
  { field: 'innCert', header: 'Свидетельство ИНН' },
  { field: 'charter', header: 'Устав' },
])

const visibleColumns = ref(allColumns.value.map(col => col.field))
const op = ref()

// Пример данных документов
const documents = ref([
  {
    id: 1,
    company: companies.value[0],
    extractOgrn: 'approved',
    contract: 'missing',
    stamp: 'obsolete',
    innCert: 'approved',
    charter: 'missing',
    collection: 'approved'
  },
  {
    id: 2,
    company: companies.value[1],
    extractOgrn: 'missing',
    contract: 'approved',
    stamp: 'approved',
    innCert: 'obsolete',
    charter: 'approved',
    collection: 'missing'
  }
])

// Вычисляемые свойства
const visibleColumnDefinitions = computed(() => {
  return allColumns.value.filter(col => visibleColumns.value.includes(col.field))
})

const filteredDocuments = computed(() => {
  return documents.value.filter(doc => {
    // Фильтрация по компаниям
    if (selectedCompanies.value.length > 0 && !selectedCompanies.value.includes(doc.company.id)) {
      return false
    }

    // Фильтрация по статусам (хотя бы один документ соответствует выбранным статусам)
    if (selectedStatuses.value.length > 0) {
      const hasMatchingStatus = Object.values(doc).some(value =>
          selectedStatuses.value.includes(value)
      )
      if (!hasMatchingStatus) return false
    }

    // Поиск по тексту
    if (searchText.value) {
      const searchLower = searchText.value.toLowerCase()
      const companyMatch = doc.company.name.toLowerCase().includes(searchLower) ||
          doc.company.inn.includes(searchText.value)
      if (!companyMatch) return false
    }

    return true
  })
})

// Методы
const toggleColumnSettings = (event) => {
  op.value.toggle(event)
}
</script>