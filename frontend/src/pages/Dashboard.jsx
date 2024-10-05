import React from 'react';
import Navbar from '../components/Navbar';
import ImageGallery from '../components/ImageGallery';

export const Dashboard = () => {
    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar/>
            <ImageGallery/>
        </div>
    );
};
