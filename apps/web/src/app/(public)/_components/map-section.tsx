'use client';

import { APIProvider, Map, Marker, useMap } from '@vis.gl/react-google-maps';
import { Button } from '@/components/ui/button';
import { MapPin, LocateFixed, Home, Navigation } from 'lucide-react';
import { toast } from 'sonner';
const storePosition = { lat: 53.344356, lng: -6.267543 };
const storeAddress = '52 Dame Street, Dublin 2, D02 YD29, Ireland';

const MapControls = () => {
  const map = useMap();

  // This function now re-centers the map on the store's location
  const handleCenterOnStore = () => {
    if (!map) return;
    map.panTo(storePosition);
    map.setZoom(15);
  };

  const handleNavigate = () => {
    // Corrected Google Maps navigation URL
    const navigationUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(storeAddress)}`;
    window.open(navigationUrl, '_blank');
  };

  const handleLocate = () => {
    if (!map) return; // 确保地图已加载

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userPosition = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          // 3. 关键修复：使用 map.panTo() 实现平滑移动
          map.panTo(userPosition);
          map.setZoom(16);
        },
        () => {
          // 4. 添加错误处理
          toast.error('Unable to retrieve your location. Please check your browser permissions.');
        },
      );
    } else {
      toast.error('Geolocation is not supported by your browser.');
    }
  };

  return (
    <>
      <Marker position={storePosition} />

      <div className="absolute top-4 right-4 flex flex-col gap-3 z-10">
        <Button
          size="icon"
          onClick={handleCenterOnStore}
          className="rounded-full shadow-md"
          aria-label="Center on Salon"
        >
          <Home className="h-5 w-5" />
        </Button>
        <Button size="icon" onClick={handleLocate} className="rounded-full shadow-md" aria-label="Locate Me">
          <LocateFixed className="h-5 w-5" />
        </Button>
        <Button size="icon" onClick={handleNavigate} className="rounded-full shadow-md" aria-label="Navigate to Salon">
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
              defaultCenter={storePosition}
              defaultZoom={15}
              gestureHandling={'greedy'}
              disableDefaultUI={true}
              mapId="nail_salon_map"
            >
              <MapControls />
            </Map>
          </div>
        </div>
      </section>
    </APIProvider>
  );
};
