import { useEffect, useState } from 'react';
import Geolocation, { GeoCoordinates } from 'react-native-geolocation-service';
import { requestLocationPermission } from './androidPermission';

export const useCurrentLocation = () => {
  const [location, setLocation] = useState<null | GeoCoordinates>(null);

  useEffect(() => {
    (async () => {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) return;

      Geolocation.getCurrentPosition(
        pos => setLocation(pos.coords),
        err => console.warn('❌ 위치 에러:', err),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    })();
  }, []);

  return location;
};
