<script setup>
import Card from 'primevue/card'
import Button from 'primevue/button'
import Badge from 'primevue/badge'
import Chip from 'primevue/chip'
import Tooltip from 'primevue/tooltip'

defineProps({
  docType: {
    type: Object,
    required: true
  }
})

defineEmits(['edit', 'delete'])
</script>
<template>
  <Card class="bg-white shadow-sm border hover:shadow-md transition-shadow">
    <template #content>
      <div class="flex flex-col lg:flex-row justify-between gap-6">
        <!-- Основная информация -->
        <div class="flex-1">
          <div class="flex items-start justify-between mb-4">
            <div>
              <div class="flex items-center gap-3 mb-2">
                <h3 class="text-xl font-bold text-gray-900">{{ docType.name }}</h3>
                <Badge
                    v-if="docType.code"
                    :value="docType.code"
                    severity="info"
                />
              </div>
              <p class="text-gray-600 mb-1">{{ docType.description }}</p>
              <p class="text-sm text-gray-500">Категория: {{ docType.category }}</p>
            </div>
            <Badge
                value="Активен"
                severity="success"
            />
          </div>

          <!-- Варианты (если есть) -->
          <div v-if="docType.variants && docType.variants.length > 0" class="mb-4">
            <p class="text-sm font-medium text-gray-700 mb-2">Варианты:</p>
            <div class="flex flex-wrap gap-2">
              <Chip
                  v-for="(variant, index) in docType.variants"
                  :key="index"
                  :label="variant"
                  class="text-sm"
              />
            </div>
          </div>

          <!-- Настройки -->
          <div class="grid md:grid-cols-2 gap-4 text-sm">
            <div class="space-y-2">
              <div class="flex items-center">
                <i class="pi pi-check-circle text-green-500 mr-2" v-if="docType.settings.diamond"></i>
                <i class="pi pi-times-circle text-red-500 mr-2" v-else></i>
                <span class="text-gray-700">Алмаз</span>
              </div>
              <div class="flex items-center">
                <i class="pi pi-check-circle text-green-500 mr-2" v-if="docType.settings.variant"></i>
                <i class="pi pi-times-circle text-red-500 mr-2" v-else></i>
                <span class="text-gray-700">Вариант</span>
              </div>
            </div>
            <div class="space-y-2">
              <div class="flex items-center">
                <i class="pi pi-check-circle text-green-500 mr-2" v-if="docType.settings.accumulators"></i>
                <i class="pi pi-times-circle text-red-500 mr-2" v-else></i>
                <span class="text-gray-700">Аккумуляторы</span>
              </div>
              <div class="flex items-center">
                <i class="pi pi-building text-blue-500 mr-2"></i>
                <span class="text-gray-700">{{ docType.settings.companyTypes.join(', ') }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Действия -->
        <div class="flex lg:flex-col gap-2 lg:border-l lg:pl-6">
          <Button
              icon="pi pi-pencil"
              class="p-button-outlined p-button-secondary p-button-sm"
              @click="$emit('edit', docType)"
              v-tooltip="'Редактировать'"
          />
          <Button
              icon="pi pi-trash"
              class="p-button-outlined p-button-danger p-button-sm"
              @click="$emit('delete', docType)"
              v-tooltip="'Удалить'"
          />
          <Button
              icon="pi pi-copy"
              class="p-button-outlined p-button-help p-button-sm"
              v-tooltip="'Дублировать'"
          />
        </div>
      </div>
    </template>
  </Card>
</template>

