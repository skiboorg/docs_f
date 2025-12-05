<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div class="grid md:grid-cols-2 gap-6">
      <!-- Основная информация -->
      <div class="space-y-4">
        <h4 class="font-semibold text-gray-900">Основная информация</h4>

        <div class="field">
          <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
            Название компании *
          </label>
          <InputText
              id="name"
              v-model="formData.name"
              class="w-full"
              placeholder="ООО 'Компания'"
              required
          />
        </div>

        <div class="field">
          <label for="inn" class="block text-sm font-medium text-gray-700 mb-2">
            ИНН *
          </label>
          <InputText
              id="inn"
              v-model="formData.inn"
              class="w-full"
              placeholder="1234567890"
              required
          />
        </div>
      </div>

      <!-- Контактная информация -->
      <div class="space-y-4">
        <h4 class="font-semibold text-gray-900">Контактная информация</h4>

        <div class="field">
          <label for="contactName" class="block text-sm font-medium text-gray-700 mb-2">
            Контактное лицо *
          </label>
          <InputText
              id="contactName"
              v-model="formData.contact.name"
              class="w-full"
              placeholder="Иванов Иван Иванович"
              required
          />
        </div>

        <div class="field">
          <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
            Телефон *
          </label>
          <InputText
              id="phone"
              v-model="formData.contact.phone"
              class="w-full"
              placeholder="+7 495 123-45-67"
              required
          />
        </div>

        <div class="field">
          <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <InputText
              id="email"
              v-model="formData.contact.email"
              class="w-full"
              placeholder="info@company.ru"
              type="email"
              required
          />
        </div>

        <div class="field">
          <label for="address" class="block text-sm font-medium text-gray-700 mb-2">
            Адрес *
          </label>
          <Textarea
              id="address"
              v-model="formData.contact.address"
              class="w-full"
              rows="2"
              placeholder="г. Москва, ул. Примерная, д. 1"
              required
          />
        </div>
      </div>
    </div>

    <!-- Кнопки действий -->
    <div class="flex justify-end gap-3 pt-4 border-t">
      <Button
          type="button"
          label="Отмена"
          class="p-button-text p-button-secondary"
          @click="$emit('cancel')"
      />
      <Button
          type="submit"
          :label="props.company ? 'Сохранить' : 'Добавить'"
          class="p-button-primary"
      />
    </div>
  </form>
</template>

<script setup>
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'

const props = defineProps({
  company: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['submit', 'cancel'])

// Данные формы
const formData = reactive({
  name: '',
  inn: '',
  contact: {
    name: '',
    phone: '',
    email: '',
    address: ''
  }
})

// Инициализация формы данными компании при редактировании
watch(() => props.company, (company) => {
  if (company) {
    Object.assign(formData, JSON.parse(JSON.stringify(company)))
  } else {
    // Сброс формы для новой компании
    Object.assign(formData, {
      name: '',
      inn: '',
      contact: {
        name: '',
        phone: '',
        email: '',
        address: ''
      }
    })
  }
}, { immediate: true })

// Обработка отправки формы
const handleSubmit = () => {
  emit('submit', formData)
}
</script>