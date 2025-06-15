
import { useEffect, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { Project } from "@/types/project";

interface GoogleMapProps {
  googleMapsApiKey: string;
  userLocation: {lat: number, lng: number} | null;
  projects: Project[];
  onProjectClick: (project: Project) => void;
  onMapInitialized: (initialized: boolean) => void;
}

export const GoogleMap = ({ 
  googleMapsApiKey, 
  userLocation, 
  projects, 
  onProjectClick,
  onMapInitialized 
}: GoogleMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);

  const getMarkerColor = (status: Project['status']) => {
    switch (status) {
      case 'scheduled': return '#3b82f6';
      case 'in-progress': return '#eab308';
      case 'completed': return '#22c55e';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Initialize Google Maps
  useEffect(() => {
    if (!mapContainer.current || !googleMapsApiKey || !userLocation) return;

    const loader = new Loader({
      apiKey: googleMapsApiKey,
      version: "weekly",
    });

    loader.load().then(() => {
      if (!mapContainer.current || !window.google) return;

      map.current = new window.google.maps.Map(mapContainer.current, {
        center: { lat: userLocation.lat, lng: userLocation.lng },
        zoom: 12,
      });

      onMapInitialized(true);

      // Add user location marker
      new window.google.maps.Marker({
        position: { lat: userLocation.lat, lng: userLocation.lng },
        map: map.current,
        title: "Your Location",
        icon: {
          url: 'data:image/svg+xml;base64,' + btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#3b82f6">
              <circle cx="12" cy="12" r="8"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(24, 24),
        }
      });

      // Add project markers
      projects.forEach((project) => {
        const marker = new window.google.maps.Marker({
          position: { lat: project.latitude, lng: project.longitude },
          map: map.current,
          title: project.title,
          icon: {
            url: 'data:image/svg+xml;base64,' + btoa(`
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${getMarkerColor(project.status)}">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(24, 24),
          }
        });

        marker.addListener('click', () => {
          onProjectClick(project);
        });
      });
    }).catch((error) => {
      console.error("Error loading Google Maps:", error);
    });

    return () => {
      map.current = null;
    };
  }, [googleMapsApiKey, userLocation, projects, onProjectClick, onMapInitialized]);

  return <div ref={mapContainer} className="w-full h-full" />;
};
