<template>
  <q-item class="q-pt-lg" data-test-id="skeleton-page-list">
    <q-item-section avatar>
      <q-skeleton type="circle" />
    </q-item-section>
    <q-item-section avatar>
      <q-skeleton type="QBtn" />
    </q-item-section>
    <q-item-section>
      <q-item-label>
        <q-skeleton type="rect" />
      </q-item-label>
    </q-item-section>
  </q-item>
  <q-item>
    <q-item-section>
      <q-item-label>
        <q-skeleton type="text" width="80%" />
      </q-item-label>

      <q-skeleton type="QChip" class="q-mt-md" />
    </q-item-section>
  </q-item>
  <div class="row q-col-gutter-md">
    <div v-for="n in 6" :key="n" class="col-xl-2 col-lg-2 col-md-3 col-sm-3 col-xs-6">
      <q-skeleton :size="$q.screen.lt.md ? '150px' : '220px'" class="q-mr-md" />
    </div>
  </div>
</template>
<script setup lang="ts"></script>
