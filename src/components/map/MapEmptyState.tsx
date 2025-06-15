
import { MapPin } from "lucide-react";

export const MapEmptyState = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="text-center space-y-4">
        <MapPin className="h-12 w-12 text-muted-foreground mx-auto" />
        <div className="space-y-2">
          <h3 className="text-lg font-medium">No projects yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Add your first project to see it appear on the map
          </p>
        </div>
      </div>
    </div>
  );
};
