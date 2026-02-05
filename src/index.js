import express from 'express';
import { matchRouter } from './routes/match.route.js';
const app = express();
const PORT = process.env.PORT;

// JSON middleware
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

app.use('/matches', matchRouter);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
