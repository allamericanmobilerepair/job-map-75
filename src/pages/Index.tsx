
import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ProjectMap } from "@/components/ProjectMap";
import { ProjectSidebar } from "@/components/ProjectSidebar";
import { MobileHeader } from "@/components/MobileHeader";
import { useIsMobile } from "@/hooks/use-mobile";
import { Project } from "@/types/project";

const Index = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [highlightedProjectId, setHighlightedProjectId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const addProject = (project: Omit<Project, 'id'>) => {
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
    };
    setProjects(prev => [...prev, newProject]);
    
    // Highlight the new project on the map
    setHighlightedProjectId(newProject.id);
    
    // Clear highlight after 3 seconds
    setTimeout(() => {
      setHighlightedProjectId(null);
    }, 3000);
    
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const updateProject = (updatedProject: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <div className="min-h-screen flex w-full bg-background">
        <ProjectSidebar 
          projects={projects}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onAddProject={addProject}
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
