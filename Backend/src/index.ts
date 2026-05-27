import express from 'express';
import cors from 'cors';
import path from 'path';
// import rootRouter from './routes';
// import { errorHandler } from './middlewares/error.middleware';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware Global
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static folder agar React bisa merender/mendownload PDF dengan URL http://localhost:5000/files/namafile.pdf
app.use('/files', express.static(path.join(__dirname, '../../file_letters')));

// API Routes
// app.use('/api', rootRouter);

// // Global Error Handler (harus di paling bawah)
// app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Backend Server berjalan di http://localhost:${PORT}`);
});