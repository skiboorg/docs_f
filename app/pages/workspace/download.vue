<script setup lang="ts">
import { debounce } from 'lodash-es'
import type {IDocumentResponse, IDocumentType} from "~/repository/document/types";

const {$api} = useNuxtApp()

const companies = ref([])
const toast = useToast()
const selectedCompany = ref(null)
const filters = ref({
  page: 1,
  company_uuid:null,
  document_type_ids:null,

})
const page = ref(1)
const selectedType = ref(null)
const loading = ref(false)
const { data: document_types} = useHttpRequest(
    useAsyncData<IDocumentType[]>('document-types', () => $api.document.types()),
    'Ошибка при загрузке типов документов'
);
const { data: document_response, pending, error, refresh } = useHttpRequest(
    useAsyncData<IDocumentResponse>('document_response', () => $api.document.all({
      company_uuid: filters.value.company_uuid,
      page: filters.value.page,
      document_type_ids: filters.value.document_type_ids
    })),
    'Ошибка при загрузке документов'
);

const fetchCompanies = async (event: any) => {
  loading.value = true
  console.log(event)
  try {
    const response = await $api.company.all({
      query: {
        q:event.query || undefined,
        page_size: 1000
      },
    })
    companies.value = response.results
  } finally {
    loading.value = false
  }
}

const searchCompanies = debounce(async (event: any) => {
  await fetchCompanies(event)
}, 300)
</script>
<template>
  <div class="min-h-screen bg-gray-50 p-4 ">
    <div class="max-w-7xl mx-auto">
      <!-- Заголовок -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          Скачивание документов
        </h1>
        <p class="text-gray-600">
          Загрузка документов
        </p>
      </div>
      <div class="grid grid-cols-12 gap-5">
        <div class="col-span-4">
          <Card>
            <template #title>
              <p>Фильтры</p>
            </template>
            <template #content>
              <p class="font-medium mb-2 ">Поиск</p>
              <AutoComplete
                  fluid
                  v-model="selectedCompany"
                  :suggestions="companies"
                  field="name"
                  :forceSelection="false"
                  :loading="loading"
                  option-label="name"
                  class="mb-4"
                  placeholder="Поиск компании по названию или ИНН"
                  @complete="searchCompanies"
              />
              {{selectedType}}
              <p class="font-medium mb-2 ">Типы документов</p>
              <div class="space-y-2">
                <div  class="flex items-center gap-2" v-for="type in document_types">
                  <Checkbox v-model="selectedType"  :inputId="'id_'+type.id" name="type" :value="type.id" />
                  <label :for="'id_'+type.id"> {{type.name}} </label>
                </div>
              </div>

            </template>



          </Card>


        </div>
        <div class="col-span-8">
          <div class="space-y-4">
            <CardDownload v-for="item in document_response?.results" :item="item"/>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

