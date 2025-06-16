
import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ProjectMap } from "@/components/ProjectMap";
import { ProjectSidebar } from "@/components/ProjectSidebar";
import { MobileHeader } from "@/components/MobileHeader";
import { UserMenu } from "@/components/UserMenu";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProjects } from "@/hooks/useProjects";
import { Project } from "@/types/project";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [highlightedProjectId, setHighlightedProjectId] = useState<string | null>(null);
  const isMobile = useIsMobile();
  
  const { projects, loading, addProject, updateProject, deleteProject } = useProjects();

  const handleAddProject = async (project: Omit<Project, 'id'>) => {
    try {
      const newProject = await addProject(project);
      
      // Highlight the new project on the map
      setHighlightedProjectId(newProject.id);
      
      // Clear highlight after 3 seconds
      setTimeout(() => {
        setHighlightedProjectId(null);
      }, 3000);
      
      if (isMobile) {
        setSidebarOpen(false);
      }
    } catch (error) {
      console.error('Failed to add project:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <div className="min-h-screen flex w-full bg-background">
        <ProjectSidebar 
          projects={projects}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onAddProject={handleAddProject}
          onUpdateProject={updateProject}
          onDeleteProject={deleteProject}
        />
        <main className="flex-1 flex flex-col overflow-hidden">
          {isMobile && (
            <MobileHeader 
              selectedDate={selectedDate}
              onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              projectCount={projects.length}
            />
          )}
          {!isMobile && (
            <div className="flex justify-end p-4">
              <UserMenu />
            </div>
          )}
          <div className="flex-1 relative">
            <ProjectMap 
              projects={projects}
              selectedDate={selectedDate}
              onUpdateProject={updateProject}
              highlightedProjectId={highlightedProjectId}
            />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
