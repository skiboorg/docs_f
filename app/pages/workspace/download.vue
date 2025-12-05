<template>
  <div class="min-h-screen bg-gray-50 p-4 ">
    <div class="max-w-7xl mx-auto">
      <!-- Заголовок -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          Скачивание документов
        </h1>
        <p class="text-gray-600">
          Загрузка утверждённых документов
        </p>

        <!-- Ограниченный доступ -->
        <div class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div class="flex items-center">
            <input
                type="checkbox"
                id="limited-access"
                class="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                :checked="limitedAccess"
                @change="limitedAccess = !limitedAccess"
            />
            <label for="limited-access" class="ml-3 text-gray-700">
              Ограниченный доступ: Вы можете скачивать только документы, разрешённые для всех пользователей
            </label>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-6">
        <!-- Левая колонка - Фильтры -->
        <div class="col-span-3">
          <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-6">
              Фильтры
            </h2>

            <!-- Поиск -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                <input
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 mr-2"
                    checked
                />
                Поиск
              </label>
              <input
                  type="text"
                  v-model="searchQuery"
                  placeholder="Компания или типы..."
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>

            <!-- Компания -->
            <div class="mb-6">
              <h3 class="text-lg font-medium text-gray-700 mb-3">
                Компания
              </h3>
              <Dropdown
                  v-model="selectedCompany"
                  fluid
                  option-label="label"
                  :options="[
                      {label:'Все компании',value:'all'},
                      {label:'ООО Альфа',value:'alpha'},
                      {label:'ООО Бета',value:'beta'},

                  ]"

              >
                <option value="all">Все компании</option>
                <option value="alpha">ООО "Альфа"</option>
                <option value="beta">ООО "Бега"</option>
              </Dropdown>
            </div>

            <!-- Типы документов -->
            <div class="mb-6">
              <h3 class="text-lg font-medium text-gray-700 mb-3">
                Типы документов
              </h3>
              <div class="space-y-2">
                <label v-for="type in documentTypes" :key="type.id" class="flex items-center">
                  <Checkbox
                      binary
                      type="checkbox"
                      :checked="selectedDocumentTypes.includes(type.id)"
                      @change="toggleDocumentType(type.id)"
                      class="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span class="ml-2 text-gray-700">{{ type.name }}</span>
                </label>
              </div>
            </div>

          </div>
        </div>

        <!-- Правая колонка - Документы -->
        <div class="col-span-9">
          <div class="bg-white rounded-xl shadow-lg p-6">
            <!-- Заголовок и кнопка скачать все -->
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 class="text-xl font-semibold text-gray-800">
                Документы ({{ filteredDocuments.length }})
              </h2>
              <Button
                  @click="downloadAll"
                  :disabled="selectedDocuments.length === 0"
                  class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200"
              >
              <i class="pi pi-download"></i>
                Скачать все выбранные
              </Button>
            </div>

            <!-- Список документов -->
            <div class="space-y-4">
              <div
                  v-for="document in filteredDocuments"
                  :key="document.id"
                  class="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors duration-200"
              >
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <!-- Левая часть: Чекбокс и информация -->
                  <div class="flex-1">
                    <div class="flex items-center gap-3">
                      <input
                          type="checkbox"
                          :checked="selectedDocuments.includes(document.id)"
                          @change="toggleDocumentSelection(document.id)"
                          class="h-5 w-5 text-blue-600 rounded focus:ring-blue-500 mt-1"
                      />
                      <div class="ml-3">
                        <!-- Тип документа и статус -->
                        <div class="flex items-center mb-2 gap-2">
                          <span class="text-lg font-medium text-gray-900">
                            {{ document.type }}
                          </span>
                          <span class="ml-3 flex gap-2 items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <svg class="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Утверждён
                          </span>
                        </div>

                        <!-- Компания и ИНН -->
                        <p class="text-gray-600 mb-2">
                          <span class="font-medium">{{ document.company }}</span> • ИНН: {{ document.inn }}
                        </p>

                        <!-- Имя файла -->
                        <p class="text-sm text-gray-500 mb-2 font-mono">
                          {{ document.fileName }}
                        </p>

                        <!-- Дата и размер -->
                        <p class="text-sm text-gray-500">
                          {{ document.date }} • {{ document.size }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Правая часть: Кнопки действий -->
                  <div class="flex space-x-2">
                    <Button
                        text
                        @click="previewDocument(document)"
                        icon="pi pi-eye"

                    />
                    <Button
                        @click="downloadDocument(document)"
                        text
                        icon="pi pi-download"

                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Если нет документов -->
            <div v-if="filteredDocuments.length === 0" class="text-center py-12">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 class="mt-4 text-lg font-medium text-gray-900">Документы не найдены</h3>
              <p class="mt-2 text-gray-500">Попробуйте изменить параметры фильтрации</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'

// Состояние
const limitedAccess = ref(false)
const searchQuery = ref('')
const selectedCompany = ref('all')
const selectedDocumentTypes = ref(['ogrn', 'contract', 'seal', 'inn', 'charter'])
const selectedDocuments = ref([])

// Типы документов
const documentTypes = ref([
  { id: 'skip', name: 'ckipeffced' },
  { id: 'ogrn', name: 'Выписка ОГРН' },
  { id: 'contract', name: 'Договор' },
  { id: 'seal', name: 'Оттиск печати' },
  { id: 'inn', name: 'Свидетельство ИНН' },
  { id: 'charter', name: 'Устав' }
])

// Документы
const documents = ref([
  {
    id: 1,
    type: 'Выписка ОГРН',
    company: 'ООО "Альфа"',
    inn: '7743013902',
    fileName: 'Screenshot_Oct_23_22_30_11.png',
    date: '24 октября 2025',
    size: '51.71 MB',
    documentType: 'ogrn'
  },
  {
    id: 2,
    type: 'Договор',
    company: 'ООО "Альфа"',
    inn: '7743013902',
    fileName: 'Screenshot_Oct_23_18_16_07.png',
    date: '24 октября 2025',
    size: '160.42 KB',
    documentType: 'contract'
  },
  {
    id: 3,
    type: 'Оттиск печати',
    company: 'ООО "Альфа"',
    inn: '7743013902',
    fileName: 'Screenshot_Oct_23_18_16_07.png',
    date: '24 октября 2025',
    size: '160.42 KB',
    documentType: 'seal'
  },
  {
    id: 4,
    type: 'ckipeffced',
    company: 'ООО "Альфа"',
    inn: '7743013902',
    fileName: 'Screenshot_Oct_23_22_30_11.png',
    date: '10 ноября 2025',
    size: '51.71 MB',
    documentType: 'skip'
  },
  {
    id: 5,
    type: 'Выписка ОГРН',
    company: 'ООО "Бега"',
    inn: '7728168971',
    fileName: 'vsewq.org',
    date: '10 ноября 2025',
    size: '1.08 GB',
    documentType: 'ogrn'
  }
])

// Компьютеды
const selectedDocumentsCount = computed(() => selectedDocuments.value.length)

const filteredDocuments = computed(() => {
  return documents.value.filter(document => {
    // Фильтр по поиску
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      const matchesSearch =
          document.type.toLowerCase().includes(query) ||
          document.company.toLowerCase().includes(query) ||
          document.inn.includes(query) ||
          document.fileName.toLowerCase().includes(query)
      if (!matchesSearch) return false
    }

    // Фильтр по компании
    if (selectedCompany.value !== 'all') {
      const companyMatch = selectedCompany.value === 'alpha'
          ? document.company.includes('Альфа')
          : document.company.includes('Бега')
      if (!companyMatch) return false
    }

    // Фильтр по типам документов
    if (selectedDocumentTypes.value.length > 0) {
      if (!selectedDocumentTypes.value.includes(document.documentType)) return false
    }

    return true
  })
})

// Методы
const toggleDocumentType = (typeId) => {
  const index = selectedDocumentTypes.value.indexOf(typeId)
  if (index === -1) {
    selectedDocumentTypes.value.push(typeId)
  } else {
    selectedDocumentTypes.value.splice(index, 1)
  }
}

const toggleDocumentSelection = (documentId) => {
  const index = selectedDocuments.value.indexOf(documentId)
  if (index === -1) {
    selectedDocuments.value.push(documentId)
  } else {
    selectedDocuments.value.splice(index, 1)
  }
}

const selectAll = () => {
  if (selectedDocuments.value.length === filteredDocuments.value.length) {
    selectedDocuments.value = []
  } else {
    selectedDocuments.value = filteredDocuments.value.map(doc => doc.id)
  }
}

const previewDocument = (document) => {
  alert(`Просмотр документа: ${document.type}\n${document.fileName}`)
  // В реальном приложении здесь будет открытие модального окна с предпросмотром
}

const downloadDocument = (document) => {
  alert(`Скачивание документа: ${document.type}\n${document.fileName}`)
  // В реальном приложении здесь будет логика скачивания файла
  // Например: window.open(downloadUrl, '_blank')
}

const downloadAll = () => {
  if (selectedDocuments.value.length === 0) {
    alert('Выберите хотя бы один документ для скачивания')
    return
  }

  const selectedDocs = documents.value.filter(doc =>
      selectedDocuments.value.includes(doc.id)
  )

  alert(`Скачивание ${selectedDocs.length} документов...\n` +
      selectedDocs.map(doc => `• ${doc.type} - ${doc.fileName}`).join('\n'))

  // В реальном приложении здесь будет логика массового скачивания
  // Например: создание zip-архива со всеми выбранными файлами
}
</script>

<style scoped>
/* Дополнительные стили если нужно */
</style>