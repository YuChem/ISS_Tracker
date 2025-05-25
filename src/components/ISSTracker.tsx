import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { Loader } from 'lucide-react';

// Define the ISS position type
interface ISSPosition {
  latitude: string;
  longitude: string;
}

// Define the API response type
interface ISSData {
  message: string;
  timestamp: number;
  iss_position: ISSPosition;
}

// Custom ISS icon
const issIcon = new L.Icon({
  iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/International_Space_Station.svg/1200px-International_Space_Station.svg.png',
  iconSize: [40, 25],
  iconAnchor: [20, 12.5],
  popupAnchor: [0, -10],
});

const ISSTracker: React.FC = () => {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [pathPositions, setPathPositions] = useState<[number, number][]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());
  const [timeSinceUpdate, setTimeSinceUpdate] = useState<number>(0);
  const intervalRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  // Update interval in milliseconds (15 seconds)
  const UPDATE_INTERVAL = 15000;

  const fetchISSPosition = async () => {
    try {
      console.log(`Fetching ISS position at ${new Date().toISOString()}`);
      const response = await axios.get<ISSData>('/iss-now/v1/');
      const { latitude, longitude } = response.data.iss_position;
      
      const newPosition: [number, number] = [parseFloat(latitude), parseFloat(longitude)];
      setPosition(newPosition);
      
      // Add the new position to the path
      setPathPositions(prevPositions => {
        // If this is the first position or if it's different from the last one
        if (prevPositions.length === 0 || 
            (prevPositions[prevPositions.length - 1][0] !== newPosition[0] || 
             prevPositions[prevPositions.length - 1][1] !== newPosition[1])) {
          return [...prevPositions, newPosition];
        }
        return prevPositions;
      });
      
      setLastUpdate(new Date().toLocaleTimeString());
      setLastUpdateTime(Date.now());
      setTimeSinceUpdate(0);
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error('Error fetching ISS position:', err);
      setError('Failed to fetch ISS position. Please try again later.');
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch position immediately
    fetchISSPosition();
    
    // Set up interval to fetch position every 15 seconds
    intervalRef.current = window.setInterval(fetchISSPosition, UPDATE_INTERVAL);
    
    // Set up timer to update the time since last update every second
    timerRef.current = window.setInterval(() => {
      setTimeSinceUpdate(Math.floor((Date.now() - lastUpdateTime) / 1000));
    }, 1000);
    
    // Clean up intervals on component unmount
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    };
  }, [lastUpdateTime]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-800 rounded-lg">
        <Loader className="w-10 h-10 text-blue-400 animate-spin mb-4" />
        <p className="text-gray-300">Loading ISS position...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-700 text-red-100 p-4 rounded-lg">
        <p className="font-medium">Error</p>
        <p>{error}</p>
        <button 
          onClick={fetchISSPosition}
          className="mt-2 px-4 py-2 bg-red-700 hover:bg-red-600 rounded-md text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
      <div className="h-[500px] relative">
        {position && (
          <>
            <MapContainer 
              center={position} 
              zoom={3} 
              style={{ height: '100%', width: '100%' }}
              attributionControl={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              {/* ISS travel path */}
              {pathPositions.length > 1 && (
                <Polyline 
                  positions={pathPositions}
                  pathOptions={{ color: '#0d47a1', weight: 3, opacity: 0.8 }}
                />
              )}
              
              {/* Position markers (black dots) */}
              {pathPositions.map((pos, index) => (
                <CircleMarker 
                  key={`pos-${index}`}
                  center={pos}
                  radius={2}
                  pathOptions={{ 
                    fillColor: '#000', 
                    fillOpacity: 1, 
                    color: '#000', 
                    weight: 1 
                  }}
                >
                  <Popup>
                    <div className="text-gray-800">
                      <strong>Recorded Position #{index + 1}</strong>
                      <p>Latitude: {pos[0].toFixed(4)}</p>
                      <p>Longitude: {pos[1].toFixed(4)}</p>
                      {index === pathPositions.length - 1 ? 
                        <p className="text-blue-600 font-semibold">Current Position</p> : 
                        null
                      }
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
              
              <Marker position={position} icon={issIcon}>
                <Popup>
                  <div className="text-gray-800">
                    <strong>International Space Station</strong>
                    <p>Latitude: {position[0].toFixed(4)}</p>
                    <p>Longitude: {position[1].toFixed(4)}</p>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
            
            {/* Time since last update overlay */}
            <div className="absolute top-3 right-3 bg-black/70 text-white px-3 py-2 rounded-md shadow-md z-[1000] backdrop-blur-sm">
              <div className="text-sm font-medium">
                Last update: <span className="text-blue-300">{timeSinceUpdate}s ago</span>
              </div>
            </div>
          </>
        )}
      </div>
      
      <div className="p-4 bg-gray-700 flex justify-between items-center">
        <div>
          {position && (
            <p className="text-gray-200">
              Current Position: {position[0].toFixed(4)}° N, {position[1].toFixed(4)}° E
            </p>
          )}
        </div>
        <div className="text-gray-400 text-sm">
          Last updated: {lastUpdate}
        </div>
      </div>
    </div>
  );
};

export default ISSTracker;
