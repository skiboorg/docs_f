<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Основная информация -->
    <div class="space-y-4">
      <h4 class="font-semibold text-gray-900">Основная информация</h4>

      <!-- Название компании -->
      <div class="field">
        <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
          Название компании *
        </label>
        <InputText
            id="name"
            v-model="formData.name"
            class="w-full"
            :class="{ 'p-invalid': !isNameValid }"
            placeholder="ООО 'Рога и копыта'"
            :disabled="loading"
            @blur="validateName"
        />
        <small v-if="!isNameValid" class="p-error text-xs">
          Название обязательно (минимум 2 символа)
        </small>
      </div>

      <!-- ИНН -->
      <div class="field">
        <label for="inn" class="block text-sm font-medium text-gray-700 mb-2">
          ИНН *
        </label>
        <InputText
            id="inn"
            v-model="formData.inn"
            class="w-full"
            :class="{ 'p-invalid': !isINNValid }"
            placeholder="1234567890"
            :disabled="loading"
            @blur="validateINN"
            @input="formatINN"
        />
        <small v-if="!isINNValid" class="p-error text-xs">
          Введите корректный ИНН (10 или 12 цифр)
        </small>
      </div>
    </div>

    <!-- Дополнительная информация -->
    <div class="space-y-4">
      <h4 class="font-semibold text-gray-900">Дополнительная информация</h4>

      <div class="grid md:grid-cols-2 gap-6">
        <!-- Тип компании -->
        <div class="field">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Тип компании *
          </label>
          <Dropdown
              v-model="formData.company_type_id"
              :options="companyTypes"
              optionLabel="name"
              optionValue="id"
              placeholder="Выберите тип компании"
              class="w-full"
              :class="{ 'p-invalid': !isCompanyTypeValid }"
              :loading="companyTypesLoading"
              :disabled="loading || companyTypesLoading"
              :filter="true"
              filterPlaceholder="Поиск типа..."
              showClear
          >
            <template #value="slotProps">
              <div v-if="slotProps.value" class="flex items-center">
                <div class="flex-shrink-0 w-3 h-3 rounded-full mr-2" :class="getCompanyTypeColor(slotProps.value)"></div>
                <span>{{ getCompanyTypeName(slotProps.value) }}</span>
              </div>
              <span v-else class="text-gray-400">
                Выберите тип компании
              </span>
            </template>

            <template #option="slotProps">
              <div class="flex items-center">
                <div class="flex-shrink-0 w-3 h-3 rounded-full mr-2" :class="getCompanyTypeColor(slotProps.option.id)"></div>
                <span>{{ slotProps.option.name }}</span>
              </div>
            </template>
          </Dropdown>
          <small v-if="!isCompanyTypeValid" class="p-error text-xs">
            Тип компании обязателен
          </small>
        </div>

        <!-- Директор -->
        <div class="field">
          <label for="director" class="block text-sm font-medium text-gray-700 mb-2">
            Директор
          </label>
          <InputText
              id="director"
              v-model="formData.director_name"
              class="w-full"
              placeholder="Иванов Иван Иванович"
              :disabled="loading"
          />
          <small class="text-gray-500 text-xs">
            ФИО директора или генерального директора
          </small>
        </div>
      </div>

      <div class="grid md:grid-cols-2 gap-6">
        <!-- Дата основания -->
        <div class="field">
          <label for="founding_date" class="block text-sm font-medium text-gray-700 mb-2">
            Дата основания
          </label>

          <Calendar
              v-model="formData.founding_date"
              dateFormat="yy-mm-dd"
              class="w-full"
              :class="{ 'p-invalid': !isDateValid }"
              :disabled="loading"
              :showIcon="true"
              :maxDate="maxDate"
              placeholder="Выберите дату"
              :manualInput="false"
          />
          <small v-if="!isDateValid" class="p-error text-xs">
            Дата не может быть в будущем
          </small>
        </div>

        <!-- Уставный капитал -->
        <div class="field">
          <label for="capital" class="block text-sm font-medium text-gray-700 mb-2">
            Уставный капитал
          </label>
          <InputNumber
              v-model="formData.authorized_capital"
              class="w-full"
              mode="decimal"
              :min="0"
              :minFractionDigits="2"
              :maxFractionDigits="2"
              suffix=" ₽"
              :disabled="loading"
              :useGrouping="true"
          >
            <template #inputgroup>
              <InputGroupAddon>
                <i class="pi pi-money-bill"></i>
              </InputGroupAddon>
            </template>
          </InputNumber>
          <small class="text-gray-500 text-xs">
            Сумма в рублях
          </small>
        </div>
      </div>
    </div>

    <!-- Предпросмотр -->
    <div v-if="showPreview" class="border rounded-lg p-4 bg-gray-50">
      <h4 class="font-semibold text-gray-900 mb-3">Предпросмотр</h4>
      <div class="space-y-2 text-sm">
        <div><span class="font-medium">Название:</span> {{ formData.name || '—' }}</div>
        <div><span class="font-medium">ИНН:</span> {{ formData.inn || '—' }}</div>
        <div><span class="font-medium">Тип компании:</span> {{ companyTypeName || '—' }}</div>
        <div><span class="font-medium">Директор:</span> {{ formData.director_name || '—' }}</div>
        <div><span class="font-medium">Дата основания:</span> {{ formattedDate || '—' }}</div>
        <div><span class="font-medium">Уставный капитал:</span> {{ formattedCapital || '—' }}</div>
      </div>
    </div>

    <!-- Кнопки действий -->
    <div class="flex justify-between gap-3 pt-4 border-t">
      <div>
        <Button
            type="button"
            icon="pi pi-eye"
            :label="showPreview ? 'Скрыть предпросмотр' : 'Предпросмотр'"
            class="p-button-text p-button-sm"
            @click="showPreview = !showPreview"
            :disabled="loading"
        />

        <Button
            v-if="props.company"
            type="button"
            icon="pi pi-copy"
            label="Клонировать"
            class="p-button-text p-button-sm ml-2"
            @click="cloneCompany"
            :disabled="loading"
        />
      </div>

      <div class="flex gap-3">
        <Button
            type="button"
            label="Отмена"
            class="p-button-text p-button-secondary"
            @click="handleCancel"
            :disabled="loading"
        />

        <Button
            type="submit"
            :label="submitButtonLabel"
            class="p-button-primary"
            :loading="loading || companyTypesLoading"
            :disabled="!isFormValid"
            icon="pi pi-check"
        />
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, onMounted } from 'vue'
import type { ICompany, ICompanyType } from '~/repository/company/types'

// Импорт компонентов PrimeVue
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import InputNumber from 'primevue/inputnumber'
import InputGroupAddon from 'primevue/inputgroupaddon'

const { $api } = useNuxtApp()
const toast = useToast()

// Props
interface Props {
  company?: ICompany | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  company: null,
  loading: false
})

// Emits
const emit = defineEmits<{
  submit: [data: FormData]
  cancel: []
  clone: [data: FormData]
}>()

// Типы
interface FormData {
  name: string
  inn: string
  company_type_id: number | null
  director_name: string
  founding_date: string | null
  authorized_capital: number | null
}

interface ValidationState {
  name: boolean
  inn: boolean
  company_type: boolean
  date: boolean
}

// Реактивные данные
const formData = reactive<FormData>({
  name: '',
  inn: '',
  company_type_id: null,
  director_name: '',
  founding_date: null,
  authorized_capital: null
})

const validation = reactive<ValidationState>({
  name: true,
  inn: true,
  company_type: true,
  date: true
})

const companyTypes = ref<ICompanyType[]>([])
const companyTypesLoading = ref(false)
const showPreview = ref(false)
const maxDate = ref(new Date())

// Вычисляемые свойства
const isNameValid = computed(() => validation.name && formData.name.trim().length >= 2)
const isINNValid = computed(() => validation.inn && /^\d{10,12}$/.test(formData.inn.replace(/\D/g, '')))
const isCompanyTypeValid = computed(() => validation.company_type && formData.company_type_id !== null)
const isDateValid = computed(() => validation.date)
const isFormValid = computed(() => isNameValid.value && isINNValid.value && isCompanyTypeValid.value)

const companyTypeName = computed(() => {
  if (!formData.company_type_id) return null
  const type = companyTypes.value.find(ct => ct.id === formData.company_type_id)
  return type?.name || null
})

const formattedDate = computed(() => {
  if (!formData.founding_date) return null
  return new Date(formData.founding_date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const formattedCapital = computed(() => {
  if (!formData.authorized_capital) return null
  return formData.authorized_capital.toLocaleString('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + ' ₽'
})

const submitButtonLabel = computed(() => {
  if (props.loading) {
    return props.company ? 'Сохранение...' : 'Создание...'
  }
  return props.company ? 'Сохранить' : 'Создать'
})

// Методы
const loadCompanyTypes = async () => {
  try {
    companyTypesLoading.value = true
    companyTypes.value = await $api.company.types()
  } catch (error) {
    console.error('Ошибка загрузки типов компаний:', error)
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Не удалось загрузить типы компаний',
      life: 3000
    })
  } finally {
    companyTypesLoading.value = false
  }
}

const getCompanyTypeName = (typeId: number) => {
  const type = companyTypes.value.find(ct => ct.id === typeId)
  return type?.name || `Тип #${typeId}`
}

const getCompanyTypeColor = (typeId: number) => {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-indigo-500',
    'bg-pink-500'
  ]
  const index = typeId % colors.length
  return colors[index]
}

const formatINN = () => {
  // Удаляем все нецифровые символы
  const digits = formData.inn.replace(/\D/g, '')

  // Форматируем ИНН с пробелами для удобства чтения
  if (digits.length <= 10) {
    formData.inn = digits
  } else {
    // Для ИНН 12 цифр: 1234 567890 12
    const parts = []
    parts.push(digits.substring(0, 4))
    parts.push(digits.substring(4, 10))
    parts.push(digits.substring(10, 12))
    formData.inn = parts.filter(p => p).join(' ')
  }
}

const validateName = () => {
  validation.name = formData.name.trim().length >= 2
}

const validateINN = () => {
  const digits = formData.inn.replace(/\D/g, '')
  validation.inn = /^\d{10,12}$/.test(digits)
}

const validateCompanyType = () => {
  validation.company_type = formData.company_type_id !== null
}

const validateDate = () => {
  if (!formData.founding_date) {
    validation.date = true
    return
  }

  const selectedDate = new Date(formData.founding_date)
  validation.date = selectedDate <= maxDate.value
}

const resetForm = () => {
  Object.assign(formData, {
    name: '',
    inn: '',
    company_type_id: null,
    director_name: '',
    founding_date: null,
    authorized_capital: null
  })

  Object.keys(validation).forEach(key => {
    validation[key as keyof ValidationState] = true
  })
}

const initializeForm = () => {
  if (props.company) {
    // Заполняем форму данными компании
    formData.name = props.company.name
    formData.inn = props.company.inn
    formData.company_type_id = props.company.company_type.id
    formData.director_name = props.company.director_name || ''
    formData.founding_date = props.company.founding_date || null
    formData.authorized_capital = props.company.authorized_capital
        ? parseFloat(props.company.authorized_capital)
        : null

    // Валидация загруженных данных
    validateName()
    validateINN()
    validateCompanyType()
    validateDate()
  } else {
    resetForm()
  }
}

const handleSubmit = () => {
  // Проверяем валидность всех полей
  validateName()
  validateINN()
  validateCompanyType()
  validateDate()

  if (!isFormValid.value) {
    toast.add({
      severity: 'warn',
      summary: 'Внимание',
      detail: 'Заполните все обязательные поля корректно',
      life: 3000
    })
    return
  }
  const date = new Date(formData.founding_date);
  const isoDate = date.toISOString(); // "2025-12-02T21:00:00.000Z"
  const dateOnly = isoDate.slice(0, 10);

  // Подготавливаем данные для отправки
  const submitData = {
    name: formData.name.trim(),
    inn: formData.inn.replace(/\D/g, ''), // Убираем форматирование
    company_type_id: formData.company_type_id!,
    director_name: formData.director_name.trim() || null,
    founding_date: dateOnly,
    authorized_capital: formData.authorized_capital?.toString() || null
  }

  emit('submit', submitData)
}

const handleCancel = () => {
  if (props.company || Object.values(formData).some(value =>
      value !== '' && value !== null && value !== undefined
  )) {
    // Показываем подтверждение, если есть изменения
    confirm.require({
      message: 'Все несохраненные изменения будут потеряны. Продолжить?',
      header: 'Подтверждение',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        resetForm()
        emit('cancel')
      },
      reject: () => {}
    })
  } else {
    emit('cancel')
  }
}

const cloneCompany = () => {
  const cloneData = {
    ...formData,
    name: `${formData.name} (копия)`
  }
  emit('clone', cloneData)
}

// Watchers
watch(() => props.company, initializeForm, { immediate: true })

watch(() => formData.name, () => {
  if (formData.name.length > 0) validateName()
})

watch(() => formData.inn, () => {
  if (formData.inn.length > 0) validateINN()
})

watch(() => formData.company_type_id, validateCompanyType)
watch(() => formData.founding_date, validateDate)

// Lifecycle
onMounted(async () => {
  await loadCompanyTypes()

  // Если компания для редактирования, а типы еще не загружены,
  // устанавливаем правильный тип после загрузки
  watch(companyTypes, () => {
    if (props.company && formData.company_type_id === null) {
      formData.company_type_id = props.company.company_type.id
      validateCompanyType()
    }
  }, { immediate: true })
})

// Экспортируем методы для родительского компонента
defineExpose({
  resetForm,
  validateForm: () => {
    validateName()
    validateINN()
    validateCompanyType()
    validateDate()
    return isFormValid.value
  }
})
</script>

<style scoped>
.field {
  @apply space-y-1;
}

.p-invalid {
  @apply border-red-500 focus:border-red-500 focus:ring-red-500;
}

:deep(.p-dropdown) {
  width: 100%;
}

:deep(.p-calendar) {
  width: 100%;
}

:deep(.p-inputnumber) {
  width: 100%;
}

.preview-chip {
  @apply text-xs px-2 py-1 rounded-full;
}

/* Стили для полей с иконками */
:deep(.p-inputgroup-addon) {
  @apply bg-gray-50 border-gray-300;
}
</style>