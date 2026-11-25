<script setup lang="ts">
import AccountSummary from './AccountSummary.vue';
import PixKeyForm from './PixKeyForm.vue';
import TransferPanel from './TransferPanel.vue';
import { ref } from 'vue';

const refreshKey = ref(0);
</script>

<template>
    <h1>Painel Principal</h1>

    <main>
        <AccountSummary :key="refreshKey" />
        <PixKeyForm />
        <TransferPanel @transfer-success="refreshKey++" />
    </main>
</template>