'use client';

import { APIProvider, Map, Marker, useMap } from '@vis.gl/react-google-maps';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, LocateFixed, Navigation } from 'lucide-react';

const storePosition = { lat: 53.344356, lng: -6.267543 };
const storeAddress = '52 Dame Street, Dublin 2, D02 YD29, Ireland';

// 1. Create a new child component for the map's content
const MapContent = () => {
  // 2. Use the useMap() hook to get the map instance
  const map = useMap();

  // 3. Use useEffect to ensure the ref is set when the map is ready
  useEffect(() => {
    if (map) {
      // You can now interact with the map instance if needed,
      // though for Marker and default props, it's often not necessary.
    }
  }, [map]);

  const handleLocate = () => {
    if (navigator.geolocation && map) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const userPosition = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        map.setCenter(userPosition);
        map.setZoom(16);
      });
    }
  };

  const handleNavigate = () => {
    const navigationUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(storeAddress)}`;
    window.open(navigationUrl, '_blank');
  };

  return (
    <>
      <Marker position={storePosition} />

      {/* Buttons are now inside the component that has access to the map instance */}
      <div className="absolute top-4 right-4 flex flex-col gap-3 z-10">
        <Button size="icon" onClick={handleLocate} className="rounded-full shadow-md" aria-label="Locate Me">
          <LocateFixed className="h-5 w-5" />
        </Button>
        <Button size="icon" onClick={handleNavigate} className="rounded-full shadow-md" aria-label="Navigate to Shop">
          <Navigation className="h-5 w-5" />
        </Button>
      </div>
    </>
  );
};

export const MapSection = () => {
  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto text-center">
          <MapPin className="mx-auto h-10 w-10 text-pink-500 mb-4" />
          <h2 className="text-3xl font-bold mb-2">Find Us</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">{storeAddress}</p>

          <div className="relative h-[450px] w-full rounded-lg overflow-hidden shadow-lg">
            <Map
              // 4. The ref prop is removed from here
              defaultCenter={storePosition}
              defaultZoom={15}
              gestureHandling={'greedy'}
              disableDefaultUI={true}
              mapId="nail_salon_map"
            >
              {/* 5. The content is now rendered as a child component */}
              <MapContent />
            </Map>
          </div>
        </div>
      </section>
    </APIProvider>
  );
};
