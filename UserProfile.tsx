import React, { useState, useEffect } from 'react';
import { useUser } from './src/contexts/UserContext';

const UserProfile: React.FC = () => {
    const { user, fetchUserData } = useUser();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>(user?.profileImage || '');
    const [uploading, setUploading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (user === null) {
            setLoading(true);
        } else {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user?.profileImage) {
            setPreviewUrl(user.profileImage);
        }
    }, [user?.profileImage]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setError('');
        }
    };

    if (loading) {
        return <div>Loading user profile...</div>;
    }

    if (!user) {
        return <div>User not found or not authenticated.</div>;
    }

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Please select a file first.');
            return;
        }
        setUploading(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('profileImage', selectedFile);
            const token = localStorage.getItem('token');
            const response = await fetch('/api/auth/upload-profile-image', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });
            if (!response.ok) throw new Error('Upload failed');
            await fetchUserData();
            setSelectedFile(null);
        } catch (err) {
            setError('Upload failed. Please try again.');
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="user-profile-dropdown" style={{ minWidth: '220px', minHeight: '180px', overflow: 'visible', position: 'relative', zIndex: 9999 }}>
            <div className="flex items-center px-4 py-4">
                <img
                    src={previewUrl || user?.profileImage || '/default-profile.png'}
                    alt="Profile"
                    className="rounded-md w-10 h-10 object-cover"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = '/default-profile.png';
                    }}
                />
                <div className="ltr:pl-4 rtl:pr-4 truncate">
                    <h4 className="text-base font-semibold text-gray-900 truncate">{user?.name || 'User'}</h4>
                    <p className="text-sm text-gray-600 truncate">{user?.email || 'user@example.com'}</p>
                </div>
            </div>

            <div className="mt-3 space-y-2">
                <label className="block">
                    <span className="sr-only">Choose profile photo</span>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
                    />
                </label>

                <button
                    onClick={handleUpload}
                    disabled={uploading || !selectedFile}
                    className="py-1.5 px-3 rounded-md text-sm font-medium shadow disabled:opacity-50 disabled:cursor-not-allowed relative z-50 block"
                    style={{ backgroundColor: '#1e40af', color: 'white', width: 'auto', minWidth: '120px' }}
                >
                    {uploading ? 'Uploading...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
};

export default UserProfile;
