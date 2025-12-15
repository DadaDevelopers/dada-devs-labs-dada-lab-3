import React, { useState, useEffect } from 'react';
import FormInput from '../ui/FormInput';
import {Button} from '../ui/Button';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
}

const ProfileSettingsPage: React.FC = () => {
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    email: '',
    phone: '',
    role: '',
    createdAt: '',
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    general?: string;
  }>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // TODO: Replace with actual API call to fetch user profile
    // const fetchProfile = async () => {
    //   const data = await getUserProfile();
    //   setProfileData(data);
    //   setFormData({
    //     name: data.name,
    //     email: data.email,
    //     phone: data.phone,
    //   });
    // };
    // fetchProfile();

    // Placeholder data - will be replaced with actual API call
    const mockData: ProfileData = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      role: 'Beneficiary',
      createdAt: '2024-01-15',
    };
    setProfileData(mockData);
    setFormData({
      name: mockData.name,
      email: mockData.email,
      phone: mockData.phone,
    });
  }, []);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
    setSuccessMessage('');
  };

  const handleEdit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
    setErrors({});
    setSuccessMessage('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: profileData.name,
      email: profileData.email,
      phone: profileData.phone,
    });
    setErrors({});
    setSuccessMessage('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // TODO: Replace with actual API call
      // await updateUserProfile(formData);
      // For now, simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Update local state
      setProfileData((prev) => ({
        ...prev,
        ...formData,
      }));
      
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      setErrors({
        general: 'Failed to update profile. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-[var(--color-primary-bg)] px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text-light)] mb-2">
            Profile Settings
          </h1>
          <p className="text-white/60">
            Manage your account information and preferences
          </p>
        </div>

        <div className="bg-[var(--color-secondary-bg)] rounded-lg shadow-xl p-8 border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm">
                {errors.general}
              </div>
            )}

            {successMessage && (
              <div className="bg-green-500/10 border border-green-500/50 text-green-500 px-4 py-3 rounded-lg text-sm">
                {successMessage}
              </div>
            )}

            {/* Display-only fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-white/10">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Role
                </label>
                <div className="px-4 py-3 rounded-lg bg-[#151D2C] border border-white/20 text-[var(--color-text-light)]">
                  {profileData.role || 'N/A'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Member Since
                </label>
                <div className="px-4 py-3 rounded-lg bg-[#151D2C] border border-white/20 text-[var(--color-text-light)]">
                  {formatDate(profileData.createdAt)}
                </div>
              </div>
            </div>

            {/* Editable fields */}
            <div className="space-y-6">
              <FormInput
                label="Full Name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                required
                placeholder="Enter your full name"
                disabled={!isEditing}
                autoComplete="name"
              />

              <FormInput
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
                placeholder="Enter your email"
                disabled={!isEditing}
                autoComplete="email"
              />

              <FormInput
                label="Phone Number"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                required
                placeholder="Enter your phone number"
                disabled={!isEditing}
                autoComplete="tel"
              />
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/10">
              {!isEditing ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleEdit}
                  className="w-full sm:w-auto"
                >
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    type="submit"
                    variant="secondary"
                    size="sm"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsPage;

