// VideoViewer.js
const VideoViewer = ({ url }) => (
    <ReactPlayer
        url={url}
        controls
        width="100vw"
        height="100vh"
        style={{ maxHeight: '100vh', maxWidth: '100vw' }}
    />
);
export default VideoViewer;
