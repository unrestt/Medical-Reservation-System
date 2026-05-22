# System Rezerwacji Medycznej - Dokumentacja API

Kompletny backend zbudowany z użyciem Node.js, Express.js i Prisma ORM (baza SQLite dla ułatwienia uruchomienia). Poniżej znajduje się spis wszystkich endpointów i sposoby ich użycia.

## 🚀 Szybki Start

1. Wejdź do katalogu `backend`:
   ```bash
   cd backend
   ```
2. Zainstaluj zależności:
   ```bash
   npm install
   ```
3. Zbuduj bazę danych:
   ```bash
   npx prisma db push
   ```
4. Uruchom serwer w trybie deweloperskim:
   ```bash
   npm run dev
   ```

Domyślnie serwer nasłuchuje na porcie `5000` pod adresem `http://localhost:5000`.

---

## 🔒 Autoryzacja i Tokeny JWT

Większość zapytań (oprócz logowania, rejestracji i podglądu profili lekarzy) wymaga bycia zalogowanym.
Aby się autoryzować, do każdego zapytania musisz dodać nagłówek HTTP:
```text
Authorization: Bearer <TWÓJ_TOKEN_JWT>
```
*Token otrzymasz zawsze po pomyślnym wykonaniu żądania do `/api/auth/login`.*

---

## 🌐 Endpointy API

### 1. Autentykacja (`/api/auth`)

#### Rejestracja Użytkownika / Pacjenta
- **Metoda:** `POST`
- **Ścieżka:** `/api/auth/register`
- **Body (JSON):**
  ```json
  {
    "email": "pacjent@example.com",
    "password": "haslo",
    "role": "PATIENT"
  }
  ```

#### Rejestracja Lekarza
- **Metoda:** `POST`
- **Ścieżka:** `/api/auth/register`
- **Body (JSON):**
  ```json
  {
    "email": "lekarz@example.com",
    "password": "haslo",
    "role": "DOCTOR",
    "name": "Jan Kowalski",
    "specialty": "Kardiolog",
    "city": "Warszawa"
  }
  ```

#### Logowanie
- **Metoda:** `POST`
- **Ścieżka:** `/api/auth/login`
- **Body (JSON):**
  ```json
  {
    "email": "pacjent@example.com",
    "password": "haslo"
  }
  ```
- **Zwraca:** Token JWT, userId oraz Twoją rolę (`PATIENT`, `DOCTOR` lub `ADMIN`).

---

### 2. Lekarze i Dostępność (`/api/doctors`)

#### Pobieranie listy lekarzy (z opcją filtrowania)
- **Metoda:** `GET`
- **Ścieżka:** `/api/doctors`
- **Parametry URL (opcjonalne):** `?specialty=Kardiolog&city=Warszawa`
- **Zwraca:** Tablicę lekarzy spełniających kryteria.

#### Ustawianie godzin pracy (Tylko dla Lekarzy)
- **Metoda:** `POST`
- **Ścieżka:** `/api/doctors/availability`
- **Wymagana autoryzacja:** Tak (`DOCTOR`)
- **Opis:** Ustawia dni, w jakich lekarz chce przyjmować pacjentów. Dni tygodnia (`dayOfWeek`) numerowane są od 0 (Niedziela) do 6 (Sobota).
- **Body (JSON):**
  ```json
  {
    "dayOfWeek": 1, 
    "startTime": "08:00",
    "endTime": "14:00"
  }
  ```

#### Pobieranie dostępnych slotów (Dla danego dnia)
- **Metoda:** `GET`
- **Ścieżka:** `/api/doctors/:id/slots?date=YYYY-MM-DD`
- **Opis:** Parametr `:id` to ID użytkownika-lekarza. Endpoint z wykorzystaniem zaawansowanego algorytmu łączy godziny pracy lekarza z zapisanymi już wizytami i dynamicznie tworzy wolne ramki czasowe co 30 minut.
- **Przykład wywołania:** `GET /api/doctors/2/slots?date=2026-05-25`
- **Zwraca:** Tablicę slotów. Zwróć uwagę na pole `"dateTime"` oraz boolean `"available"`.

---

### 3. Rezerwacje Wizyt (`/api/appointments`)

#### Rezerwacja nowego terminu (Tylko dla Pacjentów)
- **Metoda:** `POST`
- **Ścieżka:** `/api/appointments`
- **Wymagana autoryzacja:** Tak (`PATIENT`)
- **Body (JSON):**
  ```json
  {
    "doctorId": 2,
    "dateTime": "2026-05-25T08:30:00.000Z"
  }
  ```
  *(Najlepiej użyć wartości z pola `"dateTime"` zwróconej przez endpoint `/slots`)*. Zabezpieczenie systemowe upewni się, czy slot jest wciąż wolny, zanim pozwoli na rezerwację.

#### Wyświetlanie własnych wizyt (Harmonogram)
- **Metoda:** `GET`
- **Ścieżka:** `/api/appointments/me`
- **Wymagana autoryzacja:** Tak (Dowolna rola)
- **Opis:** Ten sam endpoint działa różnie w zależności od tego, kto z niego korzysta:
  - Zalogowany **Pacjent** ujrzy historię swoich rezerwacji oraz dane lekarza do którego się uda.
  - Zalogowany **Lekarz** zobaczy wszystkie nadchodzące wizyty pacjentów przypisane do niego, ułożone chronologicznie.
  - Zalogowany **Admin** otrzyma dostęp do pełnej bazy wszystkich spotkań medycznych w klinice.

---

## 🛠 Struktura Bazy Danych
System oparty jest na 4 powiązanych relacyjnie modelach:
1. `User` - przechowuje wszystkich (i odpowiada za logowanie).
2. `DoctorProfile` - przedłużenie użytkownika będącego lekarzem o publiczne dane i specjalizacje.
3. `Availability` - definicja godzin i dni pracy, zależna od profilu lekarza.
4. `Appointment` - konkretna rezerwacja czasowa między pacjentem a lekarzem. Wiele do wielu (1 lekarz ma wiele rezerwacji, 1 pacjent ma wiele rezerwacji).
