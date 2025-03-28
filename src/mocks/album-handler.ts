import { delay, http, HttpResponse } from 'msw';

export const mockAlbums = [
  {
    isFeatured: false,
    albumCover: 'demo-album-4/2024-05-02 18.28.53.jpg',
    isPrivate: true,
    place: {
      formattedAddress: 'Valencia, Spain',
      displayName: 'Valencia',
      location: {
        latitude: 39.4699075,
        longitude: -0.37628809999999996,
      },
    },
    year: 'na',
    albumName: 'This is demo album 4',
    description: 'This is a private album description',
    id: 'demo-album-4',
    tags: ['tag1'],
  },
  {
    isFeatured: true,
    albumCover: 'demo-album1/batch_berlin-8429780.jpg',
    isPrivate: false,
    place: {
      formattedAddress: 'Venice, Metropolitan City of Venice, Italy',
      displayName: 'Venice',
      location: {
        latitude: 45.440379,
        longitude: 12.315954699999999,
      },
    },
    year: 'na',
    albumName: '1 demo-album 1',
    description: 'This is demo album 1',
    id: 'demo-album1',
    tags: [],
  },
  {
    isFeatured: true,
    albumCover: 'demo-album2/batch_bird-8360220.jpg',
    isPrivate: false,
    place: {
      formattedAddress: 'Honolulu, HI, USA',
      displayName: 'Honolulu',
      location: {
        latitude: 21.3098845,
        longitude: -157.85814009999999,
      },
    },
    year: 'na',
    albumName: 'demo-album 2',
    description: 'This is demo album 2',
    id: 'demo-album2',
    tags: ['tag2', 'demo'],
  },
  {
    isFeatured: false,
    albumCover: 'demo-album3/batch_dog-8378909.jpg',
    isPrivate: false,
    place: {
      formattedAddress: 'George Town, Penang, Malaysia',
      displayName: 'George Town',
      location: {
        latitude: 5.4141306999999994,
        longitude: 100.3287506,
      },
    },
    year: 'na',
    albumName: 'this is demo-album-3',
    description: '',
    id: 'demo-album3',
    tags: [],
  },
  {
    isFeatured: true,
    albumCover: '',
    isPrivate: false,
    place: {
      formattedAddress: 'Sydney NSW, Australia',
      displayName: 'Sydney',
      location: {
        latitude: -33.8688,
        longitude: 151.2093,
      },
    },
    year: 'na',
    albumName: 'Test Album 1',
    description: 'This is a test album 1',
    id: 'test-album-1',
    tags: ['test-tag-1'],
  },
];
export const getAlbumsByYear = http.get('/api/albums/**', async () => {
  await delay();

  // return new HttpResponse(null, {
  //   status: 500,
  //   statusText: 'Error',
  // });

  return HttpResponse.json({
    code: 200,
    status: 'Success',
    message: 'ok',
    data: mockAlbums,
  });
});

export const deleteAlbum = http.delete('/api/albums', async () => {
  await delay();

  return HttpResponse.json({
    code: 200,
    status: 'Success',
    message: 'ok',
  });
});

export const updateAlbum = http.put('/api/albums', async () => {
  await delay();

  return HttpResponse.json({
    code: 200,
    status: 'Success',
    message: 'ok',
  });
});

export const createAlbum = http.post('/api/albums', async () => {
  await delay();

  // return new HttpResponse(null, {
  //   status: 500,
  //   statusText: 'Error',
  // });

  return HttpResponse.json({
    code: 200,
    status: 'Success',
    message: 'ok',
  });
});
