'use client';

import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Profile() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    jobTitle: '',
    industry: '',
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
    if (user) {
      setFormData({
        name: user.name,
        jobTitle: user.jobTitle || '',
        industry: user.industry || '',
      });
    }
  }, [user, loading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setUpdateLoading(true);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setIsEditing(false);
      // Refresh the page to update the user data
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">Profile</h1>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition"
            >
              Edit Profile
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
            <div>
              <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">
                Job Title
              </label>
              <input
                type="text"
                id="jobTitle"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                Industry
              </label>
              <input
                type="text"
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={updateLoading}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition"
              >
                {updateLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-medium text-gray-500">Name</h2>
              <p className="mt-1 text-lg">{user.name}</p>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500">Email</h2>
              <p className="mt-1 text-lg">{user.email}</p>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500">Account Type</h2>
              <p className="mt-1 text-lg">{user.userType.replace('_', ' ')}</p>
            </div>
            {user.jobTitle && (
              <div>
                <h2 className="text-sm font-medium text-gray-500">Job Title</h2>
                <p className="mt-1 text-lg">{user.jobTitle}</p>
              </div>
            )}
            {user.industry && (
              <div>
                <h2 className="text-sm font-medium text-gray-500">Industry</h2>
                <p className="mt-1 text-lg">{user.industry}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 