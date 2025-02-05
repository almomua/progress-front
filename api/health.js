import cors from 'cors';

const corsMiddleware = cors({
  origin: '*',
  credentials: true,
});

export default async function handler(req, res) {
  // Handle CORS
  await new Promise((resolve, reject) => {
    corsMiddleware(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });

  res.json({ 
    status: 'ok', 
    environment: process.env.NODE_ENV,
    time: new Date().toISOString()
  });
}
