import { delay, http, HttpResponse } from 'msw';

export const mockTravelRecords = [
  // Route 1: Taipei to Tokyo
  {
    travelDate: '2025-04-03T02:39:56.439Z',
    departure: {
      formattedAddress: 'Taipei, Taiwan',
      displayName: 'Taipei',
      location: {
        latitude: 25.033,
        longitude: 121.5654,
      },
    },
    destination: {
      formattedAddress: 'Tokyo, Japan',
      displayName: 'Tokyo',
      location: {
        latitude: 35.6895,
        longitude: 139.6917,
      },
    },
    id: 'Taipei#Tokyo',
  },
  // Route 2: Tokyo to LA
  {
    travelDate: '2025-04-03T05:39:56.439Z',
    departure: {
      formattedAddress: 'Tokyo, Japan',
      displayName: 'Tokyo',
      location: {
        latitude: 35.6895,
        longitude: 139.6917,
      },
    },
    destination: {
      formattedAddress: 'LA, USA',
      displayName: 'LA',
      location: {
        latitude: 34.0522,
        longitude: -118.2437,
      },
    },
    id: 'Tokyo#LA',
  },
  // Route 3: Auckland to Hawaii
  {
    travelDate: '2025-04-04T02:39:56.439Z',
    departure: {
      formattedAddress: 'Auckland, New Zealand',
      displayName: 'Auckland',
      location: {
        latitude: -36.8484,
        longitude: 174.7633,
      },
    },
    destination: {
      formattedAddress: 'Hawaii, USA',
      displayName: 'Hawaii',
      location: {
        latitude: 21.3069,
        longitude: -157.8583,
      },
    },
    id: 'Auckland#Hawaii',
  },
  // Route 4: Taipei to Chiang Mai
  {
    travelDate: '2025-04-05T02:39:56.439Z',
    departure: {
      formattedAddress: 'Taipei, Taiwan',
      displayName: 'Taipei',
      location: {
        latitude: 25.033,
        longitude: 121.5654,
      },
    },
    destination: {
      formattedAddress: 'Chiang Mai, Thailand',
      displayName: 'Chiang Mai',
      location: {
        latitude: 18.7877,
        longitude: 98.9925,
      },
    },
    id: 'Taipei#ChiangMai',
    transportType: 'flight',
  },
  // Route 5: Taipei to Doha
  {
    travelDate: '2025-04-06T02:39:56.439Z',
    departure: {
      formattedAddress: 'Taipei, Taiwan',
      displayName: 'Taipei',
      location: {
        latitude: 25.033,
        longitude: 121.5654,
      },
    },
    destination: {
      formattedAddress: 'Doha, Qatar',
      displayName: 'Doha',
      location: {
        latitude: 25.276,
        longitude: 51.531,
      },
    },
    id: 'Taipei#Doha',
    transportType: 'flight',
  },
  // Route 6: Auckland to Sydney
  {
    travelDate: '2025-04-07T02:39:56.439Z',
    departure: {
      formattedAddress: 'Auckland, New Zealand',
      displayName: 'Auckland',
      location: {
        latitude: -36.8484,
        longitude: 174.7633,
      },
    },
    destination: {
      formattedAddress: 'Sydney, Australia',
      displayName: 'Sydney',
      location: {
        latitude: -33.8651,
        longitude: 151.2093,
      },
    },
    id: 'Auckland#Sydney',
    transportType: 'flight',
  },
  // Route 7: Auckland to Melbourne
  {
    travelDate: '2025-04-08T02:39:56.439Z',
    departure: {
      formattedAddress: 'Auckland, New Zealand',
      displayName: 'Auckland',
      location: {
        latitude: -36.8484,
        longitude: 174.7633,
      },
    },
    destination: {
      formattedAddress: 'Melbourne, Australia',
      displayName: 'Melbourne',
      location: {
        latitude: -37.8136,
        longitude: 144.9631,
      },
    },
    id: 'Auckland#Melbourne',
    transportType: 'flight',
  },
  // Route 8: Doha to Milan
  {
    travelDate: '2025-04-09T02:39:56.439Z',
    departure: {
      formattedAddress: 'Doha, Qatar',
      displayName: 'Doha',
      location: {
        latitude: 25.276,
        longitude: 51.531,
      },
    },
    destination: {
      formattedAddress: 'Milan, Italy',
      displayName: 'Milan',
      location: {
        latitude: 45.4642,
        longitude: 9.1899,
      },
    },
    id: 'Doha#Milan',
    transportType: 'flight',
  },
  // Route 9: LA to Atlanta
  {
    travelDate: '2025-04-10T02:39:56.439Z',
    departure: {
      formattedAddress: 'LA, USA',
      displayName: 'LA',
      location: {
        latitude: 34.0522,
        longitude: -118.2437,
      },
    },
    destination: {
      formattedAddress: 'Atlanta, USA',
      displayName: 'Atlanta',
      location: {
        latitude: 33.749,
        longitude: -84.388,
      },
    },
    id: 'LA#Atlanta',
    transportType: 'flight',
  },
  // Route 10: Atlanta to Lima
  {
    travelDate: '2025-04-11T02:39:56.439Z',
    departure: {
      formattedAddress: 'Atlanta, USA',
      displayName: 'Atlanta',
      location: {
        latitude: 33.749,
        longitude: -84.388,
      },
    },
    destination: {
      formattedAddress: 'Lima, Peru',
      displayName: 'Lima',
      location: {
        latitude: -12.0464,
        longitude: -77.0428,
      },
    },
    id: 'Atlanta#Lima',
    transportType: 'flight',
  },
  {
    travelDate: '2025-04-12T02:39:56.439Z',
    departure: {
      formattedAddress: 'Milan, Italy',
      displayName: 'Milan',
      location: {
        latitude: 45.4642,
        longitude: 9.1899,
      },
    },
    destination: {
      formattedAddress: 'Vienna, Austria',
      displayName: 'Vienna',
      location: {
        latitude: 48.2081743,
        longitude: 16.3738189,
      },
    },
    id: 'Milan#Vienna',
    transportType: 'train',
  },
];

export const getTravelRecords = http.get('/api/travelRecords', async () => {
  await delay();

  // return new HttpResponse(null, {
  //   status: 500,
  //   statusText: 'Error',
  // });

  return HttpResponse.json({
    code: 200,
    status: 'Success',
    message: 'ok',
    data: mockTravelRecords,
  });
});

export const deleteTravelRecord = http.delete('/api/travelRecords/**', async () => {
  await delay();

  return HttpResponse.json({
    code: 200,
    status: 'Success',
    message: 'ok',
  });
});

export const updateTravelRecords = http.put('/api/travelRecords', async () => {
  await delay();

  return HttpResponse.json({
    code: 200,
    status: 'Success',
    message: 'ok',
  });
});

export const createTravelRecords = http.post('/api/travelRecords', async () => {
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
