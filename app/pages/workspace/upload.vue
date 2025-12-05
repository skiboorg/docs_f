<template>
  <div class="min-h-screen bg-gray-50 p-4 md:p-8">
    <div class="max-w-4xl mx-auto">
      <!-- Заголовок -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          Загрузка документов
        </h1>
        <p class="text-gray-600">
          Массовая загрузка документов из архива
        </p>
      </div>

      <!-- Основная карточка -->
      <div class="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8">
        <!-- Подзаголовок -->
        <h2 class="text-2xl font-semibold text-gray-800 mb-6">
          Загрузка архива с документами
        </h2>

        <!-- Требования к архиву -->
        <div class="mb-8">
          <h3 class="text-lg font-medium text-gray-700 mb-4">
            Требования к архиву:
          </h3>
          <ul class="space-y-3 text-gray-600">
            <li class="flex items-start">
              <span class="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span>Имя файла должно содержать ИНН компании (10 или 12 цифр)</span>
            </li>
            <li class="flex items-start">
              <span class="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span>Пример: <code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono">7707083893_documents.zip</code></span>
            </li>
            <li class="flex items-start">
              <span class="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span>Поддерживаемые форматы: <span class="font-medium">ZIP, RAR, 7z</span></span>
            </li>
            <li class="flex items-start">
              <span class="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span>Если компания с указанным ИНН не существует, она будет создана автоматически</span>
            </li>
            <li class="flex items-start">
              <span class="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span>Данные о компании будут получены из открытых источников</span>
            </li>
          </ul>
        </div>

        <!-- Разделитель -->
        <hr class="my-8 border-gray-200">

        <!-- Поле загрузки файла -->
        <div class="mb-8">
          <h3 class="text-lg font-medium text-gray-700 mb-4">
            Выберите архив
          </h3>

          <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors duration-200"
               @dragover.prevent="onDragOver"
               @dragleave.prevent="onDragLeave"
               @drop.prevent="onDrop"
               :class="{'border-blue-400 bg-blue-50': isDragOver}">
            <input
                type="file"
                id="file-upload"
                ref="fileInput"
                @change="onFileSelect"
                accept=".zip,.rar,.7z"
                class="hidden"
            />

            <div class="mb-4">
              <svg style="width: 100px" class="mx-auto  text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 200 200">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="10" d="M50 116a25 25 0 01-5.5-49.39A31.25 31.25 0 11115 75L116 75a31.25 31.25 0 016.25 61.88M110 116l-18.75-18.75m0 0L72.5 116m18.75-18.75v75" />
              </svg>
            </div>

            <label for="file-upload" class="cursor-pointer">
              <span class="text-blue-600 font-medium hover:text-blue-700">Нажмите для выбора файла</span>
              <span class="text-gray-500"> или перетащите его сюда</span>
            </label>

            <p class="text-sm text-gray-500 mt-2">
              Поддерживаются: ZIP, RAR, 7z
            </p>

            <!-- Выбранный файл -->
            <div v-if="selectedFile" class="mt-6 p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <svg style="width: 100px" class="h-8 w-8 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  <div>
                    <p class="font-medium text-gray-900">{{ selectedFile.name }}</p>
                    <p class="text-sm text-gray-500">{{ formatFileSize(selectedFile.size) }}</p>
                  </div>
                </div>
                <button
                    @click="removeFile"
                    class="text-gray-400 hover:text-red-500 transition-colors"
                    type="button"
                >
                  <svg style="width: 40px" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Валидация ИНН -->
              <div v-if="innValidation" class="mt-4 p-3 rounded-md"
                   :class="innValidation.isValid ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'">
                <div class="flex items-center">
                  <svg style="width: 40px" class="h-5 w-5 mr-2" :class="innValidation.isValid ? 'text-green-500' : 'text-red-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path v-if="innValidation.isValid" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span class="text-sm font-medium">{{ innValidation.message }}</span>
                </div>
              </div>
            </div>

            <div v-else class="mt-6">
              <p class="text-gray-500">Файл не выбран</p>
            </div>
          </div>
        </div>

        <!-- Кнопка загрузки -->
        <Button
            @click="uploadAndProcess"
            :disabled="!selectedFile || (innValidation && !innValidation.isValid)"
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          <svg style="width: 100px" v-if="isUploading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ isUploading ? 'Загрузка...' : 'Загрузить и обработать' }}</span>
        </Button>
      </div>

      <!-- Автоматическое определение типов документов -->
      <div class="bg-white rounded-xl shadow-lg p-6 md:p-8">
        <h2 class="text-2xl font-semibold text-gray-800 mb-6">
          Автоматическое определение типов документов
        </h2>

        <div class="space-y-4 text-gray-600">
          <p>
            Система попытается автоматически определить тип каждого документа на основе:
          </p>

          <ul class="space-y-3">
            <li class="flex items-start">
              <span class="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span>Имени файла</span>
            </li>
            <li class="flex items-start">
              <span class="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span>Настроенных алгоритмов для каждого типа документа</span>
            </li>
            <li class="flex items-start">
              <span class="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span>Кода типа документа</span>
            </li>
          </ul>

          <p class="pt-4">
            Вы можете настроить алгоритмы на странице
            <a href="#" class="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200">
              "Типы документов"
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const fileInput = ref(null)
const selectedFile = ref(null)
const isDragOver = ref(false)
const isUploading = ref(false)

// Валидация ИНН из имени файла
const innValidation = computed(() => {
  if (!selectedFile.value) return null

  const fileName = selectedFile.value.name
  // Ищем ИНН в имени файла (10 или 12 цифр)
  const innMatch = fileName.match(/(\d{10}|\d{12})/)

  if (!innMatch) {
    return {
      isValid: false,
      message: 'Ошибка: ИНН (10 или 12 цифр) не найден в имени файла'
    }
  }

  const inn = innMatch[1]
  const isValidLength = inn.length === 10 || inn.length === 12

  if (!isValidLength) {
    return {
      isValid: false,
      message: 'Ошибка: ИНН должен содержать 10 или 12 цифр'
    }
  }

  return {
    isValid: true,
    message: `ИНН найден: ${inn} - ${inn.length === 10 ? 'Юридическое лицо' : 'Физическое лицо/ИП'}`
  }
})

const onFileSelect = (event) => {
  const file = event.target.files[0]
  if (file && validateFileType(file)) {
    selectedFile.value = file
  }
}

const onDragOver = () => {
  isDragOver.value = true
}

const onDragLeave = () => {
  isDragOver.value = false
}

const onDrop = (event) => {
  isDragOver.value = false
  const file = event.dataTransfer.files[0]
  if (file && validateFileType(file)) {
    selectedFile.value = file
  }
}

const validateFileType = (file) => {
  const validExtensions = ['.zip', '.rar', '.7z']
  const fileName = file.name.toLowerCase()
  const isValid = validExtensions.some(ext => fileName.endsWith(ext))

  if (!isValid) {
    alert('Пожалуйста, выберите архивный файл (ZIP, RAR или 7z)')
    return false
  }

  return true
}

const removeFile = () => {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const uploadAndProcess = async () => {
  if (!selectedFile.value) return
  if (innValidation.value && !innValidation.value.isValid) return

  isUploading.value = true

  try {
    // Имитация загрузки файла
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Здесь будет реальный код загрузки
    // const formData = new FormData()
    // formData.append('archive', selectedFile.value)
    // await $fetch('/api/upload', {
    //   method: 'POST',
    //   body: formData
    // })

    alert('Архив успешно загружен и обрабатывается')
    removeFile()
  } catch (error) {
    console.error('Ошибка загрузки:', error)
    alert('Произошла ошибка при загрузке файла')
  } finally {
    isUploading.value = false
  }
}
</script>