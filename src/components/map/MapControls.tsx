
import { Button } from "@/components/ui/button";
import { Navigation } from "lucide-react";
import { Project } from "@/types/project";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

interface MapControlsProps {
  todaysProjects: Project[];
  selectedDate: Date;
}

export const MapControls = ({ todaysProjects, selectedDate }: MapControlsProps) => {
  const isMobile = useIsMobile();

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

  if (todaysProjects.length === 0) return null;

  return (
    <>
      {/* Mobile controls */}
      {isMobile && (
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
      {!isMobile && (
        <div className="absolute top-4 right-4">
          <Button onClick={generateItinerary}>
            <Navigation className="w-4 h-4 mr-2" />
            Generate Itinerary ({todaysProjects.length})
          </Button>
        </div>
      )}
    </>
  );
};
