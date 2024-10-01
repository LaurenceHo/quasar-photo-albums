import { delay, http, HttpResponse } from 'msw';

const imageCDNUrl = import.meta.env.VITE_IMAGEKIT_CDN_URL;

export const getPhotos = http.get('/api/photos/**', async () => {
  await delay();

  return HttpResponse.json({
    code: 200,
    status: 'Success',
    message: 'ok',
    data: {
      album: {
        albumCover: 'demo-album3/batch_elks-8430545.jpg',
        isPrivate: false,
        createdAt: '2024-05-08T08:32:04.364Z',
        updatedBy: 'bluegray1015@gmail.com',
        createdBy: 'System',
        isFeatured: true,
        updatedAt: '2024-07-20T21:47:57.009Z',
        place: {
          formattedAddress: 'George Town, Penang, Malaysia',
          displayName: 'George Town',
          location: {
            latitude: 5.414130699999999,
            longitude: 100.3287506
          }
        },
        year: 'na',
        albumName: 'this is demo-album-3',
        description: 'Some description',
        id: 'demo-album3',
        tags: ['tag1', 'tag2']
      },
      photos: [
        {
          url: `${imageCDNUrl}/demo-album3/batch_berlin-8429780.jpg`,
          key: 'demo-album3/batch_berlin-8429780.jpg',
          size: 180940,
          lastModified: '2024-07-24T21:49:44.000Z'
        },
        {
          url: `${imageCDNUrl}/demo-album3/batch_bird-8360220.jpg`,
          key: 'demo-album3/batch_bird-8360220.jpg',
          size: 97523,
          lastModified: '2024-07-24T21:49:44.000Z'
        },
        {
          url: `${imageCDNUrl}/demo-album3/batch_castle-8033915.jpg`,
          key: 'demo-album3/batch_castle-8033915.jpg',
          size: 75139,
          lastModified: '2024-07-24T21:49:44.000Z'
        },
        {
          url: `${imageCDNUrl}/demo-album3/batch_cat-8282097.jpg`,
          key: 'demo-album3/batch_cat-8282097.jpg',
          size: 120824,
          lastModified: '2024-07-24T21:49:44.000Z'
        },
        {
          url: `${imageCDNUrl}/demo-album3/batch_dog-8378909.jpg`,
          key: 'demo-album3/batch_dog-8378909.jpg',
          size: 188466,
          lastModified: '2024-07-24T21:49:44.000Z'
        },
        {
          url: `${imageCDNUrl}/demo-album3/batch_elks-8430545.jpg`,
          key: 'demo-album3/batch_elks-8430545.jpg',
          size: 133452,
          lastModified: '2024-07-24T21:49:44.000Z'
        },
        {
          url: `${imageCDNUrl}/demo-album3/batch_field-8419729.jpg`,
          key: 'demo-album3/batch_field-8419729.jpg',
          size: 143020,
          lastModified: '2024-07-24T21:49:44.000Z'
        },
        {
          url: `${imageCDNUrl}/demo-album3/batch_flamingo-8353373.jpg`,
          key: 'demo-album3/batch_flamingo-8353373.jpg',
          size: 82580,
          lastModified: '2024-07-24T21:49:44.000Z'
        },
        {
          url: `${imageCDNUrl}/demo-album3/batch_giraffe-8435321.jpg`,
          key: 'demo-album3/batch_giraffe-8435321.jpg',
          size: 155955,
          lastModified: '2024-07-24T21:49:44.000Z'
        },
        {
          url: `${imageCDNUrl}/demo-album3/batch_moutains-8445767.jpg`,
          key: 'demo-album3/batch_moutains-8445767.jpg',
          size: 89840,
          lastModified: '2024-07-24T21:49:44.000Z'
        },
        {
          url: `${imageCDNUrl}/demo-album3/batch_pine-hills-8419433.jpg`,
          key: 'demo-album3/batch_pine-hills-8419433.jpg',
          size: 114174,
          lastModified: '2024-07-24T21:49:44.000Z'
        },
        {
          url: `${imageCDNUrl}/demo-album3/batch_port-8431044.jpg`,
          key: 'demo-album3/batch_port-8431044.jpg',
          size: 128145,
          lastModified: '2024-07-24T21:49:44.000Z'
        },
        {
          url: `${imageCDNUrl}/demo-album3/batch_roofs-8449752.jpg`,
          key: 'demo-album3/batch_roofs-8449752.jpg',
          size: 125865,
          lastModified: '2024-07-24T21:49:44.000Z'
        },
        {
          url: `${imageCDNUrl}/demo-album3/batch_sailboats-8337698.jpg`,
          key: 'demo-album3/batch_sailboats-8337698.jpg',
          size: 81574,
          lastModified: '2024-07-24T21:49:44.000Z'
        },
        {
          url: `${imageCDNUrl}/demo-album3/batch_sandpiper-8429874.jpg`,
          key: 'demo-album3/batch_sandpiper-8429874.jpg',
          size: 101573,
          lastModified: '2024-07-24T21:49:44.000Z'
        },
        {
          url: `${imageCDNUrl}/demo-album3/batch_winter-8433264.jpg`,
          key: 'demo-album3/batch_winter-8433264.jpg',
          size: 127010,
          lastModified: '2024-07-24T21:49:44.000Z'
        },
        {
          url: `${imageCDNUrl}/demo-album3/bridge-8420945_1280.jpg`,
          key: 'demo-album3/bridge-8420945_1280.jpg',
          size: 272207,
          lastModified: '2024-07-24T21:49:44.000Z'
        },
        {
          url: `${imageCDNUrl}/demo-album3/cat-8438334_1280.jpg`,
          key: 'demo-album3/cat-8438334_1280.jpg',
          size: 222425,
          lastModified: '2024-07-24T21:49:44.000Z'
        },
        {
          url: `${imageCDNUrl}/demo-album3/eagle-8262555_1280.jpg`,
          key: 'demo-album3/eagle-8262555_1280.jpg',
          size: 140045,
          lastModified: '2024-07-24T21:49:44.000Z'
        },
        {
          url: `${imageCDNUrl}/demo-album3/sheep-7943526_1280.jpg`,
          key: 'demo-album3/sheep-7943526_1280.jpg',
          size: 211220,
          lastModified: '2024-07-24T21:49:44.000Z'
        }
      ]
    }
  });
});

export const deletePhotos = http.delete('/api/photos', async () => {
  await delay();

  return HttpResponse.json({
    code: 200,
    status: 'Success',
    message: 'ok'
  });

  // return new HttpResponse(null, {
  //   status: 500,
  //   statusText: 'Error',
  // });
});
