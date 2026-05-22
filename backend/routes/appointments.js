const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireRole } = require('../middleware/auth');

const prisma = new PrismaClient();

// POST /api/appointments - Rezerwacja wizyty przez pacjenta
router.post('/', authenticate, requireRole(['PATIENT']), async (req, res) => {
  try {
    const { doctorId, dateTime } = req.body; 

    if (!doctorId || !dateTime) {
      return res.status(400).json({ error: 'Wymagane pola: doctorId, dateTime (w formacie ISO)' });
    }

    const requestedDate = new Date(dateTime);

    // Opcjonalne sprawdzenie: nie pozwól na rezerwację w przeszłości
    if (requestedDate < new Date()) {
      return res.status(400).json({ error: 'Nie można zarezerwować wizyty w przeszłości.' });
    }

    // Bezpieczeństwo i pewność: Podwójna walidacja w bazie czy termin jest naprawdę wolny
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId: doctorId,
        dateTime: requestedDate,
        status: 'CONFIRMED'
      }
    });

    if (existingAppointment) {
      return res.status(400).json({ error: 'Niestety, ten termin został już zarezerwowany.' });
    }

    // Tworzenie nowej rezerwacji
    const appointment = await prisma.appointment.create({
      data: {
        patientId: req.user.userId,
        doctorId: doctorId,
        dateTime: requestedDate,
        status: 'CONFIRMED'
      }
    });

    res.status(201).json({ message: 'Pomyślnie zarezerwowano wizytę!', appointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Błąd podczas rezerwacji wizyty.' });
  }
});

// GET /api/appointments/me - Pobieranie wizyt zalogowanego użytkownika
router.get('/me', authenticate, async (req, res) => {
  try {
    let appointments;

    // PACJENT widzi listę swoich wizyt wraz z danymi lekarza
    if (req.user.role === 'PATIENT') {
      appointments = await prisma.appointment.findMany({
        where: { patientId: req.user.userId },
        include: {
          doctor: { 
            select: { 
              email: true, 
              doctorProfile: true 
            } 
          }
        },
        orderBy: { dateTime: 'asc' }
      });
    } 
    // LEKARZ widzi wszystkie swoje przyszłe/przeszłe wizyty i adres email pacjenta
    else if (req.user.role === 'DOCTOR') {
      appointments = await prisma.appointment.findMany({
        where: { doctorId: req.user.userId },
        include: {
          patient: { select: { id: true, email: true } }
        },
        orderBy: { dateTime: 'asc' }
      });
    } 
    // ADMIN widzi globalnie wszystkie rezerwacje
    else if (req.user.role === 'ADMIN') {
      appointments = await prisma.appointment.findMany({
        include: {
          patient: { select: { email: true } },
          doctor: { select: { email: true, doctorProfile: true } }
        },
        orderBy: { dateTime: 'asc' }
      });
    }

    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Błąd pobierania wizyt.' });
  }
});

module.exports = router;
