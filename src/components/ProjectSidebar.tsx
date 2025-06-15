
import { useState } from "react";
import { Calendar, Plus, MapPin, Clock, User, Phone } from "lucide-react";
import { format } from "date-fns";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddProjectDialog } from "@/components/AddProjectDialog";
import { Project } from "@/types/project";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProjectSidebarProps {
  projects: Project[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onAddProject: (project: Omit<Project, 'id'>) => void;
  onUpdateProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
}

export const ProjectSidebar = ({
  projects,
  selectedDate,
  onDateChange,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
}: ProjectSidebarProps) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const isMobile = useIsMobile();

  // Fix the date filtering logic
  const todaysProjects = projects.filter(project => {
    const projectDate = new Date(project.scheduledDate);
    const selected = new Date(selectedDate);
    
    // Compare just the date parts (year, month, day) - normalize to avoid timezone issues
    const projectDateString = projectDate.toISOString().split('T')[0];
    const selectedDateString = selected.toISOString().split('T')[0];
    
    console.log("Filtering project:", project.title, "Project date:", projectDateString, "Selected date:", selectedDateString, "Match:", projectDateString === selectedDateString);
    
    return projectDateString === selectedDateString;
  });

  console.log("Sidebar - Total projects:", projects.length);
  console.log("Sidebar - Selected date:", selectedDate.toISOString().split('T')[0]);
  console.log("Sidebar - Filtered projects for selected date:", todaysProjects.length, todaysProjects.map(p => ({ title: p.title, date: p.scheduledDate })));

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'in-progress': return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case 'completed': return 'bg-green-500/10 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-500/10 text-red-700 border-red-200';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  return (
    <>
      <Sidebar className={isMobile ? "w-full" : "w-80"}>
        <SidebarHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Project Tracker</h2>
            <Button 
              size="sm" 
              onClick={() => setShowAddDialog(true)}
              className="h-8 w-8 p-0 md:h-auto md:w-auto md:px-3"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden md:inline ml-2">Add Project</span>
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
            <Calendar className="h-4 w-4" />
            {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </div>
        </SidebarHeader>

        <SidebarContent className="p-4 space-y-4 overflow-y-auto">
          {todaysProjects.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <MapPin className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  No projects scheduled for this date
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowAddDialog(true)}
                  className="mt-3"
                >
                  Add First Project
                </Button>
              </CardContent>
            </Card>
          ) : (
            todaysProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-sm font-medium truncate pr-2">
                      {project.title}
                    </CardTitle>
                    <Badge variant="outline" className={`text-xs ${getStatusColor(project.status)}`}>
                      {project.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{project.clientName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{project.clientPhone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{project.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 flex-shrink-0" />
                    <span>{format(new Date(`2000-01-01T${project.time}`), "h:mm a")}</span>
                  </div>
                  {project.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
                      {project.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </SidebarContent>

        {!isMobile && (
          <SidebarFooter className="p-4 border-t">
            <div className="text-center text-xs text-muted-foreground">
              {projects.length} total project{projects.length !== 1 ? 's' : ''}
            </div>
          </SidebarFooter>
        )}
      </Sidebar>

      <AddProjectDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAddProject={onAddProject}
        selectedDate={selectedDate}
      />
    </>
  );
};
