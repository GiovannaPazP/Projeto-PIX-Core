<script setup lang="ts">

import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const pixKeyReceiver = ref('');
const amount = ref('');
const message = ref('');

//verifica se já não está acontecendo uma transferencia
const pendingTransferKey = ref<string | null>(null);
const isSubmitting = ref(false);

//emite sinal de evento para o componente pai (para atualizar o saldo)
const emit = defineEmits(['transfer-success']);

async function PixTransfer(){
    //se uma tranferencia já esta sendo realizada retorna
    if(isSubmitting.value){
        return;
    }

    message.value = '';

    const token = sessionStorage.getItem('token');
    if(!token){
        await router.replace('/login');
        return;
    }

    //iniciando uma tranferencia
    isSubmitting.value = true;

    //se não há uma transação pendente, gera uma nova chave
    const idempotencyKey = pendingTransferKey.value ?? crypto.randomUUID();
    pendingTransferKey.value = idempotencyKey;

    try{
        const response = await fetch('http://localhost:3000/pix/transfer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'idempotency-key': idempotencyKey
            },
            body: JSON.stringify({
                pixKeyReceiver: pixKeyReceiver.value,
                amount: amount.value
            })
        });

        // token expirado ou invalido, remove o token e redireciona
        if(response.status === 401){
            sessionStorage.removeItem('token');
            await router.replace('/login');
            return;
        }

        const data = await response.json();

        if(response.ok){
            message.value = `Transferência de: ${data.amount} realizada com sucesso para ${pixKeyReceiver.value}.`;
            pendingTransferKey.value = null;
            await loadTransfers(); //atualiza historico de transferencias
            emit('transfer-success');
            return;
        }
        else{
            //para o caso em que retorna um array de mensagens
            message.value = Array.isArray(data.message)
                ? data.message.join(', ')
                : data.message;

            //erros do tipo valor inválido, chave inexistente e saldo insuficiente
            if(response.status >=400 && response.status<500){
                pendingTransferKey.value = null;
            }
            return;
        }
    } catch{
        message.value = 'Não foi possível confirmar a transferência. Tente novamente sem alterar os dados.';
    } finally{
        //transferencia encerrada
        isSubmitting.value = false;
    }

}

// historico de transferencias
//interface apra o array de transferências
interface Transfer{
    id: number;
    senderId: number;
    receiverId: number;
    amount: string;
    createdAt: string;
    direction: 'sent' | 'received';
}

const transfers = ref<Transfer[]>([]);
const historyMessage = ref('')

async function loadTransfers(){
    historyMessage.value = '';
    const token = sessionStorage.getItem('token');

    //se o token não existe retorna a pag de login
    if(!token){
        await router.replace('/login');
        return;
    }

    try{
        const response = await fetch(
            'http://localhost:3000/pix/transfers', {
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

        if (!response.ok) {
            historyMessage.value = 'Erro ao consultar o histórico.';
            return;
        }

        const data = await response.json();

        transfers.value = data;
    } catch{
        historyMessage.value = 'Não foi possível conectar ao servidor.';
    }
}

onMounted(loadTransfers);

</script>




<template>
    <br></br>
    <br></br>

    <form class="pix-transfer" @submit.prevent="PixTransfer">

        <h2>Fazer Pix</h2>

        <label for="pixKeyReceiver">Destinatário </label>
        <input
            placeholder="Chave Pix"
            :disabled="isSubmitting || pendingTransferKey!==null"
            id = "pixKeyReceiver"
            type = "text"
            v-model="pixKeyReceiver"

            required
        />

        <br></br>
        <label for="amount">Valor </label>
        <input
            placeholder="Valor (ex: 159.50)"
            :disabled="isSubmitting || pendingTransferKey!==null"
            id = "amount"
            type = "text"
            v-model="amount"

            required
        />

        <br></br>
        <p v-if="message">
            {{ message }}
        </p>

        <button type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Enviando...' : pendingTransferKey ? 'Tentar novamente' : 'Enviar Pix'}}
        </button>

    </form>

    <br></br>
    <div class="transfers">

        <br></br>

        <h2> Histórico de Transferências </h2>
        
        <ul> Tipo --------- Valor ----------------------&nbsp;&nbsp; Data
            <li v-for="transfer in transfers" :key="transfer.id"> 
                {{ transfer.direction === 'sent' ? 'Enviada' : 'Recebida'}} --- R$ {{ transfer.amount }} --- {{ transfer.createdAt }}
            </li>
        </ul>


        <p v-if="historyMessage">
            {{ historyMessage }}
        </p>

    </div>

</template>
