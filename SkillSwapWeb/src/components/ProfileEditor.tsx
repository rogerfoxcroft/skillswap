import React, { useState } from 'react';
import { UserProfile } from '../types';

interface ProfileEditorProps {
  profile: UserProfile;
  onSave: (updatedProfile: Partial<UserProfile>) => Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ profile, onSave, onCancel, isSaving = false }) => {
  const [formData, setFormData] = useState({
    full_name: profile.full_name || '',
    location: profile.location || '',
    bio: profile.bio || '',
    username: profile.username || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Edit Profile</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="full_name" className="form-label">
              Full Name
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
          
          <div>
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="location" className="form-label">
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="form-input"
            placeholder="e.g., San Francisco, CA"
          />
        </div>
        
        <div>
          <label htmlFor="bio" className="form-label">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className="form-input"
            rows={4}
            placeholder="Tell others about yourself, your experience, and what you're passionate about..."
          />
        </div>
        
        <div className="flex space-x-4">
          <button type="submit" className="btn-primary" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary" disabled={isSaving}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEditor;