import express from 'express';

const app = express();
const PORT = process.env.PORT || 3001;

app.get('/health', (req: express.Request, res: express.Response) => {
  res.send('ok');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 