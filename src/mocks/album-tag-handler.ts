import { delay, http, HttpResponse } from 'msw';

export const getAlbumTags = http.get('/api/albumTags', async () => {
  await delay();

  return HttpResponse.json({
    code: 200,
    status: 'Success',
    message: 'ok',
    data: [
      {
        tag: 'tag3',
      },
      {
        tag: 'test-tag-1',
      },
      {
        tag: 'tag1',
      },
      {
        tag: 'demo',
      },
      {
        tag: 'tag2',
      },
    ],
  });
});

export const deleteAlbumTag = http.delete('/api/albumTags/**', async () => {
  await delay();

  return HttpResponse.json({
    code: 200,
    status: 'Success',
    message: 'ok',
  });

  // return new HttpResponse(null, {
  //   status: 500,
  //   statusText: 'Error',
  // });
});
