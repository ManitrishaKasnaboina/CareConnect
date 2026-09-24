import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { useSocket } from '../context/SocketContext';
import { Loader2 } from 'lucide-react';

const LiveMap = ({ jobId, initialLat, initialLng, customerLocation }) => {
  const { socket, isConnected } = useSocket();
  const customerPosition = customerLocation || { lat: initialLat, lng: initialLng };
  const [providerLocation, setProviderLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(customerPosition);
  const googleMapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (socket && isConnected && jobId) {
      // Join the specific room for this job to listen to location updates
      socket.emit('join', `job_${jobId}`);

      // Listen for location updates
      const handleLocationUpdated = (data) => {
        if (data.jobId === `job_${jobId}`) {
          setProviderLocation({ lat: data.lat, lng: data.lng });
          setMapCenter({ lat: data.lat, lng: data.lng });
        }
      };
      socket.on('locationUpdated', handleLocationUpdated);

      return () => {
        socket.off('locationUpdated', handleLocationUpdated);
      };
    }
  }, [socket, isConnected, jobId]);

  if (typeof initialLat !== 'number' || typeof initialLng !== 'number') {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-slate-100 rounded-2xl border border-slate-200">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin mb-2" />
        <p className="text-slate-500 font-medium">Waiting for location data...</p>
      </div>
    );
  }

  const visibleLocation = providerLocation || customerPosition;
  const mapDelta = 0.01;
  const openStreetMapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${visibleLocation.lng - mapDelta}%2C${visibleLocation.lat - mapDelta}%2C${visibleLocation.lng + mapDelta}%2C${visibleLocation.lat + mapDelta}&layer=mapnik&marker=${visibleLocation.lat}%2C${visibleLocation.lng}`;

  return (
    <div className="w-full h-[500px] rounded-2xl overflow-hidden shadow-lg border border-slate-200 relative">
      {googleMapsKey ? (
        <APIProvider apiKey={googleMapsKey}>
          <Map defaultZoom={15} center={mapCenter} mapId="careconnect_live_tracking" disableDefaultUI={true}>
            {providerLocation && <AdvancedMarker position={providerLocation}><Pin background="#0F5C5C" borderColor="#0d5454" glyphColor="#fff" /></AdvancedMarker>}
            {customerLocation && <AdvancedMarker position={customerLocation}><Pin background="#FF8A3D" borderColor="#d96f2b" glyphColor="#fff" /></AdvancedMarker>}
          </Map>
        </APIProvider>
      ) : (
        <iframe title="Live service location map" src={openStreetMapUrl} className="h-full w-full border-0" loading="lazy" />
      )}
      
      {!isConnected && (
        <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md animate-pulse">
          Reconnecting to live tracking...
        </div>
      )}
    </div>
  );
};

export default LiveMap;
