require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Importy tras
const authRoutes = require('./routes/auth');
const doctorRoutes = require('./routes/doctors');
const appointmentRoutes = require('./routes/appointments');

const app = express();
const PORT = process.env.PORT || 5000;

// Główne middleware (Włączenie CORS dla zewnętrznych frontendów takich jak React/Vite)
app.use(cors());
app.use(express.json());

// Podpięcie endpointów API
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);

// Endpoint testowy / powitalny
app.get('/', (req, res) => {
  res.json({ message: 'Witaj w API Systemu Rezerwacji Medycznej!' });
});

// Middleware do łapania nieistniejących tras (404)
app.use((req, res) => {
  res.status(404).json({ error: 'Nie znaleziono ścieżki (404)' });
});

// Uruchomienie serwera
app.listen(PORT, () => {
  console.log(`\n==============================================`);
  console.log(`🚀 Serwer uruchomiony pomyślnie na porcie: ${PORT}`);
  console.log(`==============================================\n`);
});
