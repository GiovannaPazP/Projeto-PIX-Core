<script setup lang="ts">

import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const keyType = ref('');
const keyValue = ref('');
const message = ref('');


async function CreatePixKey(){
    message.value = '';

    const token = sessionStorage.getItem('token');
    if(!token){
        await router.replace('/login');
        return;
    }

    //constroi o corpo a depende se a chave é aleatoria ou outros tipos
    //chaves aleatorias são criadas pelo backend
    const body = keyType.value === 'ALEATORIA'
        ? { keyType: keyType.value}
        : { keyType: keyType.value, keyValue: keyValue.value};


    try{
        const response = await fetch('http://localhost:3000/pix/keys', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        // token expirado ou invalido, remove o token e redireciona
        if(response.status === 401){
            sessionStorage.removeItem('token');
            await router.replace('/login');
            return;
        }

        const data = await response.json();

        if(response.ok){
            message.value = `Chave cadastrada com sucesso: ${data.keyValue}`;
            return;
        }
        else{
            //para o caso em que retorna um array de mensagens
            message.value = Array.isArray(data.message)
                ? data.message.join(', ')
                : data.message;
            return;
        }
    } catch{
        message.value = 'Não foi possível conectar ao servidor.';
    }

}
</script>


<template>

    <form class="pix-key" @submit.prevent="CreatePixKey">

        <label for="keyType"> Tipo da Chave </label>
            <select id="keyType" v-model="keyType" required>
                <option value="" disabled>Selecione um tipo</option>
                <option value="ALEATORIA">Aleatória</option>
                <option value="CPF">CPF</option>
                <option value="EMAIL">Email</option>
            </select>

            <p>Chave Selecionada: {{ keyType }}</p>

        <div v-if="keyType && keyType !== 'ALEATORIA'">
            <label for="keyValue">Chave </label>
                <input
                    id = "keyValue"
                    type = "text"
                    v-model="keyValue"

                    required
                />
        </div>

        <p v-if="message">
            {{ message }}
        </p>

        <button type="submit">Cadastrar Chave</button>

    </form>
</template>