
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/types/project";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProjectDetailsPopupProps {
  project: Project;
  onClose: () => void;
}

export const ProjectDetailsPopup = ({ project, onClose }: ProjectDetailsPopupProps) => {
  const isMobile = useIsMobile();

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
    const today = new Date();
    return projectDate.toDateString() === today.toDateString();
  };

  return (
    <div className={`absolute ${
      isMobile 
        ? 'bottom-0 left-0 right-0 rounded-t-lg' 
        : 'top-4 left-4 w-80'
    } z-40`}>
      <Card className={isMobile ? 'border-t border-x-0 border-b-0 rounded-t-lg' : ''}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-sm font-medium">
              {project.title}
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">Client:</span>
            <span>{project.clientName}</span>
          </div>
          {project.clientPhone && (
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Phone:</span>
              <a 
                href={`tel:${project.clientPhone}`}
                className="text-blue-600 hover:underline"
              >
                {project.clientPhone}
              </a>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">Date:</span>
            <span>{format(new Date(project.scheduledDate), "MMM d, yyyy")}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">Time:</span>
            <span>{format(new Date(`2000-01-01T${project.time}`), "h:mm a")}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">Address:</span>
            <span className="text-xs">{project.address}</span>
          </div>
          {project.description && (
            <div className="text-sm">
              <span className="font-medium">Notes:</span>
              <p className="text-xs text-muted-foreground mt-1">
                {project.description}
              </p>
            </div>
          )}
          <div className="flex items-center gap-2 pt-2">
            <Badge variant="outline" className={getStatusColor(project.status).replace('bg-', 'border-').replace('-500', '-200')}>
              {project.status}
            </Badge>
            {isToday(project) && (
              <Badge variant="outline" className="border-red-200 text-red-700">
                Today
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
