
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
  const markers = useRef<any[]>([]);
  const mapLoaded = useRef(false);

  console.log("GoogleMap render - Projects:", projects.length, projects);
  console.log("GoogleMap render - UserLocation:", userLocation);
  console.log("GoogleMap render - MapLoaded:", mapLoaded.current);

  const getMarkerColor = (status: Project['status']) => {
    switch (status) {
      case 'scheduled': return '#3b82f6';
      case 'in-progress': return '#eab308';
      case 'completed': return '#22c55e';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Initialize Google Maps only once
  useEffect(() => {
    console.log("Map initialization effect - Checking conditions:", {
      hasContainer: !!mapContainer.current,
      hasApiKey: !!googleMapsApiKey,
      hasUserLocation: !!userLocation,
      mapAlreadyLoaded: mapLoaded.current
    });

    if (!mapContainer.current || !googleMapsApiKey || !userLocation || mapLoaded.current) return;

    console.log("Starting Google Maps initialization...");

    const loader = new Loader({
      apiKey: googleMapsApiKey,
      version: "weekly",
    });

    loader.load().then(() => {
      console.log("Google Maps API loaded successfully");
      if (!mapContainer.current || !window.google) {
        console.error("Map container or Google Maps API not available after loading");
        return;
      }

      map.current = new window.google.maps.Map(mapContainer.current, {
        center: { lat: userLocation.lat, lng: userLocation.lng },
        zoom: 12,
      });

      console.log("Map created successfully");
      mapLoaded.current = true;
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
      console.log("User location marker added");
    }).catch((error) => {
      console.error("Error loading Google Maps:", error);
    });
  }, [googleMapsApiKey, userLocation, onMapInitialized]);

  // Update markers when projects change
  useEffect(() => {
    console.log("Markers effect - Checking conditions:", {
      hasMap: !!map.current,
      mapLoaded: mapLoaded.current,
      projectsCount: projects.length
    });

    if (!map.current || !mapLoaded.current) {
      console.log("Map not ready for markers yet");
      return;
    }

    console.log("Clearing existing markers:", markers.current.length);
    // Clear existing project markers
    markers.current.forEach(marker => marker.setMap(null));
    markers.current = [];

    console.log("Adding new project markers for", projects.length, "projects");
    // Add new project markers
    projects.forEach((project, index) => {
      console.log(`Adding marker ${index + 1}:`, project.title, `(${project.latitude}, ${project.longitude})`);
      
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

      markers.current.push(marker);
    });
    
    console.log("Finished adding markers. Total markers:", markers.current.length);
  }, [projects, onProjectClick]);

  return <div ref={mapContainer} className="w-full h-full" />;
};
