<script setup lang="ts">

const settingsStore = useSettingsStore()
const {menuItems} = storeToRefs(settingsStore)
const menuActive = ref(false)
const route = useRoute()
watch(
    () => route.fullPath, // отслеживание изменения полного пути маршрута
    (newPath, oldPath) => {
      menuActive.value = false;
    },
    { immediate: true } // опция для немедленного выполнения коллбэка
);

</script>

<template>
  <div class="min-h-screen bg-gray-50 block md:flex">

    <!-- Левая колонка - Навигационное меню -->
    <div class="hidden md:block w-80 bg-white shadow-lg border-r border-gray-200">
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-xl font-semibold text-gray-800">Навигация</h2>
      </div>

      <div class="p-4 space-y-2">

          <nuxt-link
              v-for="item in menuItems"
              :key="item.id"
              class="flex items-center p-3 rounded-lg hover:bg-blue-300/20 transition-colors cursor-pointer  focus:outline-none"
              exact-active-class="bg-blue-300"
              :to="item.page.url"
          >
            <i :class="item.icon" class="mr-3 text-gray-600"></i>
            <span class="font-medium">{{ item?.page.label }}</span>
          </nuxt-link>

      </div>
    </div>
    <div class="flex md:hidden bg-white shadow-lg border-r border-gray-200  p-1  justify-end">

      <Button icon="pi pi-bars" text @click="menuActive = true"/>

    </div>
    <!-- Правая колонка - Рабочая область -->
    <div class="flex-1 py-6">
       <slot/>
    </div>
  </div>
  <Drawer v-model:visible="menuActive" header=" " position="right">
    <div class="p-4 space-y-2">

      <nuxt-link
          v-for="item in menuItems"
          :key="item.id"
          class="flex items-center p-3 rounded-lg hover:bg-blue-300/20 transition-colors cursor-pointer  focus:outline-none"
          exact-active-class="bg-blue-300"
          :to="item.page.url"
      >
        <i :class="item.icon" class="mr-3 text-gray-600"></i>
        <span class="font-medium">{{ item?.page.label }}</span>
      </nuxt-link>

    </div>


  </Drawer>
</template>


<style scoped>
/* Дополнительные стили при необходимости */
:deep(.p-panelmenu .p-panelmenu-header > a) {
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  margin-bottom: 0.25rem;
}

:deep(.p-panelmenu .p-panelmenu-content) {
  border: none;
  padding-left: 1.5rem;
}

:deep(.p-panelmenu .p-menuitem-link) {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
}
</style>