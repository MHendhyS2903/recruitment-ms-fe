import { useState } from 'react';
import LoadingProgress from '../components/common/LoadingProgress';
import type { FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearAuthError, getDefaultRouteForRole, login } from '../store/authSlice';

interface LoginLocationState {
  from?: string;
}

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const authLoading = useAppSelector((state) => state.auth.loading);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const locationState = location.state as LoginLocationState | null;
  const nextPath = locationState?.from;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password) {
      setErrorMessage('Email dan password wajib diisi.');
      return;
    }

    setErrorMessage('');
    dispatch(clearAuthError());

    try {
      const session = await dispatch(
        login({
          email: email.trim(),
          password,
        })
      ).unwrap();

      navigate(nextPath || getDefaultRouteForRole(session.user.role), {
        replace: true,
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Login gagal. Silakan coba lagi.'
      );
    }
  };

  return (
    <div className="login-shell">
      <section className="login-hero">
        <div className="login-hero-copy">
          <p className="login-kicker">BRI Internal Recruitment</p>
          <h1>Masuk ke Recruitment Dashboard</h1>
          <p className="login-description">
            Masuk untuk memantau proses recruitment, mengelola data kandidat,
            menjadwalkan interview, dan melihat report sesuai akses Anda.
          </p>
        </div>
      </section>

      <section className="login-card" aria-labelledby="login-title">
        <div className="login-card-header">
          <p className="eyebrow">BRI RECRUITMENT LOGIN</p>
          <h2 id="login-title">Login</h2>
          <p>
            Gunakan email dan password dari backend auth. Token login akan
            dipakai untuk request API berikutnya.
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Email</span>
            <input
              autoComplete="email"
              name="email"
              placeholder="admin@indocyber.com"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              autoComplete="current-password"
              name="password"
              placeholder="Masukkan password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {errorMessage ? <p className="login-error">{errorMessage}</p> : null}

          {authLoading ? (
            <LoadingProgress className="login-loading-progress" label="Memverifikasi kredensial..." />
          ) : null}

          <button className="primary-button login-submit-button" disabled={authLoading} type="submit">
            {authLoading ? 'Sedang masuk...' : 'Masuk'}
          </button>
        </form>
      </section>
    </div>
  );
}

export default LoginPage;
