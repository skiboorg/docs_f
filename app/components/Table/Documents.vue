<script setup lang="ts">
import type {ICompany} from "~/repository/company/types";
import type {IDocumentShort, IVersion} from "~/repository/document/types";

const {$api} = useNuxtApp()
const {data:tableData, pending} = useHttpRequest(useAsyncData(()=>$api.company.summary()))
console.log(tableData.value)

const modalVisible = ref(false)
const modalData = ref<
    {
      company:ICompany,
      document:IDocumentShort
    }>({})
const modalDocuments = ref<IVersion[]>([])


// загрузка всех документов по компании
const openModal = async (data:{
  company:ICompany,
  document:IDocumentShort
}) => {
  modalData.value = data
  modalVisible.value = true
  console.log(data)
  const response = await $api.document.versions({
    query:{
      company:data.company.uuid,
      document_type_ids:data.document?.document_type,
      page_size:100
    }
  })
  modalDocuments.value = response.results
}

</script>

<template>
  <div class="max-w-6xl mx-auto">
    <!-- Заголовок -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Таблица документов</h1>
      <p class="text-gray-600 text-lg">Статус документов по всем компаниям</p>
    </div>
    <template v-if="tableData">
      <div class="flex gap-4 mb-4">
        <div v-for="item in tableData.legend" class="flex flex-col items-center justify-center">
          <i
              class="inline-block pi"
              :class="item.icon"
              :style="{
                  color: item.color,
                  fontSize: '13px'
                }">

          </i>
          <p>{{item.label}}</p>
        </div>
      </div>
      <Card>
        <template #content>
          <DataTable  :value="tableData.rows" responsiveLayout="scroll" >
            <Column header="Компания" style="width: 250px">
              <template #body="{ data }">
                <div class="font-bold">{{ data.company.name }}</div>
                <div class="text-sm opacity-70">{{ data.company.inn }}</div>
              </template>
            </Column>

            <!-- динамические колонки -->
            <Column
                v-for="col in tableData.columns"
                :key="col.key"
                :header="col.name"

            >
              <template #body="{ data }">

                <div v-if="data.documents[col.key]">
            <p
                v-tooltip="{
                value: `
                  Статус: ${data.documents[col.key].label}
                  Версия: ${data.documents[col.key].version ?? '—'}
                  Действует с: ${data.documents[col.key].valid_from ?? '—'}
                  До: ${data.documents[col.key].valid_until ?? '—'}
                `,
                escape: false
              }"
                class=" relative inline-block"
                :class="data.documents[col.key].label === 'Не требуется' ? 'opacity-20 pointer-events-none' : 'cursor-pointer'"
                @click="openModal(
                    {
                      company:data.documents[col.key].company,
                      document:data.documents[col.key].document
                    }
                )"
            >

              <i
                  class="pi"
                  :class="data.documents[col.key].icon"
                  :style="{
                  color: data.documents[col.key].color,
                  fontSize: '1.4rem'
                }"
              ></i>
<!--              <span class="absolute -top-3 -right-3 w-[20px] h-[20px] rounded-full flex items-center justify-center text-white"-->
<!--                    :style="{'background':data.documents[col.key].color}">2</span>-->
            </p>
                </div>
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>
    </template>
    <template v-if="pending">
      <ProgressSpinner/>
    </template>


    <!-- Модальное окно -->
    <Dialog v-model:visible="modalVisible" modal :show-header="false" :style="{ width: '450px' }">
      <p class="font-medium text-lg pt-4">{{modalData.company.company_type?.name}} {{modalData.company.name}}</p>
      <p class="text-gray-500">{{ modalData.document?.document_type_name }} • ИНН {{modalData.company.inn}}</p>
      <div class="mb-3 font-bold">

      </div>

      <div v-for="doc in modalDocuments" :key="doc.id" class="p-3 mb-2 border rounded-xl bg-gray-50">

        <div class=" opacity-80 space-y-1">
          <div class="flex items-center gap-3">
            <p class="font-medium"> Версия: {{ doc.version }} </p>
            <UIStatus :status="doc.status" />
            <p class="text-xs rounded-xl py-1 px-2 bg-gray-200" v-if="doc.is_current">Текущая</p>
          </div>
          <p class="text-xs"><a target="_blank" :href="doc.file">{{doc.file.split('/').reverse()[0]}}</a></p>
          <p class="text-xs"><i class="pi pi-calendar"></i> {{new Date(doc.upload_date).toLocaleDateString()}}</p>
          <p class="text-xs"><i class="pi pi-user"></i> {{doc.uploaded_by.email}}</p>
          <p class="text-xs"> Действует с: {{ new Date(doc.valid_from).toLocaleDateString() }} • До: {{ new Date(doc.valid_until).toLocaleDateString() }}</p>
          <p class="text-xs">Размер: {{doc.file_size}}</p>
          <p class="text-xs">Утверждено: {{doc.reviewed_by?.email}} {{ new Date(doc.review_date).toLocaleDateString() }}</p>

        </div>
      </div>

      <template #footer>
        <Button label="Закрыть" @click="modalVisible = false" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
</style>
