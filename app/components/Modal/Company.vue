<script setup lang="ts">
import { ref, computed, reactive, watch, onMounted } from 'vue'
import type { ICompany, ICompanyType, IHead, ICompanyHead } from '~/repository/company/types'

const { $api } = useNuxtApp()
const toast = useToast()

// Props
interface Props {
  company?: ICompany | null
  loading?: boolean
  is_edit_mode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  company: null,
  loading: false
})

// Emits
const emit = defineEmits<{
  submit: [data: FormData]
  hide: null
  cancel: []
}>()

// Типы
interface HeadFormData {
  id?: string
  fio: string
  inn: string
  passport: string
  registration: string
  start_date: string | null
  end_date: string | null
  is_active: boolean
}

interface FormData {
  id?: string
  name: string
  inn: string
  company_type_id: number | null
  founding_date: string | null
  authorized_capital: string | null
  use_inn_for_create: boolean
  heads: HeadFormData[]
}

interface ValidationState {
  name: boolean
  inn: boolean
  company_type: boolean
  founding_date: boolean
  authorized_capital: boolean
}

// Реактивные данные
const formData = reactive<FormData>({
  name: '',
  inn: '',
  company_type_id: null,
  founding_date: null,
  authorized_capital: null,
  use_inn_for_create: false,
  heads: []
})

const validation = reactive<ValidationState>({
  name: true,
  inn: true,
  company_type: true,
  founding_date: true,
  authorized_capital: true
})

const companyTypes = ref<ICompanyType[]>([])
const companyTypesLoading = ref(false)
const maxDate = ref(new Date())
const showHeadDialog = ref(false)
const editingHeadIndex = ref<number | null>(null)
const currentHead = ref<HeadFormData>({
  fio: '',
  inn: '',
  passport: '',
  registration: '',
  start_date: null,
  end_date: null,
  is_active: true
})

// Вычисляемые свойства
const isNameValid = computed(() => validation.name && formData.name.trim().length >= 2)
const isINNValid = computed(() => validation.inn && /^\d{10,12}$/.test(formData.inn.replace(/\D/g, '')))
const isCompanyTypeValid = computed(() => validation.company_type && formData.company_type_id !== null)
const isFoundingDateValid = computed(() => {
  if (!formData.founding_date) return false
  const selectedDate = new Date(formData.founding_date)
  return validation.founding_date && selectedDate <= maxDate.value
})
const isAuthorizedCapitalValid = computed(() => {
  if (!formData.authorized_capital) return false
  const value = parseFloat(formData.authorized_capital)
  return validation.authorized_capital && !isNaN(value) && value >= 0
})

const isFormValidInnMode = computed(() => isINNValid.value)

const isFormValidFullMode = computed(() =>
    isNameValid.value &&
    isINNValid.value &&
    isCompanyTypeValid.value &&
    isFoundingDateValid.value &&
    isAuthorizedCapitalValid.value
)

const isFormValid = computed(() =>
    formData.use_inn_for_create ? isFormValidInnMode.value : isFormValidFullMode.value
)

const activeHeads = computed(() => formData.heads.filter(h => h.is_active))
const inactiveHeads = computed(() => formData.heads.filter(h => !h.is_active))

const submitButtonLabel = computed(() => {
  if (props.loading) {
    return props.is_edit_mode ? 'Сохранение...' : 'Создание...'
  }
  return props.is_edit_mode ? 'Сохранить' : 'Создать'
})

const isHeadValid = computed(() => {
  return currentHead.value.fio.trim().length >= 2
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
  const digits = formData.inn.replace(/\D/g, '')

  if (digits.length <= 10) {
    formData.inn = digits
  } else {
    const parts = []
    parts.push(digits.substring(0, 4))
    parts.push(digits.substring(4, 10))
    parts.push(digits.substring(10, 12))
    formData.inn = parts.filter(p => p).join(' ')
  }
}

const formatHeadINN = () => {
  const digits = currentHead.value.inn.replace(/\D/g, '')

  if (digits.length <= 10) {
    currentHead.value.inn = digits
  } else {
    const parts = []
    parts.push(digits.substring(0, 4))
    parts.push(digits.substring(4, 10))
    parts.push(digits.substring(10, 12))
    currentHead.value.inn = parts.filter(p => p).join(' ')
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

const validateFoundingDate = () => {
  if (!formData.founding_date) {
    validation.founding_date = false
    return
  }

  const selectedDate = new Date(formData.founding_date)
  validation.founding_date = selectedDate <= maxDate.value
}

const validateAuthorizedCapital = () => {
  if (!formData.authorized_capital) {
    validation.authorized_capital = false
    return
  }

  const value = parseFloat(formData.authorized_capital)
  validation.authorized_capital = !isNaN(value) && value >= 0
}

const resetForm = () => {
  Object.assign(formData, {
    id: '',
    name: '',
    inn: '',
    company_type_id: null,
    founding_date: null,
    authorized_capital: null,
    use_inn_for_create: false,
    heads: []
  })

  Object.keys(validation).forEach(key => {
    validation[key as keyof ValidationState] = true
  })
}

const initializeForm = () => {
  if (props.company) {
    formData.id = props.company.id
    formData.name = props.company.name
    formData.inn = props.company.inn
    formData.company_type_id = props.company.company_type?.id || null
    formData.founding_date = props.company.founding_date || null
    formData.authorized_capital = props.company.authorized_capital || null
    formData.use_inn_for_create = false

    // Загружаем руководителей
    formData.heads = (props.company.heads || []).map((companyHead: ICompanyHead) => ({
      id: companyHead.id,
      fio: companyHead.head.fio || '',
      inn: companyHead.head.inn || '',
      passport: companyHead.head.passport || '',
      registration: companyHead.head.registration || '',
      start_date: companyHead.start_date || null,
      end_date: companyHead.end_date || null,
      is_active: companyHead.is_active
    }))

    validateName()
    validateINN()
    validateCompanyType()
    validateFoundingDate()
    validateAuthorizedCapital()
  } else {
    resetForm()
  }
}

const openHeadDialog = (index: number | null = null) => {
  if (index !== null) {
    editingHeadIndex.value = index
    currentHead.value = { ...formData.heads[index] }
  } else {
    editingHeadIndex.value = null
    currentHead.value = {
      fio: '',
      inn: '',
      passport: '',
      registration: '',
      start_date: null,
      end_date: null,
      is_active: true
    }
  }
  showHeadDialog.value = true
}

const saveHead = () => {
  if (!isHeadValid.value) {
    toast.add({
      severity: 'warn',
      summary: 'Внимание',
      detail: 'Заполните обязательные поля руководителя',
      life: 3000
    })
    return
  }

  if (editingHeadIndex.value !== null) {
    formData.heads[editingHeadIndex.value] = { ...currentHead.value }
    toast.add({
      severity: 'success',
      summary: 'Успешно',
      detail: 'Руководитель обновлен',
      life: 3000
    })
  } else {
    formData.heads.push({ ...currentHead.value })
    toast.add({
      severity: 'success',
      summary: 'Успешно',
      detail: 'Руководитель добавлен',
      life: 3000
    })
  }

  showHeadDialog.value = false
}

const removeHead = (index: number) => {
  formData.heads.splice(index, 1)
  toast.add({
    severity: 'info',
    summary: 'Удалено',
    detail: 'Руководитель удален',
    life: 3000
  })
}

const toggleHeadStatus = (index: number) => {
  formData.heads[index].is_active = !formData.heads[index].is_active
}

const handleSubmit = () => {
  if (formData.use_inn_for_create) {
    validateINN()
    if (!isFormValidInnMode.value) {
      toast.add({
        severity: 'warn',
        summary: 'Внимание',
        detail: 'Введите корректный ИНН',
        life: 3000
      })
      return
    }
  } else {
    validateName()
    validateINN()
    validateCompanyType()
    validateFoundingDate()
    validateAuthorizedCapital()

    if (!isFormValidFullMode.value) {
      toast.add({
        severity: 'warn',
        summary: 'Внимание',
        detail: 'Заполните все обязательные поля корректно',
        life: 3000
      })
      return
    }
  }

  const submitData: any = {
    inn: formData.inn.replace(/\D/g, ''),
    use_inn_for_create: formData.use_inn_for_create
  }

  if (!formData.use_inn_for_create) {
    submitData.id = formData.id || undefined
    submitData.name = formData.name.trim()
    submitData.company_type_id = formData.company_type_id

    // Форматируем дату в YYYY-MM-DD
    if (formData.founding_date) {
      const date = new Date(formData.founding_date)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      submitData.founding_date = `${year}-${month}-${day}`
    }

    submitData.authorized_capital = formData.authorized_capital
    submitData.heads = formData.heads.map(head => {
      const headData: any = {
        fio: head.fio.trim(),
        is_active: head.is_active
      }

      // Добавляем id только если он есть
      if (head.id) {
        headData.id = head.id
      }

      // Добавляем опциональные поля только если они заполнены
      if (head.inn && head.inn.trim()) {
        headData.inn = head.inn.replace(/\D/g, '')
      }

      if (head.passport && head.passport.trim()) {
        headData.passport = head.passport.trim()
      }

      if (head.registration && head.registration.trim()) {
        headData.registration = head.registration.trim()
      }

      // Форматируем даты
      if (head.start_date) {
        const date = new Date(head.start_date)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        headData.start_date = `${year}-${month}-${day}`
      }

      if (head.end_date) {
        const date = new Date(head.end_date)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        headData.end_date = `${year}-${month}-${day}`
      }

      return headData
    })
  }

  emit('submit', submitData)
}

const formatDate = (date: string | null) => {
  if (!date) return 'Не указано'
  return new Date(date).toLocaleDateString('ru-RU')
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

watch(() => formData.founding_date, () => {
  if (formData.founding_date) validateFoundingDate()
})

watch(() => formData.authorized_capital, () => {
  if (formData.authorized_capital) validateAuthorizedCapital()
})

// Lifecycle
onMounted(async () => {
  await loadCompanyTypes()
})

// Экспортируем методы для родительского компонента
defineExpose({
  resetForm,
  validateForm: () => {
    if (formData.use_inn_for_create) {
      validateINN()
      return isFormValidInnMode.value
    } else {
      validateName()
      validateINN()
      validateCompanyType()
      validateFoundingDate()
      validateAuthorizedCapital()
      return isFormValidFullMode.value
    }
  }
})
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Переключатель режима создания -->
    <div v-if="!is_edit_mode" class="field">
      <div class="flex items-center gap-2">
        <Checkbox
            v-model="formData.use_inn_for_create"
            inputId="use_inn_for_create"
            binary
            :disabled="loading"
        />
        <label for="use_inn_for_create" class="text-sm font-medium text-gray-700">
          Создать по ИНН (автоматическое заполнение)
        </label>
      </div>
      <small class="text-gray-500 text-xs block mt-1">
        Данные компании будут загружены автоматически
      </small>
    </div>

    <!-- Режим "Создать по ИНН" -->
    <div v-if="formData.use_inn_for_create" class="space-y-4">
      <div class="field">
        <label for="inn_auto" class="block text-sm font-medium text-gray-700 mb-2">
          ИНН *
        </label>
        <InputText
            id="inn_auto"
            v-model="formData.inn"
            class="w-full"
            :class="{ 'p-invalid': !isINNValid }"
            placeholder="1234567890 или 123456789012"
            :disabled="loading"
            @blur="validateINN"
            @input="formatINN"
        />
        <small v-if="!isINNValid" class="p-error text-xs">
          Введите корректный ИНН (10 или 12 цифр)
        </small>
      </div>
    </div>

    <!-- Полная форма -->
    <div v-else class="space-y-6">
      <!-- Основная информация -->
      <div class="space-y-4">
        <h4 class="font-semibold text-gray-900">Основная информация</h4>

        <div class="grid md:grid-cols-2 gap-6">
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
                :disabled="loading || is_edit_mode"
                @blur="validateINN"
                @input="formatINN"
            />
            <small v-if="!isINNValid" class="p-error text-xs">
              Введите корректный ИНН (10 или 12 цифр)
            </small>
            <small v-else-if="is_edit_mode" class="text-gray-500 text-xs">
              ИНН нельзя изменить
            </small>
          </div>
        </div>

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
                placeholder="Выберите тип"
                class="w-full"
                :class="{ 'p-invalid': !isCompanyTypeValid }"
                :loading="companyTypesLoading"
                :disabled="loading || companyTypesLoading"
                :filter="true"
                filterPlaceholder="Поиск..."
                showClear
            >
              <template #value="slotProps">
                <div v-if="slotProps.value" class="flex items-center">
                  <div class="w-3 h-3 rounded-full mr-2" :class="getCompanyTypeColor(slotProps.value)"></div>
                  <span>{{ getCompanyTypeName(slotProps.value) }}</span>
                </div>
                <span v-else class="text-gray-400">Выберите тип</span>
              </template>
              <template #option="slotProps">
                <div class="flex items-center">
                  <div class="w-3 h-3 rounded-full mr-2" :class="getCompanyTypeColor(slotProps.option.id)"></div>
                  <span>{{ slotProps.option.name }}</span>
                </div>
              </template>
            </Dropdown>
            <small v-if="!isCompanyTypeValid" class="p-error text-xs">
              Тип компании обязателен
            </small>
          </div>

          <!-- Дата основания -->
          <div class="field">
            <label for="founding_date" class="block text-sm font-medium text-gray-700 mb-2">
              Дата основания *
            </label>
            <Calendar
                v-model="formData.founding_date"
                dateFormat="yy-mm-dd"
                class="w-full"
                :class="{ 'p-invalid': !isFoundingDateValid }"
                :disabled="loading"
                :showIcon="true"
                :maxDate="maxDate"
                placeholder="Выберите дату"
                :manualInput="false"
            />
            <small v-if="!isFoundingDateValid" class="p-error text-xs">
              Дата обязательна и не может быть в будущем
            </small>
          </div>
        </div>

        <!-- Уставный капитал -->
        <div class="field">
          <label for="capital" class="block text-sm font-medium text-gray-700 mb-2">
            Уставный капитал *
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
          />
          <small v-if="!isAuthorizedCapitalValid" class="p-error text-xs">
            Уставный капитал обязателен и должен быть >= 0
          </small>
        </div>
      </div>

      <!-- Руководители -->
      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <h4 class="font-semibold text-gray-900">Руководители</h4>
          <Button
              type="button"
              label="Добавить руководителя"
              icon="pi pi-plus"
              class="p-button-sm"
              @click="openHeadDialog(null)"
              :disabled="loading"
          />
        </div>

        <!-- Активные руководители -->
        <div v-if="activeHeads.length > 0" class="space-y-2">
          <p class="text-sm font-medium text-gray-600">Действующие</p>
          <div v-for="(head, index) in formData.heads.filter(h => h.is_active)" :key="index"
               class="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <p class="font-medium text-gray-900">{{ head.fio }}</p>
                <div class="mt-2 space-y-1 text-sm text-gray-600">
                  <p v-if="head.inn"><span class="font-medium">ИНН:</span> {{ head.inn }}</p>
                  <p v-if="head.passport"><span class="font-medium">Паспорт:</span> {{ head.passport }}</p>
                  <p v-if="head.registration"><span class="font-medium">Прописка:</span> {{ head.registration }}</p>
                  <p><span class="font-medium">Дата назначения:</span> {{ formatDate(head.start_date) }}</p>
                  <p v-if="head.end_date"><span class="font-medium">Дата окончания:</span> {{ formatDate(head.end_date) }}</p>
                </div>
              </div>
              <div class="flex gap-2 ml-4">
                <Button
                    type="button"
                    icon="pi pi-pencil"
                    class="p-button-sm p-button-text"
                    @click="openHeadDialog(formData.heads.indexOf(head))"
                    :disabled="loading"
                />
                <Button
                    type="button"
                    icon="pi pi-times"
                    class="p-button-sm p-button-text p-button-danger"
                    @click="toggleHeadStatus(formData.heads.indexOf(head))"
                    :disabled="loading"
                    v-tooltip="'Деактивировать'"
                />
                <Button
                    type="button"
                    icon="pi pi-trash"
                    class="p-button-sm p-button-text p-button-danger"
                    @click="removeHead(formData.heads.indexOf(head))"
                    :disabled="loading"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Неактивные руководители -->
        <div v-if="inactiveHeads.length > 0" class="space-y-2 mt-4">
          <p class="text-sm font-medium text-gray-600">Неактивные</p>
          <div v-for="(head, index) in formData.heads.filter(h => !h.is_active)" :key="index"
               class="border rounded-lg p-4 bg-gray-50 opacity-75">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <p class="font-medium text-gray-700">{{ head.fio }}</p>
                <div class="mt-2 space-y-1 text-sm text-gray-500">
                  <p v-if="head.inn"><span class="font-medium">ИНН:</span> {{ head.inn }}</p>
                  <p><span class="font-medium">Период:</span> {{ formatDate(head.start_date) }} - {{ formatDate(head.end_date) }}</p>
                </div>
              </div>
              <div class="flex gap-2 ml-4">
                <Button
                    type="button"
                    icon="pi pi-check"
                    class="p-button-sm p-button-text p-button-success"
                    @click="toggleHeadStatus(formData.heads.indexOf(head))"
                    :disabled="loading"
                    v-tooltip="'Активировать'"
                />
                <Button
                    type="button"
                    icon="pi pi-trash"
                    class="p-button-sm p-button-text p-button-danger"
                    @click="removeHead(formData.heads.indexOf(head))"
                    :disabled="loading"
                />
              </div>
            </div>
          </div>
        </div>

        <div v-if="formData.heads.length === 0" class="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
          <i class="pi pi-users text-4xl mb-2"></i>
          <p>Руководители не добавлены</p>
        </div>
      </div>
    </div>

    <!-- Кнопки действий -->
    <div class="flex justify-between gap-3 pt-4 border-t">
      <Button
          type="button"
          label="Отмена"
          class="p-button-text p-button-secondary"
          @click="emit('cancel')"
          :disabled="loading"
      />
      <Button
          type="submit"
          :label="submitButtonLabel"
          class="p-button-primary"
          :loading="loading || companyTypesLoading"
          :disabled="!isFormValid || loading"
          icon="pi pi-check"
      />
    </div>

    <!-- Диалог добавления/редактирования руководителя -->
    <Dialog
        v-model:visible="showHeadDialog"
        :header="editingHeadIndex !== null ? 'Редактировать руководителя' : 'Добавить руководителя'"
        :modal="true"
        :style="{ width: '600px' }"
    >
      <div class="space-y-4 py-4">
        <!-- ФИО -->
        <div class="field">
          <label for="head_fio" class="block text-sm font-medium text-gray-700 mb-2">
            ФИО *
          </label>
          <InputText
              id="head_fio"
              v-model="currentHead.fio"
              class="w-full"
              placeholder="Иванов Иван Иванович"
          />
        </div>

        <!-- ИНН руководителя -->
        <div class="field">
          <label for="head_inn" class="block text-sm font-medium text-gray-700 mb-2">
            ИНН
          </label>
          <InputText
              id="head_inn"
              v-model="currentHead.inn"
              class="w-full"
              placeholder="123456789012"
              @input="formatHeadINN"
          />
        </div>

        <!-- Паспорт -->
        <div class="field">
          <label for="head_passport" class="block text-sm font-medium text-gray-700 mb-2">
            Серия и номер паспорта
          </label>
          <InputText
              id="head_passport"
              v-model="currentHead.passport"
              class="w-full"
              placeholder="1234 567890"
          />
        </div>

        <!-- Прописка -->
        <div class="field">
          <label for="head_registration" class="block text-sm font-medium text-gray-700 mb-2">
            Прописка
          </label>
          <Textarea
              id="head_registration"
              v-model="currentHead.registration"
              class="w-full"
              rows="3"
              placeholder="Адрес регистрации"
          />
        </div>

        <!-- Даты -->
        <div class="grid grid-cols-2 gap-4">
          <div class="field">
            <label for="head_start_date" class="block text-sm font-medium text-gray-700 mb-2">
              Дата назначения
            </label>
            <Calendar
                v-model="currentHead.start_date"
                dateFormat="yy-mm-dd"
                class="w-full"
                :showIcon="true"
                :maxDate="maxDate"
                placeholder="Выберите дату"
            />
          </div>

          <div class="field">
            <label for="head_end_date" class="block text-sm font-medium text-gray-700 mb-2">
              Дата окончания
            </label>
            <Calendar
                v-model="currentHead.end_date"
                dateFormat="yy-mm-dd"
                class="w-full"
                :showIcon="true"
                placeholder="Выберите дату"
            />
          </div>
        </div>

        <!-- Статус -->
        <div class="field">
          <div class="flex items-center gap-2">
            <Checkbox
                v-model="currentHead.is_active"
                inputId="head_is_active"
                binary
            />
            <label for="head_is_active" class="text-sm font-medium text-gray-700">
              Действующий руководитель
            </label>
          </div>
        </div>
      </div>

      <template #footer>
        <Button
            label="Отмена"
            class="p-button-text"
            @click="showHeadDialog = false"
        />
        <Button
            label="Сохранить"
            @click="saveHead"
            :disabled="!isHeadValid"
        />
      </template>
    </Dialog>
  </form>
</template>

<style scoped>
.field {
  @apply space-y-1;
}

.p-invalid {
  @apply border-red-500 focus:border-red-500 focus:ring-red-500;
}

:deep(.p-dropdown),
:deep(.p-calendar),
:deep(.p-inputnumber) {
  width: 100%;
}
</style>