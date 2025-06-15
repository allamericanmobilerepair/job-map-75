
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MapSetupProps {
  googleMapsApiKey: string;
  onApiKeyChange: (key: string) => void;
}

export const MapSetup = ({ googleMapsApiKey, onApiKeyChange }: MapSetupProps) => {
  return (
    <div className="h-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>Setup Required</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="google-maps-key">Google Maps API Key</Label>
            <Input
              id="google-maps-key"
              type="text"
              placeholder="AIzaSyC..."
              value={googleMapsApiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            <p>To display the map, you need a Google Maps API key.</p>
            <p>Get yours at <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a></p>
            <p className="mt-2 text-xs">Enable the "Maps JavaScript API" in your Google Cloud project.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
