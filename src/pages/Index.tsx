import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ProjectMap } from "@/components/ProjectMap";
import { ProjectSidebar } from "@/components/ProjectSidebar";
import { MobileHeader } from "@/components/MobileHeader";
import { useIsMobile } from "@/hooks/use-mobile";
import { Project } from "@/types/project";

const Index = () => {
  // Initialize with dummy projects - one older project and three recent ones
  const [projects, setProjects] = useState<Project[]>([
    {
      id: "1",
      title: "Kitchen Renovation",
      clientName: "Sarah Johnson",
      clientPhone: "(555) 123-4567",
      address: "123 Oak Street, Downtown, NY 10001",
      scheduledDate: new Date().toISOString().split('T')[0], // Today
      time: "09:00",
      description: "Complete kitchen remodel including new cabinets, countertops, and appliances. Client wants modern farmhouse style.",
      status: "scheduled",
      latitude: 40.7128,
      longitude: -74.0060
    },
    {
      id: "2",
      title: "Bathroom Upgrade",
      clientName: "Mike Rodriguez",
      clientPhone: "(555) 987-6543",
      address: "456 Pine Avenue, Midtown, NY 10002",
      scheduledDate: new Date().toISOString().split('T')[0], // Today
      time: "14:30",
      description: "Master bathroom renovation with walk-in shower and double vanity.",
      status: "in-progress",
      latitude: 40.7589,
      longitude: -73.9851
    },
    {
      id: "3",
      title: "Deck Installation",
      clientName: "Emily Chen",
      clientPhone: "(555) 246-8135",
      address: "789 Maple Drive, Uptown, NY 10003",
      scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
      time: "10:00",
      description: "Build new composite deck with railings and built-in seating area.",
      status: "scheduled",
      latitude: 40.7831,
      longitude: -73.9712
    },
    {
      id: "4",
      title: "Foundation Repair",
      clientName: "Robert Thompson",
      clientPhone: "(555) 555-0123",
      address: "987 Elm Street, Queens, NY 11101",
      scheduledDate: new Date(Date.now() - 604800000).toISOString().split('T')[0], // One week ago
      time: "08:30",
      description: "Basement foundation crack repair and waterproofing. Long-term client with ongoing maintenance needs.",
      status: "completed",
      latitude: 40.7282,
      longitude: -73.7949
    }
  ]);
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
