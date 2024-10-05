// ImageViewer.js
const ImageViewer = ({ url }) => (
    <img
        src={url}
        alt="Full size"
        className="w-full h-full object-contain"
        style={{ maxHeight: '100vh', maxWidth: '100vw' }}
    />
);
export default ImageViewer;
