<template>
  <nav class="bg-white shadow-sm border-b">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center space-x-8">
          <NuxtLink to="/" class="text-xl font-bold text-gray-900">
            DocuFlow
          </NuxtLink>
          <div class="hidden md:flex space-x-6">
            <NuxtLink
                to="/"
                class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Документы
            </NuxtLink>
            <NuxtLink
                to="/company"
                class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Компании
            </NuxtLink>
            <NuxtLink
                to="/docs_types"
                class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Типы документов
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>