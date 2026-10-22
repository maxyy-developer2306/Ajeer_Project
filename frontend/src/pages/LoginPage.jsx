import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, setToken } from '../services/authService';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const data = await loginUser(username, password);
      if (data.token) {
        setToken(data.token);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f2f5f2] px-4 py-10 font-['Cairo',sans-serif] text-[#18332d]">
      <section className="w-full max-w-[420px] rounded-lg border border-[#dce5df] bg-white p-7 shadow-[0_18px_50px_rgba(24,51,45,0.1)] sm:p-9">
        <p className="mb-2 text-center text-xs font-extrabold text-[#17745b]">AJEER ADMIN</p>
        <h1 className="mb-7 text-center text-2xl font-extrabold">Login</h1>
        {error && (
          <div role="alert" className="mb-4 rounded-md border border-[#efb4ae] bg-[#fff0ed] px-3 py-2.5 text-sm font-semibold text-[#a33326]">
            {error}
          </div>
        )}
        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block text-sm font-bold text-[#385249]">
            <span className="mb-2 block">Username</span>
            <input
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="min-h-11 w-full rounded-md border border-[#cbd6d0] bg-white px-3 py-2.5 text-[#18332d] outline-none transition focus:border-[#17745b] focus:ring-2 focus:ring-[#17745b]/20"
            />
          </label>
          <label className="block text-sm font-bold text-[#385249]">
            <span className="mb-2 block">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="min-h-11 w-full rounded-md border border-[#cbd6d0] bg-white px-3 py-2.5 text-[#18332d] outline-none transition focus:border-[#17745b] focus:ring-2 focus:ring-[#17745b]/20"
            />
          </label>
          <button
            type="submit"
            className="min-h-11 w-full rounded-md bg-[#17745b] px-4 py-2.5 font-bold text-white transition hover:bg-[#105c48] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17745b]"
          >
            Login
          </button>
        </form>
      </section>
    </main>
  );
};

export default LoginPage;
