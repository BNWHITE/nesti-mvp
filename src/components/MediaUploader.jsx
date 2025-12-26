import React, { useState } from 'react';
import logger from '../lib/logger';
import { uploadPhoto, uploadVideo, validateFile, compressImage } from '../services/mediaService';
import './MediaUploader.css';

function MediaUploader({ userId, onMediaUploaded, maxPhotos = 5 }) {
  const [photos, setPhotos] = useState([]);
  const [video, setVideo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handlePhotoSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (photos.length + files.length > maxPhotos) {
      setError(`Maximum ${maxPhotos} photos autorisées`);
      return;
    }

    setError(null);
    const newPhotos = [];

    for (const file of files) {
      const validation = validateFile(file, 'image');
      if (!validation.valid) {
        setError(validation.error);
        continue;
      }

      // Compress image
      try {
        const compressedFile = await compressImage(file);
        newPhotos.push({
          file: compressedFile,
          preview: URL.createObjectURL(compressedFile)
        });
      } catch (err) {
        logger.error('Compression error:', err);
        newPhotos.push({
          file,
          preview: URL.createObjectURL(file)
        });
      }
    }

    setPhotos([...photos, ...newPhotos]);
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validateFile(file, 'video');
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setError(null);
    setVideo({
      file,
      preview: URL.createObjectURL(file)
    });
  };

  const removePhoto = (index) => {
    URL.revokeObjectURL(photos[index].preview);
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const removeVideo = () => {
    if (video) {
      URL.revokeObjectURL(video.preview);
      setVideo(null);
    }
  };

  const handleUpload = async () => {
    if (photos.length === 0 && !video) return;

    setUploading(true);
    setError(null);

    const uploadedUrls = { photos: [], video: null };

    // Upload photos
    for (const photo of photos) {
      const { url, error: uploadError } = await uploadPhoto(photo.file, userId);
      if (uploadError) {
        setError(`Erreur upload photo: ${uploadError.message}`);
        setUploading(false);
        return;
      }
      uploadedUrls.photos.push(url);
    }

    // Upload video
    if (video) {
      const { url, error: uploadError } = await uploadVideo(video.file, userId);
      if (uploadError) {
        setError(`Erreur upload vidéo: ${uploadError.message}`);
        setUploading(false);
        return;
      }
      uploadedUrls.video = url;
    }

    // Clean up
    photos.forEach(p => URL.revokeObjectURL(p.preview));
    if (video) URL.revokeObjectURL(video.preview);

    setPhotos([]);
    setVideo(null);
    setUploading(false);

    if (onMediaUploaded) {
      onMediaUploaded(uploadedUrls);
    }
  };

  return (
    <div className="media-uploader">
      <div className="media-uploader-controls">
        <label className="media-upload-btn">
          📷 Photos
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoSelect}
            disabled={uploading || photos.length >= maxPhotos}
            style={{ display: 'none' }}
          />
        </label>

        <label className="media-upload-btn">
          🎥 Vidéo
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoSelect}
            disabled={uploading || video !== null}
            style={{ display: 'none' }}
          />
        </label>

        {(photos.length > 0 || video) && (
          <button
            className="media-upload-submit"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? 'Upload en cours...' : '✓ Valider'}
          </button>
        )}
      </div>

      {error && <div className="media-uploader-error">{error}</div>}

      {photos.length > 0 && (
        <div className="media-preview-grid">
          {photos.map((photo, index) => (
            <div key={index} className="media-preview-item">
              <img src={photo.preview} alt={`Preview ${index + 1}`} />
              <button
                className="media-preview-remove"
                onClick={() => removePhoto(index)}
                disabled={uploading}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {video && (
        <div className="media-preview-video">
          <video src={video.preview} controls />
          <button
            className="media-preview-remove"
            onClick={removeVideo}
            disabled={uploading}
          >
            ✕
          </button>
        </div>
      )}

      <div className="media-uploader-info">
        {photos.length > 0 && <span>{photos.length}/{maxPhotos} photos</span>}
        {video && <span>1 vidéo (max 50MB)</span>}
      </div>
    </div>
  );
}

export default MediaUploader;
