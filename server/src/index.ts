import express from 'express';
import v1Router from './integration-router.ts';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use('/api/v1', v1Router);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 