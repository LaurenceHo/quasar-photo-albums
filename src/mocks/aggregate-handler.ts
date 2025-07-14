import { delay, http, HttpResponse } from 'msw';

export const featuredAlbums = [
  {
    albumName: '1 demo-album 1',
    year: 'na',
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
    id: 'demo-album1',
    isFeatured: true,
  },
  {
    albumName: '2024 demo album5 super long long long album name',
    year: '2024',
    albumCover: 'demo-album5/batch_2017-05-14 13.15.16.jpg',
    isPrivate: false,
    place: {
      formattedAddress: 'Tokyo, Japan',
      displayName: 'Tokyo',
      location: {
        latitude: 35.6764225,
        longitude: 139.650027,
      },
    },
    id: 'demo-album5',
    isFeatured: true,
  },
  {
    albumName: 'demo-album 2',
    year: 'na',
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
    id: 'demo-album2',
    isFeatured: true,
  },
  {
    albumName: 'this is demo-album-3',
    year: 'na',
    albumCover: 'demo-album3/batch_dog-8378909.jpg',
    isPrivate: false,
    place: {
      formattedAddress: 'George Town, Penang, Malaysia',
      displayName: 'George Town',
      location: {
        latitude: 5.414130699999999,
        longitude: 100.3287506,
      },
    },
    id: 'demo-album3',
    isFeatured: true,
  },
  {
    albumName: '1 demo-album 1',
    year: 'na',
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
    id: 'demo-album1',
    isFeatured: true,
  },
  {
    albumName: '2024 demo album5 super long long long album name',
    year: '2024',
    isPrivate: false,
    place: {
      formattedAddress: 'Tokyo, Japan',
      displayName: 'Tokyo',
      location: {
        latitude: 35.6764225,
        longitude: 139.650027,
      },
    },
    id: 'demo-album5',
    isFeatured: true,
  },
  {
    albumName: 'demo-album 2',
    year: 'na',
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
    id: 'demo-album2',
    isFeatured: true,
  },
  {
    albumName: 'this is demo-album-3',
    year: 'na',
    albumCover: 'demo-album3/batch_dog-8378909.jpg',
    isPrivate: false,
    place: {
      formattedAddress: 'George Town, Penang, Malaysia',
      displayName: 'George Town',
      location: {
        latitude: 5.414130699999999,
        longitude: 100.3287506,
      },
    },
    id: 'demo-album3',
    isFeatured: true,
  },
];

export const getFeaturedAlbums = http.get('/api/aggregate/featuredAlbums', async () => {
  await delay();

  return HttpResponse.json({
    code: 200,
    status: 'Success',
    message: 'ok',
    data: featuredAlbums,
  });
});

export const getCountAlbumsByYear = http.get('/api/aggregate/countAlbumsByYear', async () => {
  await delay();

  return HttpResponse.json({
    code: 200,
    status: 'Success',
    message: 'ok',
    data: [
      {
        count: 5,
        year: 'na',
      },
      {
        count: 1,
        year: '2024',
      },
      {
        count: 1,
        year: '2023',
      },
    ],
  });
});

export const getAlbumWithLocation = http.get('/api/aggregate/albumsWithLocation', async () => {
  await delay();

  return HttpResponse.json({
    code: 200,
    status: 'Success',
    message: 'ok',
    data: [
      {
        albumName: '2024 demo album5 super long long long album name',
        year: '2024',
        albumCover: 'demo-album5/batch_2017-05-14 13.15.16.jpg',
        isPrivate: false,
        place: {
          formattedAddress: 'Tokyo, Japan',
          displayName: 'Tokyo',
          location: {
            latitude: 35.6764225,
            longitude: 139.650027,
          },
        },
        id: 'demo-album5',
        isFeatured: true,
      },
      {
        albumName: 'This is demo album 4',
        year: 'na',
        albumCover: 'demo-album-4/2024-05-02 18.28.53.jpg',
        isPrivate: false,
        place: {
          formattedAddress: 'Valencia, Spain',
          displayName: 'Valencia',
          location: {
            latitude: 39.4699075,
            longitude: -0.37628809999999996,
          },
        },
        id: 'demo-album-4',
        isFeatured: false,
      },
      {
        albumName: '1 demo-album 1',
        year: 'na',
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
        id: 'demo-album1',
        isFeatured: true,
      },
      {
        albumName: 'demo-album 2',
        year: 'na',
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
        id: 'demo-album2',
        isFeatured: true,
      },
      {
        albumName: 'this is demo-album-3',
        year: 'na',
        albumCover: 'demo-album3/batch_elks-8430545.jpg',
        isPrivate: false,
        place: {
          formattedAddress: 'George Town, Penang, Malaysia',
          displayName: 'George Town',
          location: {
            latitude: 5.414130699999999,
            longitude: 100.3287506,
          },
        },
        id: 'demo-album3',
        isFeatured: true,
      },
      {
        albumName: 'Test Album 1',
        year: 'na',
        albumCover: 'test-album-1/example_photo1.webp',
        isPrivate: false,
        place: {
          formattedAddress: 'Sydney NSW, Australia',
          displayName: 'Sydney',
          location: {
            latitude: -33.8688,
            longitude: 151.2093,
          },
        },
        id: 'test-album-1',
        isFeatured: true,
      },
    ],
  });
});
