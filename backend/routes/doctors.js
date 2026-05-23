const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireRole } = require('../middleware/auth');

const prisma = new PrismaClient();

// GET /api/doctors - Pobieranie i filtrowanie lekarzy
router.get('/', async (req, res) => {
  try {
    const { specialty, city, name } = req.query;
    const filter = {};

    if (specialty) filter.specialty = { contains: specialty };
    if (city) filter.city = { contains: city };
    if (name) {
      filter.user = {
        name: { contains: name }
      };
    }

    const doctors = await prisma.doctorProfile.findMany({
      where: filter,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    const formattedDoctors = doctors.map(d => ({
      id: d.id,
      userId: d.userId,
      name: d.user.name,
      email: d.user.email,
      specialty: d.specialty,
      city: d.city,
      bio: d.bio,
      profilePicture: d.profilePicture
    }));

    res.json(formattedDoctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Błąd pobierania listy lekarzy' });
  }
});

// POST /api/doctors/availability - Ustawianie godzin pracy (tylko DOCTOR)
router.post('/availability', authenticate, requireRole(['DOCTOR']), async (req, res) => {
  try {
    const { dayOfWeek, startTime, endTime } = req.body;
    
    // Walidacja wejścia (0 = Niedziela, 6 = Sobota)
    if (dayOfWeek < 0 || dayOfWeek > 6 || !startTime || !endTime) {
      return res.status(400).json({ error: 'Nieprawidłowe dane dostępności. dayOfWeek (0-6), startTime i endTime wymagane.' });
    }

    // Pobranie profilu lekarza po ID z tokena
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: req.user.userId }
    });

    if (!doctorProfile) {
      return res.status(404).json({ error: 'Nie znaleziono profilu lekarza dla tego użytkownika' });
    }

    const availability = await prisma.availability.create({
      data: {
        doctorId: doctorProfile.id,
        dayOfWeek,
        startTime,
        endTime
      }
    });

    res.status(201).json({ message: 'Pomyślnie dodano godziny pracy', availability });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Błąd dodawania godzin pracy' });
  }
});

// GET /api/doctors/:id/slots?date=YYYY-MM-DD - Dynamiczne generowanie slotów (ZAAWANSOWANY ALGORYTM)
router.get('/:id/slots', async (req, res) => {
  try {
    const doctorId = parseInt(req.params.id, 10); // Przekazywane userId lekarza
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Brak parametru date (format YYYY-MM-DD)' });
    }

    // Parsowanie daty na obiekt Date i pobranie dnia tygodnia
    const [year, month, day] = date.split('-').map(Number);
    const targetDate = new Date(year, month - 1, day);
    const dayOfWeek = targetDate.getDay();

    // Pobranie profilu lekarza wraz z jego dniami pracy
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: doctorId },
      include: { availabilities: true }
    });

    if (!doctorProfile) {
      return res.status(404).json({ error: 'Lekarz nie istnieje' });
    }

    // Filtrujemy dostępności zdefiniowane tylko na dany dzień tygodnia
    const dayAvailabilities = doctorProfile.availabilities.filter(a => a.dayOfWeek === dayOfWeek);

    // Jeśli lekarz nie przyjmuje w ten dzień, zwracamy pustą listę
    if (dayAvailabilities.length === 0) {
      return res.json([]); 
    }

    // Zakres czasu dla szukania wizyt danego dnia
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0);
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

    // Pobieramy wszystkie potwiedzone rezerwacje dla tego lekarza na dany dzień
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctorId,
        status: 'CONFIRMED',
        dateTime: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    // Mapujemy zajęte czasy do tablicy timestampów (milisekundy), ułatwi to porównania
    const bookedTimes = appointments.map(app => app.dateTime.getTime());

    let availableSlots = [];

    // Dla każdego bloku godzinowego (np. 08:00 - 12:00 oraz 14:00 - 16:00 w tym samym dniu)
    dayAvailabilities.forEach(avail => {
      const [startHour, startMin] = avail.startTime.split(':').map(Number);
      const [endHour, endMin] = avail.endTime.split(':').map(Number);

      // Inicjalizujemy początkowy slot
      let currentSlot = new Date(year, month - 1, day, startHour, startMin, 0);
      const endTime = new Date(year, month - 1, day, endHour, endMin, 0);

      // Dopóki koniec aktualnego 30-minutowego slota mieści się w czasie końcowym pracy lekarza
      while (currentSlot.getTime() + 30 * 60000 <= endTime.getTime()) {
        const slotTimestamp = currentSlot.getTime();
        
        // Slot jest dostępny, jeśli dany czas NIE znajduje się na liście zarezerwowanych wizyt
        const isAvailable = !bookedTimes.includes(slotTimestamp);
        
        // Formatujemy czas na ładny string (np. "08:30")
        const timeString = `${String(currentSlot.getHours()).padStart(2, '0')}:${String(currentSlot.getMinutes()).padStart(2, '0')}`;
        
        availableSlots.push({
          time: timeString,
          dateTime: new Date(slotTimestamp),
          available: isAvailable
        });

        // Przesuwamy czas o 30 minut dla kolejnego slota
        currentSlot.setTime(slotTimestamp + 30 * 60000);
      }
    });

    // Sortujemy sloty chronologicznie i zwracamy (na wypadek niepokolei ustawionych przedziałów availibility)
    availableSlots.sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());

    res.json(availableSlots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Wystąpił błąd podczas generowania slotów.' });
  }
});

// PUT /api/doctors/profile - Aktualizacja profilu lekarza (tylko DOCTOR)
router.put('/profile', authenticate, requireRole(['DOCTOR']), async (req, res) => {
  try {
    const { name, specialty, city, bio, profilePicture } = req.body;
    const userId = req.user.userId;

    // Pobranie profilu lekarza
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId }
    });

    if (!doctorProfile) {
      return res.status(404).json({ error: 'Nie znaleziono profilu lekarza.' });
    }

    // Aktualizacja w transakcji
    const updatedProfile = await prisma.$transaction(async (tx) => {
      // 1. Zaktualizowanie User.name, jeśli podano
      if (name) {
        await tx.user.update({
          where: { id: userId },
          data: { name }
        });
      }

      // 2. Zaktualizowanie DoctorProfile
      return await tx.doctorProfile.update({
        where: { userId },
        data: {
          specialty: specialty !== undefined ? specialty : undefined,
          city: city !== undefined ? city : undefined,
          bio: bio !== undefined ? bio : undefined,
          profilePicture: profilePicture !== undefined ? profilePicture : undefined,
        },
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      });
    });

    res.json({
      message: 'Profil lekarza zaktualizowany pomyślnie.',
      doctor: {
        id: updatedProfile.id,
        userId: updatedProfile.userId,
        name: updatedProfile.user.name,
        email: updatedProfile.user.email,
        specialty: updatedProfile.specialty,
        city: updatedProfile.city,
        bio: updatedProfile.bio,
        profilePicture: updatedProfile.profilePicture
      }
    });
  } catch (error) {
    console.error('Błąd aktualizacji profilu lekarza:', error);
    res.status(500).json({ error: 'Wystąpił błąd podczas aktualizacji profilu.' });
  }
});

module.exports = router;
