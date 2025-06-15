
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Project } from "@/types/project";
import { format } from "date-fns";
import { Calendar, Clock, User, Phone, MapPin, Share2, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProjectDetailsDialogProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
}

export const ProjectDetailsDialog = ({
  project,
  open,
  onOpenChange,
  onUpdateProject,
  onDeleteProject,
}: ProjectDetailsDialogProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState<Project>(project);
  const { toast } = useToast();
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

  const handleSave = () => {
    onUpdateProject(editedProject);
    setIsEditing(false);
    toast({
      title: "Project updated",
      description: "Project details have been saved successfully",
    });
  };

  const handleCancel = () => {
    setEditedProject(project);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDeleteProject(project.id);
    onOpenChange(false);
    toast({
      title: "Project deleted",
      description: "Project has been removed successfully",
    });
  };

  const handleShare = () => {
    const projectDetails = `
Project: ${project.title}
Client: ${project.clientName}
Phone: ${project.clientPhone}
Address: ${project.address}
Date: ${format(new Date(project.scheduledDate), "MMM d, yyyy")}
Time: ${format(new Date(`2000-01-01T${project.time}`), "h:mm a")}
Status: ${project.status}
${project.description ? `Notes: ${project.description}` : ''}
    `.trim();

    if (navigator.share && isMobile) {
      navigator.share({
        title: `Project: ${project.title}`,
        text: projectDetails,
      });
    } else {
      navigator.clipboard.writeText(projectDetails);
      toast({
        title: "Project details copied",
        description: "Project information has been copied to clipboard for sharing",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{isEditing ? 'Edit Project' : 'Project Details'}</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {isEditing ? (
            <>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Project Title</Label>
                  <Input
                    id="title"
                    value={editedProject.title}
                    onChange={(e) => setEditedProject({ ...editedProject, title: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clientName">Client Name</Label>
                    <Input
                      id="clientName"
                      value={editedProject.clientName}
                      onChange={(e) => setEditedProject({ ...editedProject, clientName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientPhone">Client Phone</Label>
                    <Input
                      id="clientPhone"
                      value={editedProject.clientPhone}
                      onChange={(e) => setEditedProject({ ...editedProject, clientPhone: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={editedProject.address}
                    onChange={(e) => setEditedProject({ ...editedProject, address: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={editedProject.scheduledDate}
                      onChange={(e) => setEditedProject({ ...editedProject, scheduledDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={editedProject.time}
                      onChange={(e) => setEditedProject({ ...editedProject, time: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={editedProject.status}
                    onValueChange={(value: Project['status']) => 
                      setEditedProject({ ...editedProject, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editedProject.description}
                    onChange={(e) => setEditedProject({ ...editedProject, description: e.target.value })}
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  Save Changes
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{project.title}</h3>
                  <Badge variant="outline" className={`${getStatusColor(project.status).replace('bg-', 'border-').replace('-500', '-200')} mt-2`}>
                    {project.status}
                  </Badge>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Client</p>
                      <p className="text-sm text-muted-foreground">{project.clientName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <a 
                        href={`tel:${project.clientPhone}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {project.clientPhone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Date</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(project.scheduledDate), "EEEE, MMMM d, yyyy")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Time</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(`2000-01-01T${project.time}`), "h:mm a")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Address</p>
                    <p className="text-sm text-muted-foreground">{project.address}</p>
                  </div>
                </div>

                {project.description && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium mb-2">Notes</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {project.description}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
