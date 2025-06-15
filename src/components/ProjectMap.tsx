import { useEffect, useState } from "react";
import { Project } from "@/types/project";
import { GoogleMap } from "./map/GoogleMap";
import { ProjectDetailsPopup } from "./map/ProjectDetailsPopup";
import { MapControls } from "./map/MapControls";
import { MapLegend } from "./map/MapLegend";
import { MapEmptyState } from "./map/MapEmptyState";

interface ProjectMapProps {
  projects: Project[];
  selectedDate: Date;
  onUpdateProject: (project: Project) => void;
  highlightedProjectId?: string | null;
}

export const ProjectMap = ({ projects, selectedDate, onUpdateProject, highlightedProjectId }: ProjectMapProps) => {
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [googleMapsApiKey] = useState<string>("AIzaSyBFJG5pXmi0M-mcUFEAMZkKkJUuCjD4DSU");
  const [mapInitialized, setMapInitialized] = useState(false);

  const todaysProjects = projects.filter(project => {
    const projectDate = new Date(project.scheduledDate);
    return projectDate.toDateString() === selectedDate.toDateString();
  });

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

  return (
    <div className="h-full relative">
      <GoogleMap
        googleMapsApiKey={googleMapsApiKey}
        userLocation={userLocation}
        projects={projects}
        onProjectClick={setSelectedProject}
        onMapInitialized={setMapInitialized}
      />

      <MapControls todaysProjects={todaysProjects} selectedDate={selectedDate} />

      {selectedProject && (
        <ProjectDetailsPopup
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}

      {projects.length === 0 && <MapEmptyState />}

      <MapLegend />
    </div>
  );
};
