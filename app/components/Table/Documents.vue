<script setup lang="ts">
import { ref, watch, computed } from "vue";
import type { ICompany } from "~/repository/company/types";
import type { IDocumentShort, IVersion } from "~/repository/document/types";

const { $api } = useNuxtApp();

/* -------------------------------
    ФИЛЬТРЫ
--------------------------------*/
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

/* -------------------------------
    ПАГИНАЦИЯ
--------------------------------*/
const page = ref(1);
const pageSize = ref(20);
const pageSizeOptions = [20, 50, 100, 200];




const {data:tableData,refresh, pending} = useHttpRequest(useAsyncData(()=>$api.company.summary({
      query: {
        page: page.value,
        page_size: pageSize.value,
        search: search.value || undefined,
        status: selectedStatuses.value.join(",") || undefined,
      }
    })
))
const total = computed(() => tableData.value?.count ?? 0);

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
</script>

<template>
  <div class="max-w-6xl mx-auto">
    <!-- Заголовок -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Таблица документов</h1>
      <p class="text-gray-600 text-lg">Статус документов по всем компаниям</p>
    </div>


      <!-- Поиск -->
      <div class="p-input-icon-left w-full mb-4">

                <InputText
                    fluid
                    v-model="search"
                    class="w-full"
                    placeholder="Поиск по ИНН или наименованию"
                />
            </div>

<!--      &lt;!&ndash; Фильтр по статусу &ndash;&gt;-->
<!--      <MultiSelect-->
<!--          v-model="selectedStatuses"-->
<!--          :options="statusOptions"-->
<!--          optionLabel="label"-->
<!--          optionValue="value"-->
<!--          placeholder="Статусы"-->
<!--          display="chip"-->
<!--          class="w-full"-->
<!--      >-->
<!--        <template #option="slot">-->
<!--          <div class="flex items-center gap-2">-->
<!--            <i :class="['pi', slot.option.icon]" :style="{ color: slot.option.color }"></i>-->
<!--            {{ slot.option.label }}-->
<!--          </div>-->
<!--        </template>-->
<!--      </MultiSelect>-->





    <!-- Таблица -->
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


    <!-- Модальное окно -->
    <Dialog v-model:visible="modalVisible" modal :show-header="false" :style="{ width: '450px' }">
      <p class="font-medium text-lg pt-4">
        {{ modalData.company?.company_type?.name }} {{ modalData.company?.name }}
      </p>
      <p class="text-gray-500">
        {{ modalData.document?.document_type_name }} • ИНН {{ modalData.company?.inn }}
      </p>

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

      <template #footer>
        <Button label="Закрыть" @click="modalVisible = false" />
      </template>
    </Dialog>
  </div>
</template>
