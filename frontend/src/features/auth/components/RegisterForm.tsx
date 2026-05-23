import React, { useState } from 'react';
import { useRegister } from '../hooks/useRegister';
import { UserRole } from '../../../types/types';

const RegisterForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('PATIENT');
  
  // Pola specyficzne dla lekarza
  const [specialty, setSpecialty] = useState('');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [profilePicture, setProfilePicture] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const { mutate: register, isPending } = useRegister();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name || !role) return;

    const payload: any = {
      name,
      email,
      password,
      role,
    };

    if (role === 'DOCTOR') {
      if (!specialty || !city) return;
      payload.specialty = specialty;
      payload.city = city;
      payload.bio = bio || null;
      payload.profilePicture = profilePicture || null;
    }

    register(payload);
  };

  return (
    <div className="w-full max-w-lg p-8 bg-neutral-900/80 backdrop-blur-md border border-neutral-800 rounded-2xl shadow-xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight">Utwórz konto</h2>
        <p className="text-sm text-neutral-400 mt-2">Zarejestruj się w systemie MedReserve</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Imię i nazwisko */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-neutral-300 mb-1.5">
            Imię i nazwisko
          </label>
          <input
            id="name"
            type="text"
            required
            placeholder="np. Anna Kowalska"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
            className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition duration-200"
          />
        </div>

        {/* E-mail */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-1.5">
            Adres e-mail
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            placeholder="np. anna.kowalska@przyklad.pl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending}
            className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition duration-200"
          />
        </div>

        {/* Hasło */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-neutral-300 mb-1.5">
            Hasło
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isPending}
              className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition duration-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isPending}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition duration-200 focus:outline-none"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Wybór Roli */}
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Typ konta
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setRole('PATIENT')}
              disabled={isPending}
              className={`py-2.5 px-4 rounded-xl border text-sm font-medium transition duration-200 cursor-pointer ${
                role === 'PATIENT'
                  ? 'bg-blue-600/10 border-blue-500 text-blue-400'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              Pacjent
            </button>
            <button
              type="button"
              onClick={() => setRole('DOCTOR')}
              disabled={isPending}
              className={`py-2.5 px-4 rounded-xl border text-sm font-medium transition duration-200 cursor-pointer ${
                role === 'DOCTOR'
                  ? 'bg-blue-600/10 border-blue-500 text-blue-400'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              Lekarz
            </button>
          </div>
        </div>

        {/* Pola specyficzne dla Lekarza (wyświetlane warunkowo) */}
        {role === 'DOCTOR' && (
          <div className="space-y-4 pt-4 border-t border-neutral-800/60 transition-all duration-300">
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Profil Lekarza (Wymagane)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="specialty" className="block text-sm font-medium text-neutral-300 mb-1.5">
                  Specjalizacja
                </label>
                <input
                  id="specialty"
                  type="text"
                  required={role === 'DOCTOR'}
                  placeholder="np. Kardiolog"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  disabled={isPending}
                  className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition duration-200"
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-neutral-300 mb-1.5">
                  Miasto
                </label>
                <input
                  id="city"
                  type="text"
                  required={role === 'DOCTOR'}
                  placeholder="np. Warszawa"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={isPending}
                  className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition duration-200"
                />
              </div>
            </div>

            <div>
              <label htmlFor="profilePicture" className="block text-sm font-medium text-neutral-300 mb-1.5">
                Zdjęcie profilowe URL (Opcjonalnie)
              </label>
              <input
                id="profilePicture"
                type="url"
                placeholder="https://example.com/zdjecie.jpg"
                value={profilePicture}
                onChange={(e) => setProfilePicture(e.target.value)}
                disabled={isPending}
                className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition duration-200"
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-neutral-300 mb-1.5">
                Opis / Bio (Opcjonalnie)
              </label>
              <textarea
                id="bio"
                rows={3}
                placeholder="Napisz krótki opis o swoim doświadczeniu..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                disabled={isPending}
                className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition duration-200 resize-none"
              />
            </div>
          </div>
        )}

        {/* Przycisk Rejestracji */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-xl transition duration-200 shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {isPending ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Rejestracja...</span>
            </>
          ) : (
            'Zarejestruj się'
          )}
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;