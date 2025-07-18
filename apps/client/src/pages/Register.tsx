import React, { useState } from 'react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { apiRequest } from '../lib/api';
import { API_BASE_URL } from '../lib/api';
import { useFormErrors } from '../hooks/useFormErrors';
import { ErrorAlert } from '../components/ErrorAlert';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { errors, generalError, clearErrors, handleApiResponse } = useFormErrors();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearErrors();
    
    try {
      const res = await apiRequest<{ token: string; data: any; error?: string }>(
        '/users/register',
        'POST',
        { email, fullName, password }
      );
      
      if (res.success) {
        const token = (res.data && res.data.token) || res.token;
        if (token) {
          localStorage.setItem('jwt', token);
          window.location.href = '/';
        } else {
          // This shouldn't happen in normal flow, but handle it gracefully
          console.error('Registration successful but no token received');
        }
      } else {
        handleApiResponse(res);
      }
    } catch (err) {
      handleApiResponse({ 
        success: false, 
        error: 'Network error. Please check your connection and try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-80">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
        <div className="mb-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          {errors.email && <ErrorAlert message={errors.email} className="mt-6" />}
        </div>
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required
          />
          {errors.fullName && <ErrorAlert message={errors.fullName} className="mt-6" />}
        </div>
        <div className="mb-4">
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {errors.password && <ErrorAlert message={errors.password} className="mt-6" />}
        </div>
        {generalError && <ErrorAlert message={generalError} className="mb-4" />}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </Button>
        <div className="mt-4 text-center">
          <a href="/login" className="text-blue-600 hover:underline text-sm">Already have an account? Login</a>
        </div>
      </form>
    </div>
  );
};

export default Register; 