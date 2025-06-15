import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Project } from "@/types/project";
import { useIsMobile } from "@/hooks/use-mobile";
import { format } from "date-fns";

interface AddProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddProject: (project: Omit<Project, 'id'>) => void;
  selectedDate: Date;
}

const FORM_DATA_KEY = 'addProjectFormData';

export const AddProjectDialog = ({ open, onOpenChange, onAddProject, selectedDate }: AddProjectDialogProps) => {
  const [formData, setFormData] = useState({
    title: '',
    clientName: '',
    clientPhone: '',
    address: '',
    time: '',
    description: '',
    status: 'scheduled' as Project['status'],
  });
  const isMobile = useIsMobile();

  // Load saved form data when dialog opens
  useEffect(() => {
    if (open) {
      const savedData = localStorage.getItem(FORM_DATA_KEY);
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          setFormData(parsedData);
        } catch (error) {
          console.log('Error loading saved form data:', error);
        }
      }
    }
  }, [open]);

  // Auto-save form data whenever it changes
  useEffect(() => {
    if (open) {
      localStorage.setItem(FORM_DATA_KEY, JSON.stringify(formData));
    }
  }, [formData, open]);

  const clearSavedData = () => {
    localStorage.removeItem(FORM_DATA_KEY);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.clientName || !formData.address) {
      return;
    }

    // Generate random coordinates for now (in a real app, you'd geocode the address)
    const latitude = 40.7128 + (Math.random() - 0.5) * 0.1;
    const longitude = -74.0060 + (Math.random() - 0.5) * 0.1;

    onAddProject({
      ...formData,
      scheduledDate: format(selectedDate, 'yyyy-MM-dd'),
      latitude,
      longitude,
    });

    setFormData({
      title: '',
      clientName: '',
      clientPhone: '',
      address: '',
      time: '',
      description: '',
      status: 'scheduled',
    });
    clearSavedData();
    onOpenChange(false);
  };

  const handleCancel = () => {
    // Keep the saved data when canceling
    onOpenChange(false);
  };

  const handleClearForm = () => {
    setFormData({
      title: '',
      clientName: '',
      clientPhone: '',
      address: '',
      time: '',
      description: '',
      status: 'scheduled',
    });
    clearSavedData();
  };

  const form = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Project Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Kitchen renovation"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="clientName">Client Name *</Label>
        <Input
          id="clientName"
          value={formData.clientName}
          onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
          placeholder="John Smith"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="clientPhone">Phone Number</Label>
        <Input
          id="clientPhone"
          type="tel"
          value={formData.clientPhone}
          onChange={(e) => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
          placeholder="(555) 123-4567"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="time">Time <span className="text-sm text-muted-foreground">(optional for ongoing projects)</span></Label>
        <Input
          id="time"
          type="time"
          value={formData.time}
          onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
          placeholder="Leave empty for ongoing projects"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address *</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
          placeholder="123 Main St, City, State 12345"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={formData.status} onValueChange={(value: Project['status']) => setFormData(prev => ({ ...prev, status: value }))}>
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

      <div className="space-y-2">
        <Label htmlFor="description">Notes</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Additional project details..."
          rows={3}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="button" variant="ghost" onClick={handleClearForm} className="text-sm">
          Clear
        </Button>
        <Button type="submit" className="flex-1">
          Add Project
        </Button>
      </div>
    </form>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="px-4">
            <DrawerTitle>Add New Project</DrawerTitle>
            <p className="text-sm text-muted-foreground">
              Scheduled for {format(selectedDate, "MMMM d, yyyy")}
            </p>
          </DrawerHeader>
          <ScrollArea className="flex-1 px-4 pb-8">
            {form}
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add New Project</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Scheduled for {format(selectedDate, "MMMM d, yyyy")}
          </p>
        </DialogHeader>
        <ScrollArea className="flex-1 mt-4">
          <div className="pr-4">
            {form}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
