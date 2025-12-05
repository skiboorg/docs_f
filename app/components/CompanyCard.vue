<template>
  <Card class="bg-white shadow-sm border hover:shadow-md transition-shadow">
    <template #content>
      <div class="flex flex-col lg:flex-row justify-between gap-6">
        <!-- Основная информация -->
        <div class="flex-1">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="text-xl font-bold text-gray-900 mb-1">{{ company.name }}</h3>
              <p class="text-gray-600">ИНН: {{ company.inn }}</p>
            </div>
            <Badge
                value="Активна"
                severity="success"
                class="ml-2"
            />
          </div>

          <!-- Контактная информация -->
          <div class="grid md:grid-cols-2 gap-4">
            <div class="space-y-3">
              <div class="flex items-start">
                <i class="pi pi-user text-gray-400 mt-1 mr-3"></i>
                <div>
                  <p class="text-sm text-gray-500">Контактное лицо</p>
                  <p class="font-medium text-gray-900">{{ company.contact.name }}</p>
                </div>
              </div>

              <div class="flex items-start">
                <i class="pi pi-phone text-gray-400 mt-1 mr-3"></i>
                <div>
                  <p class="text-sm text-gray-500">Телефон</p>
                  <p class="font-medium text-gray-900">{{ company.contact.phone }}</p>
                </div>
              </div>
            </div>

            <div class="space-y-3">
              <div class="flex items-start">
                <i class="pi pi-envelope text-gray-400 mt-1 mr-3"></i>
                <div>
                  <p class="text-sm text-gray-500">Email</p>
                  <p class="font-medium text-gray-900">{{ company.contact.email }}</p>
                </div>
              </div>

              <div class="flex items-start">
                <i class="pi pi-map-marker text-gray-400 mt-1 mr-3"></i>
                <div>
                  <p class="text-sm text-gray-500">Адрес</p>
                  <p class="font-medium text-gray-900">{{ company.contact.address }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Действия -->
        <div class="flex lg:flex-col gap-2 lg:border-l lg:pl-6">
          <Button
              icon="pi pi-pencil"
              class="p-button-outlined p-button-secondary p-button-sm"
              @click="$emit('edit', company)"
              v-tooltip="'Редактировать'"
          />
          <Button
              icon="pi pi-trash"
              class="p-button-outlined p-button-danger p-button-sm"
              @click="$emit('delete', company)"
              v-tooltip="'Удалить'"
          />
          <Button
              icon="pi pi-eye"
              class="p-button-outlined p-button-help p-button-sm"
              v-tooltip="'Просмотр документов'"
          />
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup>
import Card from 'primevue/card'
import Button from 'primevue/button'
import Badge from 'primevue/badge'
import Tooltip from 'primevue/tooltip'

defineProps({
  company: {
    type: Object,
    required: true
  }
})

defineEmits(['edit', 'delete'])
</script>