<template>
  <div class="flex justify-between q-py-md" data-test-id="skeleton-album-list">
    <div :class="`flex ${$q.screen.lt.sm ? 'justify-between full-width' : ''}`">
      <div class="flex">
        <q-skeleton type="QRange" :width="$q.screen.lt.md ? '50px' : '150px'" class="q-mr-md q-mb-sm" />
        <q-skeleton type="QRange" :width="$q.screen.lt.md ? '50px' : '150px'" class="q-mr-md q-mb-sm" />
      </div>
      <q-skeleton
        type="QRange"
        :width="$q.screen.lt.md ? '200px' : $q.screen.lt.sm ? '100px' : '300px'"
        class="q-mr-md q-mr-xs-none q-mb-sm"
      />
    </div>
    <q-skeleton
      type="QRange"
      :width="`${$q.screen.lt.sm ? '100%' : $q.screen.lt.md ? '200px' : '300px'}`"
      class="q-ml-auto q-ml-xs-none"
    />
  </div>
  <q-skeleton type="rect" :width="`${$q.screen.lt.sm ? '100%' : '300px'}`" class="q-mr-md q-mb-sm" />
  <div class="flex overflow-hidden no-wrap q-pt-md q-mb-xl-xl q-mb-lg-lg q-mb-md">
    <q-skeleton :size="`${$q.screen.lt.sm ? 11 : 14}rem`" class="q-mr-md" />
    <q-skeleton :size="`${$q.screen.lt.sm ? 11 : 14}rem`" />
  </div>
  <div :class="`row ${$q.screen.lt.lg ? 'justify-center' : ''}`">
    <div v-for="n in 10" :key="n" class="col-xl-6 col-lg-6 col-md-8 col-sm-10 col-xs-12 q-pa-xs">
      <q-card flat bordered>
        <q-item>
          <q-item-section avatar>
            <q-skeleton :size="`${$q.screen.lt.sm ? 80 : 100}px`" />
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
