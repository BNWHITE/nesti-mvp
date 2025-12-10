import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './ActivityMap.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom user location icon
const userIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iOCIgZmlsbD0iIzJkNWY1ZCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIzIi8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjQiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Component to handle map centering
function ChangeMapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

const ActivityMap = ({ activities = [], onActivityClick, userLocation, height = '400px' }) => {
  const [mapCenter, setMapCenter] = useState([48.8566, 2.3522]); // Default: Paris
  const [mapZoom, setMapZoom] = useState(12);
  const [geoError, setGeoError] = useState(null);

  useEffect(() => {
    if (userLocation) {
      setMapCenter([userLocation.lat, userLocation.lng]);
      setMapZoom(13);
    }
  }, [userLocation]);

  const requestGeolocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapCenter([latitude, longitude]);
          setMapZoom(13);
          setGeoError(null);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setGeoError('Impossible d\'obtenir votre position. Veuillez autoriser la géolocalisation.');
        }
      );
    } else {
      setGeoError('La géolocalisation n\'est pas supportée par votre navigateur.');
    }
  };

  // Filter activities with valid coordinates
  const validActivities = activities.filter(
    (activity) => 
      activity.location?.coordinates?.lat && 
      activity.location?.coordinates?.lng &&
      !isNaN(activity.location.coordinates.lat) &&
      !isNaN(activity.location.coordinates.lng)
  );

  return (
    <div className="activity-map-container" style={{ height }}>
      <div className="activity-map-controls">
        <button 
          className="activity-map-geolocate-btn" 
          onClick={requestGeolocation}
          title="Me géolocaliser"
        >
          📍 Ma position
        </button>
        {geoError && <div className="activity-map-error">{geoError}</div>}
      </div>

      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%', borderRadius: '12px' }}
      >
        <ChangeMapView center={mapCenter} zoom={mapZoom} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User location marker */}
        {userLocation && (
          <Marker 
            position={[userLocation.lat, userLocation.lng]} 
            icon={userIcon}
          >
            <Popup>
              <strong>📍 Vous êtes ici</strong>
            </Popup>
          </Marker>
        )}

        {/* Activity markers */}
        {validActivities.map((activity) => (
          <Marker
            key={activity.id}
            position={[
              activity.location.coordinates.lat,
              activity.location.coordinates.lng
            ]}
          >
            <Popup>
              <div className="activity-map-popup">
                <div className="activity-map-popup-icon">
                  {activity.icon || activity.category}
                </div>
                <h4 className="activity-map-popup-title">{activity.title}</h4>
                {activity.location?.address && (
                  <p className="activity-map-popup-address">
                    📍 {activity.location.address}
                  </p>
                )}
                {activity.location?.distance && (
                  <p className="activity-map-popup-distance">
                    📏 {activity.location.distance}
                  </p>
                )}
                {onActivityClick && (
                  <button
                    className="activity-map-popup-btn"
                    onClick={() => onActivityClick(activity)}
                  >
                    Voir détails
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="activity-map-stats">
        {validActivities.length} activité{validActivities.length !== 1 ? 's' : ''} sur la carte
      </div>
    </div>
  );
};

export default ActivityMap;
