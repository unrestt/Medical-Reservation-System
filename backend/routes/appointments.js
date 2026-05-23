const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireRole } = require('../middleware/auth');

const prisma = new PrismaClient();

// POST /api/appointments - Rezerwacja wizyty przez pacjenta
router.post('/', authenticate, requireRole(['PATIENT']), async (req, res) => {
  try {
    const { doctorId, dateTime, description } = req.body; 

    if (!doctorId || !dateTime || !description) {
      return res.status(400).json({ error: 'Wymagane pola: doctorId, dateTime (w formacie ISO), description' });
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
        status: 'CONFIRMED',
        description: description
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
              id: true,
              email: true, 
              name: true,
              doctorProfile: true 
            } 
          }
        },
        orderBy: { dateTime: 'asc' }
      });
    } 
    // LEKARZ widzi wszystkie swoje przyszłe/przeszłe wizyty i dane pacjenta
    else if (req.user.role === 'DOCTOR') {
      appointments = await prisma.appointment.findMany({
        where: { doctorId: req.user.userId },
        include: {
          patient: { 
            select: { 
              id: true, 
              email: true,
              name: true
            } 
          }
        },
        orderBy: { dateTime: 'asc' }
      });
    } 
    // ADMIN widzi globalnie wszystkie rezerwacje
    else if (req.user.role === 'ADMIN') {
      appointments = await prisma.appointment.findMany({
        include: {
          patient: { 
            select: { 
              id: true,
              email: true,
              name: true
            } 
          },
          doctor: { 
            select: { 
              id: true,
              email: true, 
              name: true,
              doctorProfile: true 
            } 
          }
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

// GET /api/appointments/doctor/:doctorId - Pobieranie wizyt dla konkretnego lekarza
router.get('/doctor/:doctorId', authenticate, async (req, res) => {
  try {
    const doctorId = parseInt(req.params.doctorId, 10);
    
    // Sprawdzenie uprawnień: tylko ADMIN lub ten konkretny lekarz
    if (req.user.role !== 'ADMIN') {
      if (req.user.role !== 'DOCTOR' || req.user.userId !== doctorId) {
        return res.status(403).json({ error: 'Odmowa dostępu: brak odpowiednich uprawnień.' });
      }
    }

    const appointments = await prisma.appointment.findMany({
      where: { doctorId: doctorId },
      include: {
        patient: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        doctor: {
          select: {
            id: true,
            email: true,
            name: true,
            doctorProfile: true
          }
        }
      },
      orderBy: { dateTime: 'asc' }
    });

    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Błąd pobierania wizyt lekarza.' });
  }
});

// GET /api/appointments/patient/:patientId - Pobieranie wizyt dla konkretnego pacjenta (klienta)
router.get('/patient/:patientId', authenticate, async (req, res) => {
  try {
    const patientId = parseInt(req.params.patientId, 10);

    // Sprawdzenie uprawnień: tylko ADMIN lub ten konkretny pacjent
    if (req.user.role !== 'ADMIN') {
      if (req.user.role !== 'PATIENT' || req.user.userId !== patientId) {
        return res.status(403).json({ error: 'Odmowa dostępu: brak odpowiednich uprawnień.' });
      }
    }

    const appointments = await prisma.appointment.findMany({
      where: { patientId: patientId },
      include: {
        patient: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        doctor: {
          select: {
            id: true,
            email: true,
            name: true,
            doctorProfile: true
          }
        }
      },
      orderBy: { dateTime: 'asc' }
    });

    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Błąd pobierania wizyt pacjenta.' });
  }
});

module.exports = router;
