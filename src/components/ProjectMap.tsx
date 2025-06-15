
import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/types/project";
import { useIsMobile } from "@/hooks/use-mobile";
import { format } from "date-fns";

interface ProjectMapProps {
  projects: Project[];
  selectedDate: Date;
  onUpdateProject: (project: Project) => void;
}

export const ProjectMap = ({ projects, selectedDate, onUpdateProject }: ProjectMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const isMobile = useIsMobile();

  const todaysProjects = projects.filter(project => {
    const projectDate = new Date(project.scheduledDate);
    return projectDate.toDateString() === selectedDate.toDateString();
  });

  // Show all projects on map, but highlight today's projects
  const allProjects = projects;

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
          // Default to a central location if geolocation fails
          setUserLocation({ lat: 40.7128, lng: -74.0060 }); // New York
        }
      );
    }
  }, []);

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500';
      case 'in-progress': return 'bg-yellow-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
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
      // You could add a toast notification here
    }
  };

  return (
    <div className="h-full relative bg-gray-50">
      {/* Map placeholder - in a real app, this would be a proper map */}
      <div 
        ref={mapContainer} 
        className="w-full h-full bg-gradient-to-br from-blue-50 to-green-50 relative overflow-hidden"
      >
        {/* Map markers for all projects */}
        {allProjects.map((project, index) => {
          const isTodaysProject = isToday(project);
          return (
            <div
              key={project.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all hover:scale-110 ${
                isMobile ? 'active:scale-95' : ''
              } ${isTodaysProject ? 'z-20' : 'z-10'}`}
              style={{
                left: `${20 + (index * 12) % 65}%`,
                top: `${25 + (index * 15) % 50}%`,
              }}
              onClick={() => setSelectedProject(project)}
            >
              <div className={`w-6 h-6 ${getStatusColor(project.status)} rounded-full border-2 ${
                isTodaysProject ? 'border-white shadow-lg' : 'border-gray-300 opacity-70'
              } flex items-center justify-center`}>
                <MapPin className="w-3 h-3 text-white" />
              </div>
              <div className={`absolute top-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-sm text-xs whitespace-nowrap ${
                isTodaysProject ? 'font-medium' : 'opacity-70'
              }`}>
                {project.title}
              </div>
              {isTodaysProject && (
                <div className="absolute -top-2 -right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              )}
            </div>
          );
        })}

        {/* User location marker */}
        {userLocation && (
          <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-30"
            style={{ left: '50%', top: '50%' }}
          >
            <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg animate-pulse">
              <div className="w-8 h-8 bg-blue-600/20 rounded-full absolute -top-2 -left-2 animate-ping"></div>
            </div>
          </div>
        )}
      </div>

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

      {/* Project details popup - Mobile optimized */}
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
        <div className="absolute inset-0 flex items-center justify-center">
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
      <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg text-xs">
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
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span>Today's Projects</span>
          </div>
        </div>
      </div>
    </div>
  );
};
