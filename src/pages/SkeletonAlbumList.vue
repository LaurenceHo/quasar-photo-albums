<template>
  <div class="flex justify-between q-py-md" data-test-id="skeleton-album-list">
    <div class="flex">
      <q-skeleton type="QRange" :width="$q.screen.lt.md ? '50px' : '150px'" class="q-mr-md q-mb-sm" />
      <q-skeleton type="QRange" :width="$q.screen.lt.md ? '50px' : '150px'" class="q-mr-md q-mb-sm" />
      <q-skeleton type="QRange" :width="$q.screen.lt.md ? '200px' : '300px'" class="q-mr-md q-mb-sm" />
    </div>
    <q-skeleton type="QRange" width="300px" class="q-ml-auto" />
  </div>
  <q-skeleton type="rect" width="300px" class="q-mr-md q-mb-sm" />
  <div class="justify-center row">
    <div v-for="n in 10" :key="n" class="col-xl-6 col-lg-7 col-md-8 col-sm-10 col-xs-12 q-pa-xs">
      <q-card flat bordered>
        <q-item>
          <q-item-section avatar>
            <q-skeleton size="90px" />
          </q-item-section>

          <q-item-section>
            <q-item-label>
              <q-skeleton type="text" />
            </q-item-label>
            <q-item-label caption>
              <q-skeleton type="text" width="80%" />
            </q-item-label>
            <div class="flex">
              <q-skeleton type="QBadge" />
            </div>
          </q-item-section>
        </q-item>
      </q-card>
    </div>
  </div>
</template>
<script setup lang="ts"></script>
