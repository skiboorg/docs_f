<script setup lang="ts">
import type {ILoginPayload} from "~/repository/auth/types";
import { useToast } from 'primevue/usetoast';

definePageMeta({
  guest: true,
})
const toast = useToast()
const { $api } = useNuxtApp();
const authCookie = useCookie('auth_token')

const form_data  = reactive<ILoginPayload>({
  login: '',
  password: ''
})

const { pending, send, form } = useForm({
  apiFn: $api.auth.login,
  formData: form_data,
  asFormData: false,
  onSuccess: async (res)=>{
    console.log(res);
    authCookie.value = res.auth_token
    document.location = '/'
  }
})

const can_send = computed(()=>{
  return !!form.login && !!form.password
})


</script>
<template>
<div class="w-full h-svh flex flex-col items-center justify-center">

  <Card class="w-2/6">
    <template #title>
      <div class="flex justify-center">
      </div>
    </template>
    <template #content>
      <FloatLabel variant="on" class="mb-3">
        <InputText id="login" fluid v-model="form.login"/>
        <label for="login">Логин</label>
      </FloatLabel>
      <FloatLabel variant="on">
        <InputText id="password" type="password" fluid v-model="form.password"/>
        <label for="password">Пароль</label>
      </FloatLabel>
    </template>
    <template #footer>
      <div class="flex justify-center">
        <Button :disabled="!can_send" :loading="pending" label="Войти" @click="send"/>
      </div>
    </template>

  </Card>
</div>
</template>