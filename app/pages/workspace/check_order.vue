<script setup lang="ts">
import { debounce } from 'lodash-es'
import type {IDocumentType, IVersionResponseResult} from "~/repository/document/types";

const {$api} = useNuxtApp()

const companies = ref([])
const toast = useToast()
const selectedCompany = ref(null)
const newType = ref(null)

const filters = ref({
  page: 1,
  company:null,
  document_type_ids:null,

})
const page = ref(1)
const selectedType = ref(null)
const loading = ref(false)
const { data: document_types} = useHttpRequest(
    useAsyncData<IDocumentType[]>('document-types', () => $api.document.types()),
    'Ошибка при загрузке типов документов'
);
const { data: version_response, pending, error, refresh } = useHttpRequest(
    useAsyncData<IVersionResponseResult>('version_response', () => $api.document.versions({
        query:{
          company: filters.value.company,
          page: filters.value.page,
          status:'on_approval',
          document_type_ids: filters.value.document_type_ids
    }})),
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

const companyClear = async () => {
  filters.value.company = null
  await refresh()
}
const companySelected = async () => {
  filters.value.company = selectedCompany.value.uuid
  await refresh()
}

const vesionAction = async (action:'approve'|'reject',uuid:string) => {
  loading.value = true
  try{
    await $api.document.version_action({
      action,
      uuid
    })
    await refresh()
  }catch(error){
    console.log(error)
  }finally{
    loading.value = false
  }

}

watch(selectedType,async ()=>{
  filters.value.document_type_ids = selectedType.value.join(",")
  await refresh()
})

const groupedByCompany = computed(() => {
  const data = version_response.value?.results;

  if (!data || !Array.isArray(data)) return [];

  // Инициализируем comment и new_type для каждого документа
  const processedData = data.map(item => ({
    ...item,

    comment: item.comment || '',
    valid_from: new Date(item.valid_from) || null,
    valid_until: new Date(item.valid_until) || null,
    new_type: item.new_type || null
  }));

  return Object.values(
      processedData.reduce((acc: any, item: any) => {
        const companyName = item.document.company_name;

        if (!acc[companyName]) {
          acc[companyName] = {
            company_name: companyName,
            documents: []
          };
        }

        acc[companyName].documents.push(item);
        return acc;
      }, {})
  );
});
function formatDateForDjango(date) {
  // Проверяем, что date существует и является валидной датой
  console.log(date)
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return null; // или return '' в зависимости от ваших требований
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const newTypeSelected = async (doc) => {
  console.log(doc)
  console.log(formatDateForDjango(doc.valid_from))
  await $api.document.version_update({
    uuid: doc.uuid,
    type: doc.new_type,
    comment: doc.comment,
    valid_from: formatDateForDjango(doc.valid_from),
    valid_until: formatDateForDjango(doc.valid_until)
  })
  await refresh()
}
</script>
<template>
  <div class="container ">
    <div class="max-w-7xl mx-auto">
      <!-- Заголовок -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          Очередь проверки
        </h1>


        <p class="text-gray-600">
          Документы, ожидающие утверждения (0)
        </p>
      </div>
      <div class="grid grid-cols-1  md:grid-cols-12 gap-5">
        <div class="col-span-12 md:col-span-4">
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
                  @option-select = "companySelected"
                  @clear="companyClear"
              />
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
        <div class="col-span-12 md:col-span-8">
          <div class="space-y-4">
            <div v-for="company in groupedByCompany" :key="company.company_name" class="p-3 mb-2 border rounded-xl bg-gray-50">
              <h3 class="text-2xl">{{ company.company_name }}</h3>

              <div v-for="doc in company.documents" :key="doc.uuid" class="grid grid-cols-12 border-b pb-2 mb-2">
                <div class="col-span-7  space-y-1">

                  <p v-if="doc.document.document_type_name" class="font-medium">{{doc.document.document_type_name}}  </p>

                  <div class="flex flex-wrap md:flex-nowrap items-center gap-3">
                    <Select v-if="!doc.document.document_type_name"
                            :options="document_types"
                            v-model="doc.new_type"
                            size="small"
                            option-label="name"

                            placeholder="Выберите тип"/>
                    <DatePicker size="small"  v-model="doc.valid_from" dateFormat="dd/mm/yy" placeholder="Действует с"/>
                    <DatePicker size="small"  v-model="doc.valid_until" dateFormat="dd/mm/yy" placeholder="Действует до"/>
                    <div class="">
                      <Button size="small"  severity="success"  icon="pi pi-check" @click="newTypeSelected(doc)"/>
                    </div>


                  </div>
                  <p class="text-xs">{{decodeURIComponent(doc.file?.split('/').pop() || '')}}</p>
                  <p class="text-xs"><i class="pi pi-calendar"></i> {{new Date(doc.upload_date).toLocaleDateString()}}</p>
                  <p class="text-xs"><i class="pi pi-user"></i> {{doc.uploaded_by.email}}</p>

                  <p class="text-xs">Размер: {{doc.file_size}}</p>

                  <Textarea fluid size="small" @blur="newTypeSelected(doc)" v-model="doc.comment"  placeholder="Введите коментарий"/>

                </div>

                <div class="col-span-5 flex items-start gap-2 justify-end">

                  <a target="_blank" :href="doc.file">
                    <Button text severity="secondary" icon="pi pi-eye"/>
                  </a>
                  <UIBtnConfirmBtn v-if="doc.document.document_type_name" severity="success"
                                   message="Принять документ?"
                                   :loading="loading"
                                   icon="pi pi-check" @confirm="vesionAction('approve',doc.uuid)"/>

                  <UIBtnConfirmBtn v-if="doc.document.document_type_name" message="Отклонить документ?"
                                   :loading="loading"
                                   icon="pi pi-ban"
                                   @confirm="vesionAction('reject',doc.uuid)"/>

                </div>
              </div>
            </div>


<!--            <div v-for="doc in version_response?.results" :key="doc.id" class="p-3 mb-2 border rounded-xl bg-gray-50 grid grid-cols-12" >-->

<!--              <div class="col-span-7  space-y-1">-->
<!--                <p class="font-medium">{{doc.document.company_name}}</p>-->
<!--                <p class="font-medium">{{doc.document.document_type_name}}  </p>-->
<!--                <div class="flex items-center gap-3">-->

<!--                  <p class="font-medium">{{doc.document.name}} Версия: {{ doc.version }} </p>-->
<!--                  <UIStatus :status="doc.status" />-->
<!--                  <p class="text-xs rounded-xl py-1 px-2 bg-gray-200" v-if="doc.is_current">Текущая</p>-->
<!--                </div>-->
<!--                <p class="text-xs">{{doc.file?.split('/').reverse()[0]}}</p>-->
<!--                <p class="text-xs"><i class="pi pi-calendar"></i> {{new Date(doc.upload_date).toLocaleDateString()}}</p>-->
<!--                <p class="text-xs"><i class="pi pi-user"></i> {{doc.uploaded_by.email}}</p>-->
<!--                <p class="text-xs"> Действует с: {{ new Date(doc.valid_from).toLocaleDateString() }} • До: {{ new Date(doc.valid_until).toLocaleDateString() }}</p>-->
<!--                <p class="text-xs">Размер: {{doc.file_size}}</p>-->
<!--                <p class="text-xs">Утверждено: {{doc.reviewed_by?.email}} {{ new Date(doc.review_date).toLocaleDateString() }}</p>-->

<!--              </div>-->
<!--              <div class="col-span-5 flex items-start gap-2 justify-end">-->

<!--                <a target="_blank" :href="doc.file">-->
<!--                  <Button text severity="secondary" icon="pi pi-eye"/>-->
<!--                </a>-->
<!--                <UIBtnConfirmBtn severity="success"-->
<!--                                 message="Принять документ?"-->
<!--                                 :loading="loading"-->
<!--                                 icon="pi pi-check" @confirm="vesionAction('approve',doc.uuid)"/>-->

<!--                <UIBtnConfirmBtn message="Отклонить документ?"-->
<!--                                 :loading="loading"-->
<!--                                 icon="pi pi-ban"-->
<!--                                 @confirm="vesionAction('reject',doc.uuid)"/>-->

<!--              </div>-->
<!--            </div>-->
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

