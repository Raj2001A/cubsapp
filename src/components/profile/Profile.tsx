import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Building, Calendar, Edit, Save, X } from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  department: string;
  position: string;
  joinDate: string;
  avatar: string;
}

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
    address: '123 Main St, City, Country',
    department: 'IT',
    position: 'Senior Developer',
    joinDate: '2023-01-15',
    avatar: 'https://via.placeholder.com/150'
  });

  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);

  const handleEdit = () => {
    setEditedProfile(profile);
    setIsEditing(true);
  };

  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedProfile({
      ...editedProfile,
      [name]: value
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
        {!isEditing ? (
          <button
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 flex items-center"
            onClick={handleEdit}
          >
            <Edit className="h-5 w-5 mr-2" />
            Edit Profile
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-secondary/90 flex items-center"
              onClick={handleCancel}
            >
              <X className="h-5 w-5 mr-2" />
              Cancel
            </button>
            <button
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 flex items-center"
              onClick={handleSave}
            >
              <Save className="h-5 w-5 mr-2" />
              Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-32 h-32 rounded-full object-cover mb-4"
              />
              <h2 className="text-xl font-semibold text-gray-900">{profile.name}</h2>
              <p className="text-gray-500">{profile.position}</p>
            </div>

            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={editedProfile.email}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <Mail className="h-5 w-5 text-gray-400 mr-2" />
                      {profile.email}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={editedProfile.phone}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <Phone className="h-5 w-5 text-gray-400 mr-2" />
                      {profile.phone}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address"
                      value={editedProfile.address}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                      {profile.address}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">Department</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="department"
                      value={editedProfile.department}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <Building className="h-5 w-5 text-gray-400 mr-2" />
                      {profile.department}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">Position</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="position"
                      value={editedProfile.position}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <User className="h-5 w-5 text-gray-400 mr-2" />
                      {profile.position}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">Join Date</label>
                  <div className="flex items-center text-gray-900">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    {new Date(profile.joinDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 