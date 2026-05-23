const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// REJESTRACJA
router.post('/register', async (req, res) => {
  try {
    const { email, password, role, name, specialty, city, bio, profilePicture } = req.body;

    // Walidacja danych wejściowych
    if (!email || !password || !role || !name) {
      return res.status(400).json({ error: 'Wymagane pola: email, password, role, name' });
    }

    if (!['PATIENT', 'DOCTOR', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Nieprawidłowa rola. Dostępne: PATIENT, DOCTOR, ADMIN' });
    }

    // Sprawdzenie, czy użytkownik z takim mailem już istnieje
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Użytkownik o tym adresie email już istnieje.' });
    }

    // Haszowanie hasła
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tworzenie użytkownika
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        name
      }
    });

    // Jeśli rejestruje się lekarz, wymagane są dodatkowe dane profilowe
    if (role === 'DOCTOR') {
      if (!specialty || !city) {
        return res.status(400).json({ error: 'Dla lekarza wymagane są dodatkowe pola: specialty, city' });
      }
      await prisma.doctorProfile.create({
        data: {
          userId: user.id,
          specialty,
          city,
          bio: bio || null,
          profilePicture: profilePicture || null
        }
      });
    }

    res.status(201).json({ message: 'Użytkownik zarejestrowany pomyślnie' });
  } catch (error) {
    console.error('Błąd rejestracji:', error);
    res.status(500).json({ error: 'Wystąpił wewnętrzny błąd serwera podczas rejestracji.' });
  }
});

// LOGOWANIE
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Szukanie użytkownika w bazie
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Nieprawidłowy email lub hasło.' });
    }

    // Weryfikacja hasła
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Nieprawidłowy email lub hasło.' });
    }

    // Tworzenie tokenu JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' } // Ważny 24 godziny
    );

    res.json({ token, role: user.role, userId: user.id, name: user.name, email: user.email });
  } catch (error) {
    console.error('Błąd logowania:', error);
    res.status(500).json({ error: 'Wystąpił wewnętrzny błąd serwera podczas logowania.' });
  }
});

module.exports = router;
