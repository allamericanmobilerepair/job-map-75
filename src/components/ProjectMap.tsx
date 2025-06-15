
import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Project } from "@/types/project";
import { useIsMobile } from "@/hooks/use-mobile";
import { format } from "date-fns";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface ProjectMapProps {
  projects: Project[];
  selectedDate: Date;
  onUpdateProject: (project: Project) => void;
  highlightedProjectId?: string | null;
}

export const ProjectMap = ({ projects, selectedDate, onUpdateProject, highlightedProjectId }: ProjectMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>("");
  const [mapInitialized, setMapInitialized] = useState(false);
  const isMobile = useIsMobile();

  const todaysProjects = projects.filter(project => {
    const projectDate = new Date(project.scheduledDate);
    return projectDate.toDateString() === selectedDate.toDateString();
  });

  // Show all projects on map, but highlight today's projects
  const allProjects = projects;

  // Auto-select highlighted project
  useEffect(() => {
    if (highlightedProjectId) {
      const highlightedProject = projects.find(p => p.id === highlightedProjectId);
      if (highlightedProject) {
        setSelectedProject(highlightedProject);
      }
    }
  }, [highlightedProjectId, projects]);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log("Location access denied:", error);
          // Default to New York if geolocation fails
          setUserLocation({ lat: 40.7128, lng: -74.0060 });
        }
      );
    }
  }, []);

  // Initialize Mapbox map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || !userLocation) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [userLocation.lng, userLocation.lat],
      zoom: 12
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      setMapInitialized(true);
      
      // Add user location marker
      new mapboxgl.Marker({ color: '#3b82f6' })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map.current!);

      // Add project markers
      allProjects.forEach((project) => {
        const marker = new mapboxgl.Marker({ 
          color: getMarkerColor(project.status)
        })
          .setLngLat([project.longitude, project.latitude])
          .addTo(map.current!);

        // Add click handler to marker
        marker.getElement().addEventListener('click', () => {
          setSelectedProject(project);
        });
      });
    });

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, userLocation, allProjects]);

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500';
      case 'in-progress': return 'bg-yellow-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getMarkerColor = (status: Project['status']) => {
    switch (status) {
      case 'scheduled': return '#3b82f6';
      case 'in-progress': return '#eab308';
      case 'completed': return '#22c55e';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const isToday = (project: Project) => {
    const projectDate = new Date(project.scheduledDate);
    return projectDate.toDateString() === selectedDate.toDateString();
  };

  const generateItinerary = () => {
    const sortedProjects = [...todaysProjects].sort((a, b) => a.time.localeCompare(b.time));
    const itinerary = sortedProjects.map((project, index) => 
      `${index + 1}. ${format(new Date(`2000-01-01T${project.time}`), "h:mm a")} - ${project.title} (${project.clientName})\n   📍 ${project.address}`
    ).join('\n\n');
    
    const fullItinerary = `Daily Itinerary - ${format(selectedDate, "MMMM d, yyyy")}\n\n${itinerary}`;
    
    if (navigator.share && isMobile) {
      navigator.share({
        title: 'Daily Itinerary',
        text: fullItinerary,
      });
    } else {
      navigator.clipboard.writeText(fullItinerary);
    }
  };

  if (!mapboxToken) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle>Setup Required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mapbox-token">Mapbox Public Token</Label>
              <Input
                id="mapbox-token"
                type="text"
                placeholder="pk.eyJ1IjoieW91cnVzZXJuYW1lIi..."
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p>To display the map, you need a Mapbox public token.</p>
              <p>Get yours at <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">mapbox.com</a></p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full relative">
      {/* Mapbox container */}
      <div 
        ref={mapContainer} 
        className="w-full h-full"
      />

      {/* Mobile controls */}
      {isMobile && todaysProjects.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4">
          <Button 
            onClick={generateItinerary}
            className="w-full"
            size="lg"
          >
            <Navigation className="w-4 h-4 mr-2" />
            Generate Today's Itinerary ({todaysProjects.length})
          </Button>
        </div>
      )}

      {/* Desktop controls */}
      {!isMobile && todaysProjects.length > 0 && (
        <div className="absolute top-4 right-4">
          <Button onClick={generateItinerary}>
            <Navigation className="w-4 h-4 mr-2" />
            Generate Itinerary ({todaysProjects.length})
          </Button>
        </div>
      )}

      {/* Project details popup */}
      {selectedProject && (
        <div className={`absolute ${
          isMobile 
            ? 'bottom-0 left-0 right-0 rounded-t-lg' 
            : 'top-4 left-4 w-80'
        } z-40`}>
          <Card className={isMobile ? 'border-t border-x-0 border-b-0 rounded-t-lg' : ''}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-sm font-medium">
                  {selectedProject.title}
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedProject(null)}
                  className="h-6 w-6 p-0"
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Client:</span>
                <span>{selectedProject.clientName}</span>
              </div>
              {selectedProject.clientPhone && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Phone:</span>
                  <a 
                    href={`tel:${selectedProject.clientPhone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {selectedProject.clientPhone}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Date:</span>
                <span>{format(new Date(selectedProject.scheduledDate), "MMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Time:</span>
                <span>{format(new Date(`2000-01-01T${selectedProject.time}`), "h:mm a")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Address:</span>
                <span className="text-xs">{selectedProject.address}</span>
              </div>
              {selectedProject.description && (
                <div className="text-sm">
                  <span className="font-medium">Notes:</span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedProject.description}
                  </p>
                </div>
              )}
              <div className="flex items-center gap-2 pt-2">
                <Badge variant="outline" className={getStatusColor(selectedProject.status).replace('bg-', 'border-').replace('-500', '-200')}>
                  {selectedProject.status}
                </Badge>
                {isToday(selectedProject) && (
                  <Badge variant="outline" className="border-red-200 text-red-700">
                    Today
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty state */}
      {allProjects.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center space-y-4">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto" />
            <div className="space-y-2">
              <h3 className="text-lg font-medium">No projects yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Add your first project to see it appear on the map
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Map legend */}
      <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg text-xs z-30">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Scheduled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <span>Your Location</span>
          </div>
        </div>
      </div>
    </div>
  );
};
