
declare global {
  interface Window {
    google: typeof google;
  }
}

declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: Element, opts?: MapOptions);
    }
    
    class Marker {
      constructor(opts?: MarkerOptions);
      addListener(eventName: string, handler: Function): void;
    }
    
    class Size {
      constructor(width: number, height: number);
    }
    
    interface MapOptions {
      center?: LatLngLiteral;
      zoom?: number;
    }
    
    interface MarkerOptions {
      position?: LatLngLiteral;
      map?: Map;
      title?: string;
      icon?: MarkerIcon;
    }
    
    interface LatLngLiteral {
      lat: number;
      lng: number;
    }
    
    interface MarkerIcon {
      url?: string;
      scaledSize?: Size;
    }
  }
}

export {};
