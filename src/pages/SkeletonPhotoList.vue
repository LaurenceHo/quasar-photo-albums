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
        <q-skeleton type="text" />
      </q-item-label>
      <q-item-label caption>
        <q-skeleton type="text" width="80%" />
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
  <q-skeleton size="250px" />
</template>
