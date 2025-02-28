'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/app/contexts/AuthContext';
import { fetchWithAuth } from '@/app/lib/api';

interface Industry {
  id: string;
  name: string;
  tags: string[];
}

const INDUSTRIES: Industry[] = [
  {
    id: 'tech',
    name: 'Technology',
    tags: ['Software Development', 'AI/ML', 'Cloud Computing', 'Cybersecurity', 'Data Science', 'DevOps', 'Blockchain'],
  },
  {
    id: 'finance',
    name: 'Finance',
    tags: ['Investment Banking', 'FinTech', 'Trading', 'Risk Management', 'Wealth Management', 'Insurance'],
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    tags: ['Medical Devices', 'Biotechnology', 'Healthcare IT', 'Pharmaceuticals', 'Digital Health', 'Telemedicine'],
  },
  {
    id: 'marketing',
    name: 'Marketing',
    tags: ['Digital Marketing', 'Content Strategy', 'Social Media', 'Brand Management', 'SEO/SEM', 'Marketing Analytics'],
  },
];

export default function Settings() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [bannerPreview, setBannerPreview] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTagSearch, setShowTagSearch] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    industry: '',
    jobTitle: '',
    useGravatar: false,
    notifications: {
      email: true,
      push: true,
      eventReminders: true,
      messageAlerts: true,
      marketingEmails: false,
    },
  });

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login?redirect=/settings');
      return;
    }

    if (user) {
      // Fetch user settings
      const fetchSettings = async () => {
        try {
          const response = await fetchWithAuth('/api/user/settings');
          if (response.ok) {
            const data = await response.json();
            setFormData({
              name: data.name || '',
              email: data.email || '',
              bio: data.bio || '',
              industry: data.industry || '',
              jobTitle: data.jobTitle || '',
              useGravatar: data.useGravatar || false,
              notifications: {
                email: data.notifications?.email ?? true,
                push: data.notifications?.push ?? true,
                eventReminders: data.notifications?.eventReminders ?? true,
                messageAlerts: data.notifications?.messageAlerts ?? true,
                marketingEmails: data.notifications?.marketingEmails ?? false,
              },
            });
            setSelectedTags(data.tags || []);
            setAvatarPreview(data.avatarUrl || '');
            setBannerPreview(data.bannerUrl || '');
          }
        } catch (error) {
          console.error('Error fetching settings:', error);
        }
      };

      fetchSettings();
    }
  }, [user, isLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Update tags when industry changes
    if (name === 'industry') {
      const industryTags = INDUSTRIES.find(i => i.id === value)?.tags || [];
      setSelectedTags(prev => {
        const newTags = new Set([...prev]);
        industryTags.forEach(tag => newTags.add(tag));
        return Array.from(newTags);
      });
    }
  };

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [name]: checked,
      },
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => {
      const newTags = new Set(prev);
      if (newTags.has(tag)) {
        newTags.delete(tag);
      } else {
        newTags.add(tag);
      }
      return Array.from(newTags);
    });
  };

  const filteredTags = INDUSTRIES
    .flatMap(industry => industry.tags)
    .filter(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Upload avatar if changed
      let avatarUrl = avatarPreview;
      if (avatarFile) {
        const formData = new FormData();
        formData.append('file', avatarFile);
        const uploadResponse = await fetchWithAuth('/api/upload/avatar', {
          method: 'POST',
          body: formData,
        });
        if (uploadResponse.ok) {
          const { url } = await uploadResponse.json();
          avatarUrl = url;
        }
      }

      // Upload banner if changed
      let bannerUrl = bannerPreview;
      if (bannerFile) {
        const formData = new FormData();
        formData.append('file', bannerFile);
        const uploadResponse = await fetchWithAuth('/api/upload/banner', {
          method: 'POST',
          body: formData,
        });
        if (uploadResponse.ok) {
          const { url } = await uploadResponse.json();
          bannerUrl = url;
        }
      }

      // Save settings
      const response = await fetchWithAuth('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          avatarUrl,
          bannerUrl,
          tags: selectedTags,
        }),
      });

      if (response.ok) {
        // Show success message or redirect
        router.refresh();
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      // Show error message
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-gray-600 mt-2">Manage your profile and preferences</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Profile Images Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Profile Images</h2>
          
          {/* Avatar Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Picture
            </label>
            <div className="flex items-center space-x-4">
              <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100">
                <Image
                  src={avatarPreview || '/images/defaults/avatar.svg'}
                  alt="Profile picture"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  id="avatar-upload"
                />
                <div className="flex space-x-3">
                  <label
                    htmlFor="avatar-upload"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary cursor-pointer"
                  >
                    Upload New
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.useGravatar}
                      onChange={(e) => setFormData(prev => ({ ...prev, useGravatar: e.target.checked }))}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="ml-2 text-sm text-gray-600">Use Gravatar</span>
                  </label>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Recommended: Square image, at least 400x400px
                </p>
              </div>
            </div>
          </div>

          {/* Banner Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Banner
            </label>
            <div className="relative h-48 rounded-lg overflow-hidden bg-gray-100 mb-3">
              <Image
                src={bannerPreview || '/images/defaults/profile-banner.svg'}
                alt="Profile banner"
                fill
                className="object-cover"
              />
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleBannerChange}
              className="hidden"
              id="banner-upload"
            />
            <label
              htmlFor="banner-upload"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary cursor-pointer"
            >
              Upload Banner
            </label>
            <p className="mt-1 text-sm text-gray-500">
              Recommended: 1200x400px
            </p>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 gap-6">
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                value={formData.bio}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                placeholder="Tell us about yourself..."
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                Industry
              </label>
              <select
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              >
                <option value="">Select an industry</option>
                {INDUSTRIES.map(industry => (
                  <option key={industry.id} value={industry.id}>
                    {industry.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Interest Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interest Tags
              </label>
              <div className="mb-3">
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedTags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-50 text-primary"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleTagToggle(tag)}
                        className="ml-2 inline-flex items-center p-0.5 rounded-full text-primary hover:bg-primary-100 focus:outline-none"
                      >
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search tags..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowTagSearch(true);
                    }}
                    onFocus={() => setShowTagSearch(true)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  />
                  {showTagSearch && searchTerm && (
                    <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredTags.map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            handleTagToggle(tag);
                            setSearchTerm('');
                            setShowTagSearch(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 focus:outline-none"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-700">Email Notifications</h3>
                <p className="text-sm text-gray-500">Receive updates via email</p>
              </div>
              <label className="relative inline-flex items-center">
                <input
                  type="checkbox"
                  name="email"
                  checked={formData.notifications.email}
                  onChange={handleNotificationChange}
                  className="sr-only"
                />
                <div className={`w-11 h-6 rounded-full transition ${
                  formData.notifications.email ? 'bg-primary' : 'bg-gray-200'
                }`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition transform ${
                    formData.notifications.email ? 'translate-x-6' : 'translate-x-1'
                  } mt-1`} />
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-700">Push Notifications</h3>
                <p className="text-sm text-gray-500">Receive notifications in your browser</p>
              </div>
              <label className="relative inline-flex items-center">
                <input
                  type="checkbox"
                  name="push"
                  checked={formData.notifications.push}
                  onChange={handleNotificationChange}
                  className="sr-only"
                />
                <div className={`w-11 h-6 rounded-full transition ${
                  formData.notifications.push ? 'bg-primary' : 'bg-gray-200'
                }`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition transform ${
                    formData.notifications.push ? 'translate-x-6' : 'translate-x-1'
                  } mt-1`} />
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-700">Event Reminders</h3>
                <p className="text-sm text-gray-500">Get reminded about upcoming events</p>
              </div>
              <label className="relative inline-flex items-center">
                <input
                  type="checkbox"
                  name="eventReminders"
                  checked={formData.notifications.eventReminders}
                  onChange={handleNotificationChange}
                  className="sr-only"
                />
                <div className={`w-11 h-6 rounded-full transition ${
                  formData.notifications.eventReminders ? 'bg-primary' : 'bg-gray-200'
                }`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition transform ${
                    formData.notifications.eventReminders ? 'translate-x-6' : 'translate-x-1'
                  } mt-1`} />
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-700">Message Alerts</h3>
                <p className="text-sm text-gray-500">Get notified about new messages</p>
              </div>
              <label className="relative inline-flex items-center">
                <input
                  type="checkbox"
                  name="messageAlerts"
                  checked={formData.notifications.messageAlerts}
                  onChange={handleNotificationChange}
                  className="sr-only"
                />
                <div className={`w-11 h-6 rounded-full transition ${
                  formData.notifications.messageAlerts ? 'bg-primary' : 'bg-gray-200'
                }`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition transform ${
                    formData.notifications.messageAlerts ? 'translate-x-6' : 'translate-x-1'
                  } mt-1`} />
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-700">Marketing Emails</h3>
                <p className="text-sm text-gray-500">Receive promotional emails and updates</p>
              </div>
              <label className="relative inline-flex items-center">
                <input
                  type="checkbox"
                  name="marketingEmails"
                  checked={formData.notifications.marketingEmails}
                  onChange={handleNotificationChange}
                  className="sr-only"
                />
                <div className={`w-11 h-6 rounded-full transition ${
                  formData.notifications.marketingEmails ? 'bg-primary' : 'bg-gray-200'
                }`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition transform ${
                    formData.notifications.marketingEmails ? 'translate-x-6' : 'translate-x-1'
                  } mt-1`} />
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Security</h2>
          
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => router.push('/auth/reset-password')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Reset Password
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
} 