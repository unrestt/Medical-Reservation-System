import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const MainLayout = () => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Dynamiczne linki nawigacyjne zależnie od roli
  const getNavLinks = () => {
    if (!user) return [];
    
    switch (user.role) {
      case 'PATIENT':
        return [
          { to: '/patient/dashboard', label: 'Panel pacjenta' },
          { to: '/patient/book', label: 'Umów wizytę' },
        ];
      case 'DOCTOR':
        return [
          { to: '/doctor/dashboard', label: 'Panel lekarza' },
          { to: '/doctor/schedule', label: 'Mój grafik' },
        ];
      case 'ADMIN':
        return [
          { to: '/admin/dashboard', label: 'Panel administratora' },
          { to: '/admin/doctors', label: 'Zarządzanie lekarzami' },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col md:flex-row">
      {/* Pasek Boczny (Sidebar) */}
      <aside className="w-full md:w-64 bg-neutral-900 border-b md:border-b-0 md:border-r border-neutral-800 flex flex-col justify-between p-6">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 10.5V20a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-9.5m14 0V9a2 2 0 0 0-2-2h-3.5m0 0V4a2 2 0 0 0-2-2h-3a2 2 0 0 0-2 2v3m5 0H7a2 2 0 0 0-2 2v1.5m14 0h-4.5M5 10.5h4.5" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white tracking-wide">MedReserve</span>
          </div>

          {/* Profil użytkownika */}
          {user && (
            <div className="mb-8 p-4 bg-neutral-950 border border-neutral-800 rounded-xl">
              <div className="text-xs text-neutral-500 font-semibold tracking-wider uppercase mb-1">
                Zalogowano jako:
              </div>
              <div className="text-sm font-bold truncate">{user.name}</div>
              <div className="text-xs text-blue-400 mt-1 uppercase font-semibold tracking-widest">
                {user.role === 'ADMIN' ? 'Administrator' : user.role === 'DOCTOR' ? 'Lekarz' : 'Pacjent'}
              </div>
            </div>
          )}

          {/* Nawigacja */}
          <nav className="space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-xl text-sm font-medium transition duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                      : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Wylogowanie */}
        <div className="mt-8 md:mt-0 pt-4 border-t border-neutral-800 md:border-t-0">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 bg-neutral-800 hover:bg-red-900/40 hover:text-red-400 text-neutral-300 font-medium rounded-xl text-sm transition duration-200 flex items-center justify-center gap-2 cursor-pointer border border-transparent hover:border-red-900/50"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Wyloguj się
          </button>
        </div>
      </aside>

      {/* Główna Zawartość Strony */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;