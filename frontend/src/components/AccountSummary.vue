<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const balance = ref<string | null>(null);
const cpf = ref('');
const errorMessage = ref('');

async function loadAccount() {
    const token = sessionStorage.getItem('token');

    //se o token não existe retorna a pag de login
    if(!token){
        await router.replace('/login');
        return;
    }

    try{
        const response = await fetch(
            'http://localhost:3000/account/balance', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        // token expirado ou invalido, remove o token e redireciona
        if(response.status === 401){
            sessionStorage.removeItem('token');
            await router.replace('/login');
            return;
        }

        if(!response.ok){
            errorMessage.value = 'Erro ao consultar a conta.';
            return;
        }

        const data = await response.json();

        cpf.value = data.cpf;
        balance.value = data.balance;
    } catch{
        errorMessage.value = 'Não foi possível conectar ao servidor.';
    }
}

onMounted(loadAccount);

async function logout(){
    sessionStorage.removeItem('token');
    await router.replace('/login');
}
</script>



<template>

    <div class="account-summary">

        <h2> Resumo da Conta </h2>
        
        <p v-if="cpf"> 
            Bem-vindo(a): {{ cpf }}
        </p>

        <p v-if="balance !== null"> 
            Saldo: R$ {{ balance }}
        </p>

        <p v-if="errorMessage">
            {{ errorMessage }}
        </p>

        
        <button type="button" @click="logout"> Sair </button>

    </div>

</template>