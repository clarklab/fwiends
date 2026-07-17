/* Poll endpoint for ask-background jobs: returns the blob for a job id,
   or { status: "pending" } while the background function is still working. */
import { getStore } from '@netlify/blobs';

export default async req => {
  const id = new URL(req.url).searchParams.get('id') ?? '';
  if (!/^[a-z0-9-]{8,64}$/i.test(id)) {
    return Response.json({ status: 'error', message: 'bad id' }, { status: 400 });
  }
  const store = getStore('pod-answers');
  const data = await store.get(id, { type: 'json' });
  return Response.json(data ?? { status: 'pending' }, {
    headers: { 'cache-control': 'no-store' },
  });
};
