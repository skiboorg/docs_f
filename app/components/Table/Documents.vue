<script setup lang="ts">
import { ref, watch, computed } from "vue";
import type { ICompany } from "~/repository/company/types";
import type { IDocumentShort, IVersion } from "~/repository/document/types";

const { $api } = useNuxtApp();
const toast = useToast()

const search = ref("");
const selectedStatuses = ref<string[]>([]);

const statusOptions = computed(() => {
  if (!tableData.value?.results.legend) return [];
  return Object.entries(tableData.value.results.legend).map(([key, value]: any) => ({
    label: value.label,
    value: key,
    icon: value.icon,
    color: value.color
  }));
});

const fileupload = ref();
const page = ref(1);
const pageSize = ref(20);
const pageSizeOptions = [20, 50, 100, 200];


const newVersion = ref({
  uuid:null,
  file:null,
  comment:null,
  valid_from:null,
  valid_until:null,

})


const {data:tableData,refresh, pending} = useHttpRequest(useAsyncData(()=>$api.company.summary({
      query: {
        page: page.value,
        page_size: pageSize.value,
        search: search.value || undefined,
        status: selectedStatuses.value.join(",") || undefined,
      }
    })
))

/* -------------------------------
    Обновление при поиске / фильтрах
--------------------------------*/
watch([search, selectedStatuses], () => {
  page.value = 1;
  refresh();
});

/* -------------------------------
    Модальное окно
--------------------------------*/
const modalVisible = ref(false);
const modalData = ref<{ company: ICompany; document: IDocumentShort } | any>({});
const modalDocuments = ref<IVersion[]>([]);

const openModal = async (data: { company: ICompany; document: IDocumentShort }) => {
  modalData.value = data;
  modalVisible.value = true;
  const response = await $api.document.versions({
    query: {
      company: data.company.uuid,
      document_type_ids: data.document?.document_type,
      page_size: 100,
    }
  });

  modalDocuments.value = response.results;
};

const pageChange = async (e) => {
  page.value = e.page + 1
  pageSize.value = e.rows
  await refresh()
}
const {pending:loading, send } = useForm({
  apiFn: $api.document.upload_version,
  formData: newVersion.value,
  asFormData: true,
  onSuccess: async (res)=>{
    toast.add({
      severity: 'success',
      summary: 'Успешно',
      detail: 'Версия загружена',
      life: 3000
    })
  }
})

const onUploadHandler = async (evt)=>{
  console.log(evt);
  newVersion.value.file = evt.files[0];
}

const submit = async () => {
  newVersion.value.uuid = modalData.value.document.uuid;
  await send()
}
</script>

<template>
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Таблица документов</h1>
      <p class="text-gray-600 text-lg">Статус документов по всем компаниям</p>
    </div>
      <div class="p-input-icon-left w-full mb-4">

                <InputText
                    fluid
                    v-model="search"
                    class="w-full"
                    placeholder="Поиск по ИНН или наименованию"
                />
            </div>
    <Card>

      <template #content>
        <!-- Легенда статусов -->
        <div v-if="tableData" class="flex gap-4 mb-4 flex-wrap">
          <div v-for="item in tableData.results.legend" class="flex flex-col items-center">
            <i class="pi" :class="item.icon"
               :style="{ color: item.color, fontSize: '14px' }"></i>
            <p class="text-xs">{{ item.label }}</p>
          </div>
        </div>
        <DataTable :value="tableData?.results.rows" :loading="pending" responsiveLayout="scroll">

          <Column header="Компания" style="width: 250px">
            <template #body="{ data }">
              <div class="font-bold">{{ data.company.name }}</div>
              <div class="text-sm opacity-70">{{ data.company.inn }}</div>
            </template>
          </Column>

          <!-- Динамические колонки -->
          <Column v-for="col in tableData?.results.columns" :key="col.key" :header="col.name">
            <template #body="{ data }">
              <div v-if="data.documents[col.key]">
                <i
                    class="pi cursor-pointer"
                    :class="data.documents[col.key].icon"
                    :style="{ color: data.documents[col.key].color, fontSize: '1.4rem' }"
                    @click="openModal({
                                        company: data.documents[col.key].company,
                                        document: data.documents[col.key].document
                                    })"
                ></i>
              </div>
            </template>
          </Column>

        </DataTable>
        <Paginator :rows="pageSize" @page="pageChange" :totalRecords="tableData?.count" :rowsPerPageOptions="pageSizeOptions"/>

      </template>
    </Card>

    <Dialog v-model:visible="modalVisible" modal :show-header="false" :style="{ width: '750px' }">
      <p class="font-medium text-lg pt-4">
        {{ modalData.company?.company_type?.name }} {{ modalData.company?.name }}
      </p>
      <p class="text-gray-500 mb-4">
        {{ modalData.document?.document_type_name }} • ИНН {{ modalData.company?.inn }}
      </p>
      <Tabs value="0">
        <TabList>
          <Tab value="0">История версий</Tab>
          <Tab value="1">Загрузить новую</Tab>
        </TabList>
        <TabPanels>
          <TabPanel value="0">
            <div v-for="doc in modalDocuments" :key="doc.id"
                 class="p-3 mt-3 border rounded-xl bg-gray-50">
              <div class="space-y-1">
                <div class="flex items-center gap-3">
                  <p class="font-medium">Версия: {{ doc.version }}</p>
                  <UIStatus :status="doc.status" />
                  <p v-if="doc.is_current" class="text-xs bg-gray-200 px-2 py-1 rounded-xl">Текущая</p>
                </div>

                <p class="text-xs">
                  <a :href="doc.file" target="_blank">{{ doc.file.split('/').pop() }}</a>
                </p>

                <p class="text-xs">
                  <i class="pi pi-calendar"></i>
                  {{ new Date(doc.upload_date).toLocaleDateString() }}
                </p>

                <p class="text-xs">
                  <i class="pi pi-user"></i>
                  {{ doc.uploaded_by.email }}
                </p>

                <p class="text-xs">
                  Действует с:
                  {{ new Date(doc.valid_from).toLocaleDateString() }}
                  • до:
                  {{ new Date(doc.valid_until).toLocaleDateString() }}
                </p>

                <p class="text-xs">Размер: {{ doc.file_size }}</p>
              </div>
            </div>
          </TabPanel>
          <TabPanel value="1">
            <template v-if="modalData.document">
              <p class="font-medium -lg mb-2">Выберите файл *</p>
              <FileUpload ref="fileupload" mode="basic"
                          name="demo[]" url="/api/upload"
                          accept="image/*"
                          :maxFileSize="1000000"
                          @select="onUploadHandler"
                          class="mb-3"
                          chooseLabel="Выбрать" />
              <p class="font-medium  mb-2">Комментарий (необязательно)</p>

              <Textarea fluid class="mb-3" v-model="newVersion.comment" placeholder="Примечание к версии"/>
              <p class="font-medium  mb-1">Срок действия документа</p>
              <p class="text-gray-400 mb-2"> Укажите период, в течение которого документ действителен (необязательно)</p>
              <div class="flex gap-3 mb-3">
                <DatePicker v-model="newVersion.valid_from"/>
                <DatePicker v-model="newVersion.valid_until"/>
              </div>
              <Button :loading="loading" :disabled="!newVersion.file" fluid label="Загрузить" @click="submit"/>
            </template>
            <template v-else>
              <p class="text-center text-red-500 font-medium">У документа нет типа, загрузка невозможна</p>
            </template>

          </TabPanel>
        </TabPanels>
      </Tabs>


      <template #footer>
        <Button label="Закрыть" @click="modalVisible = false" />
      </template>

    </Dialog>

</template>
