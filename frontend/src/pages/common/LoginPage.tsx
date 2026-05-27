import { Link } from 'react-router-dom';
import LoginForm from '../../features/auth/components/LoginForm';

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4">
      {/* Brand logo */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 10.5V20a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-9.5m14 0V9a2 2 0 0 0-2-2h-3.5m0 0V4a2 2 0 0 0-2-2h-3a2 2 0 0 0-2 2v3m5 0H7a2 2 0 0 0-2 2v1.5m14 0h-4.5M5 10.5h4.5" />
          </svg>
        </div>
        <span className="text-xl font-bold text-white tracking-wide">MedReserve</span>
      </div>

      <LoginForm />

      <div className="mt-6 text-center">
        <p className="text-sm text-neutral-500">
          Nie masz jeszcze konta?{' '}
          <Link to={"/register"} className="text-blue-500 hover:text-blue-400 font-medium transition duration-200">Zarejestruj się</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;