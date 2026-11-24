<script setup lang="ts">
import { ref } from 'vue'
import router from '../router';


const cpf = ref('')
const pass = ref('')
const errorMessage = ref('')

async function Login(){
    errorMessage.value = '';

    const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            cpf: cpf.value,
            pass: pass.value
        })
    });

    const data = await response.json();

    if(response.ok){
        console.log('Login realizado com sucesso');
        sessionStorage.setItem('token', data.access_token);
        router.push('/dashboard');
    }
    else{
        errorMessage.value = data.message;
        console.log('O servidor retornou um erro.');
    }

    console.log(response.status)
    console.log(response.ok)
}
</script>


<template>

    <form class="login-form" @submit.prevent="Login">

        <label for="cpf">CPF </label>
        <input
            id = "cpf"
            type = "text"
            v-model="cpf"

            maxlength="11"
            pattern="[0-9]{11}"
            required
        />

        <label for="pass">Senha </label>
        <input
            id = "pass"
            type = "password"
            v-model="pass"

            required
        />

        <p v-if="errorMessage">
            {{ errorMessage }}
        </p>

        <button type="submit">Fazer Login</button>

    </form>

</template>