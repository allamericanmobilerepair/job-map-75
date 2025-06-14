
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";

interface MobileHeaderProps {
  selectedDate: Date;
  onToggleSidebar: () => void;
  projectCount: number;
}

export const MobileHeader = ({ selectedDate, onToggleSidebar, projectCount }: MobileHeaderProps) => {
  return (
    <div className="bg-background border-b border-border p-4 flex items-center justify-between md:hidden">
      <div className="flex items-center gap-3">
        <SidebarTrigger onClick={onToggleSidebar} />
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Calendar className="h-4 w-4" />
            {format(selectedDate, "MMM d, yyyy")}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {projectCount} project{projectCount !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </div>
  );
};
