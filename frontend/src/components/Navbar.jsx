import React, { useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import { useSetRecoilState } from 'recoil';
import { imagesUpdatedState } from '../atoms/state';

const Navbar = () => {
    const [name, setName] = useState("Y");
    const [showLogout, setShowLogout] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadMessage, setUploadMessage] = useState('');
    const setImagesUpdated = useSetRecoilState(imagesUpdatedState);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const decodedToken = jwtDecode(token);
        setName(decodedToken.userId[0]);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    const toggleLogout = () => {
        setShowLogout(!showLogout);
    };

    const handleFileChange = (event) => {
        uploadFile(event.target.files[0], event.target.files[0].name);
        event.target.value = null; // Clear the file input
    };

    const uploadFile = async (file, imageName) => {
        setUploading(true);
        setUploadProgress(0);
        setUploadMessage('Uploading...');

        try {
            const signedUrl = await axios.post(`${API_URL}/api/v1/upload-photo`, {
                type: file.type,
                imageName
            }, {
                headers: {
                    Authorization: localStorage.getItem('token')
                }
            });

            const xhr = new XMLHttpRequest();
            xhr.open('PUT', signedUrl.data.url);

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = Math.round((event.loaded / event.total) * 100);
                    setUploadProgress(percentComplete);
                }
            };

            xhr.onload = async () => {
                if (xhr.status === 200) {
                    await axios.post(`${API_URL}/api/v1/saveImageDb`, {
                        imageName,
                        photoKey: signedUrl.data.photoKey
                    }, {
                        headers: {
                            Authorization: localStorage.getItem('token')
                        }
                    });
                    setUploadMessage('Upload complete!');
                    setTimeout(() => {
                        setUploading(false);
                        setUploadProgress(0);
                        setUploadMessage('');
                    }, 2000);

                    setImagesUpdated(prev => !prev); // Notify Dashboard to refresh images
                } else {
                    setUploadMessage('Upload failed.');
                }
            };

            xhr.onerror = () => {
                setUploadMessage('Upload failed.');
            };

            xhr.send(file);

        } catch (error) {
            console.error('Error uploading file:', error);
            setUploadMessage('Failed to upload file.');
            setUploading(false);
        }
    };

    return (
        <nav className="flex items-center justify-between p-4 shadow-lg bg-gray-800">
            <div className="flex items-center space-x-2">
                <label htmlFor="file-input" className="flex items-center space-x-2 text-lg font-bold text-white cursor-pointer">
                    <svg 
                        width="24" 
                        height="24" 
                        viewBox="0 0 24 24" 
                        fill="currentColor"
                    >
                        <path d="M4 15h2v3h12v-3h2v3c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2m4.41-7.59L11 7.83V16h2V7.83l2.59 2.59L17 9l-5-5-5 5 1.41 1.41z"></path>
                    </svg>
                    <span>Upload</span>
                </label>
                <input 
                    type="file" 
                    id="file-input" 
                    style={{ display: 'none' }} 
                    onChange={handleFileChange} 
                    title="Select a file to upload"
                    aria-label="File input"
                />
            </div>
            {uploading && (
                <div className="flex items-center space-x-2">
                    <div className="w-32 h-2 bg-gray-300 rounded">
                        <div
                            className="h-2 bg-green-500 rounded"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                    <span className="text-white text-sm">{uploadProgress}%</span>
                    <span className="text-white text-sm">{uploadMessage}</span>
                </div>
            )}
            <div className="relative">
                <button 
                    onClick={toggleLogout} 
                    className="flex items-center justify-center w-10 h-10 text-lg font-bold uppercase text-white bg-gray-700 rounded-full"
                >
                    {name}
                </button>
                {showLogout && (
                    <div className="absolute right-0 bg-white text-black shadow-md rounded-lg">
                        <button 
                            onClick={handleLogout} 
                            className="w-full px-4 py-2 hover:bg-gray-200 rounded-lg"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
