<template>
  <div id="album-location-map"></div>
</template>

<script lang="ts" setup>
import { Album as AlbumItem } from 'components/models';
import mapboxgl from 'mapbox-gl';
import { albumStore } from 'stores/album-store';
import { computed, onMounted } from 'vue';

const cdnURL = process.env.IMAGEKIT_CDN_URL as string;
const store = albumStore();
const albumsHaveLocation = computed(() => store.albumsHaveLocation);
const geoJson = computed(() => ({
  type: 'FeatureCollection',
  features: albumsHaveLocation.value.map((album: AlbumItem) => {
    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [album.place?.location.longitude, album.place?.location.latitude],
      },
      properties: {
        name: album.albumName,
        description:
          `<strong>${album.albumName}</strong><br/>` +
          `${album.place?.displayName ? `<div>${album.place?.displayName}</div>` : ''}` +
          `${
            album.albumCover
              ? `<img src='${cdnURL}/${encodeURI(album.albumCover + '?tr=w-280' ?? '')}' alt='${album.albumName}' />`
              : ''
          }` +
          `${album.description ? `<p>${album.description}</p>` : ''}` +
          `<a href='/album/${album.year}/${album.id}'>View Album</a>`,
      },
    };
  }),
}));

onMounted(() => {
  mapboxgl.accessToken = process.env.MAPBOX_API_KEY as string;
  const map = new mapboxgl.Map({
    container: 'album-location-map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [174.763336, -36.848461],
    zoom: 1,
  });

  map.on('idle', () => {
    map.resize();
  });

  map.on('load', () => {
    map.addSource('albums', {
      type: 'geojson',
      data: geoJson.value,
    } as any);

    // Add a layer showing the places.
    map.addLayer({
      id: 'albums',
      type: 'circle',
      source: 'albums',
      paint: {
        'circle-color': '#ef6692',
        'circle-radius': 6,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
      },
    });

    // Create a popup, but don't add it to the map yet.
    const popup = new mapboxgl.Popup();

    // When mouse moves over a point on the map, open a popup at the
    // location of the feature, with description HTML from its properties.
    map.on('mouseenter', 'albums', (event: any) => {
      // Change the cursor style as a UI indicator.
      map.getCanvas().style.cursor = 'pointer';

      const coordinates = event.features[0].geometry.coordinates.slice();
      const description = event.features[0].properties.description;
      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(event.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += event.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      // Populate the popup and set its coordinates
      // based on the feature found.
      popup.setLngLat(coordinates).setHTML(description).addTo(map);
    });

    map.on('mouseleave', 'albums', () => {
      map.getCanvas().style.cursor = '';
    });
  });
});
</script>

<style lang="scss">
#album-location-map {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
}

.mapboxgl-popup {
  max-width: 300px !important;
}

.mapboxgl-popup-content {
  text-align: center;
  padding: 10px;

  img {
    padding-top: 10px;
    width: 280px;
  }
}

.mapboxgl-marker {
  cursor: pointer;
}
</style>
