import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import AuthLayout, { Field, inputStyle } from '../components/auth/AuthLayout';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../utils/api';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(name.trim(), email.trim(), password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Inscription impossible. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Créer un compte" subtitle="Gérez votre magasin en quelques secondes">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Nom">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Bensaad"
            required
            autoComplete="name"
            className="w-full rounded-xl px-4 py-3 placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-white/30"
            style={inputStyle}
          />
        </Field>

        <Field label="E-mail">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@exemple.com"
            required
            autoComplete="email"
            inputMode="email"
            className="w-full rounded-xl px-4 py-3 placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-white/30"
            style={inputStyle}
          />
        </Field>

        <Field label="Mot de passe">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6 caractères minimum"
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full rounded-xl px-4 py-3 pr-11 placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-white/30"
              style={inputStyle}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30"
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </Field>

        {error && (
          <div
            className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg text-white/80"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <AlertCircle size={14} className="flex-shrink-0" /> {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-2xl font-semibold text-base transition-opacity active:opacity-80 disabled:opacity-50"
          style={{ background: 'white', color: '#080818' }}
        >
          {loading ? 'Création...' : 'Créer mon compte'}
        </button>
      </form>

      <p className="text-center text-sm text-white/35 mt-5">
        Déjà un compte ?{' '}
        <Link to="/login" className="text-white font-semibold">
          Se connecter
        </Link>
      </p>
    </AuthLayout>
  );
}
