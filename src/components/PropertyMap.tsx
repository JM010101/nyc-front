import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Property } from '../types';
import { propertyService } from '../services/api';

interface PropertyMapProps {
  property: Property | null;
  className?: string;
}

export const PropertyMap = ({ property, className = '' }: PropertyMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

    if (!mapboxgl.accessToken) {
      console.warn('Mapbox token not found. Set VITE_MAPBOX_TOKEN in .env');
      return;
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-74.006, 40.7128], // Default to NYC
      zoom: 12,
    });

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!map.current || !mapLoaded || !property) return;

    // Remove existing markers and layers
    const markers = document.querySelectorAll('.mapboxgl-marker');
    markers.forEach(marker => marker.remove());

    // Remove existing sources and layers
    if (map.current.getSource('property')) {
      map.current.removeLayer('property-fill');
      map.current.removeSource('property');
    }
    if (map.current.getSource('landmarks')) {
      map.current.removeLayer('landmarks-layer');
      map.current.removeSource('landmarks');
    }
    if (map.current.getSource('zoning')) {
      map.current.removeLayer('zoning-layer');
      map.current.removeSource('zoning');
    }

    // Fetch geometry data
    const loadGeometry = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/properties/${property.bbl}/nearby-geometry`);
        if (!response.ok) throw new Error('Failed to fetch geometry');
        
        const data = await response.json();
        
        // Set map center from property geometry
        if (data.property?.geometry) {
          const geom = JSON.parse(data.property.geometry);
          if (geom.type === 'Polygon' && geom.coordinates[0]) {
            // Calculate center from coordinates
            const coords = geom.coordinates[0];
            const lons = coords.map((c: number[]) => c[0]);
            const lats = coords.map((c: number[]) => c[1]);
            const center: [number, number] = [
              (Math.min(...lons) + Math.max(...lons)) / 2,
              (Math.min(...lats) + Math.max(...lats)) / 2,
            ];

            map.current!.flyTo({
              center,
              zoom: 16,
              duration: 1500,
            });

            // Add property polygon
            map.current!.addSource('property', {
              type: 'geojson',
              data: {
                type: 'Feature',
                geometry: geom,
              },
            });

            map.current!.addLayer({
              id: 'property-fill',
              type: 'fill',
              source: 'property',
              paint: {
                'fill-color': '#3B82F6',
                'fill-opacity': 0.3,
              },
            });

            map.current!.addLayer({
              id: 'property-outline',
              type: 'line',
              source: 'property',
              paint: {
                'line-color': '#3B82F6',
                'line-width': 2,
              },
            });

            // Add property marker at center
            new mapboxgl.Marker({ color: '#3B82F6' })
              .setLngLat(center)
              .setPopup(
                new mapboxgl.Popup({ offset: 25 })
                  .setHTML(`
                    <div class="p-2">
                      <h3 class="font-semibold">${property.address || property.bbl}</h3>
                      <p class="text-sm text-gray-600">BBL: ${property.bbl}</p>
                      <p class="text-sm text-gray-600">${property.borough}</p>
                    </div>
                  `)
              )
              .addTo(map.current!);
          }
        }

        // Add landmarks
        if (data.landmarks && data.landmarks.length > 0) {
          const landmarkFeatures = data.landmarks.map((lm: any) => ({
            type: 'Feature',
            geometry: JSON.parse(lm.geometry),
            properties: {
              name: lm.name,
              distance_feet: lm.distance_feet,
            },
          }));

          map.current!.addSource('landmarks', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: landmarkFeatures,
            },
          });

          map.current!.addLayer({
            id: 'landmarks-layer',
            type: 'circle',
            source: 'landmarks',
            paint: {
              'circle-color': '#F59E0B',
              'circle-radius': 8,
            },
          });

          // Add landmark markers
          data.landmarks.forEach((lm: any) => {
            const geom = JSON.parse(lm.geometry);
            if (geom.type === 'Point') {
              const coords: [number, number] = geom.coordinates;
              new mapboxgl.Marker({ color: '#F59E0B' })
                .setLngLat(coords)
                .setPopup(
                  new mapboxgl.Popup({ offset: 25 })
                    .setHTML(`
                      <div class="p-2">
                        <h3 class="font-semibold">${lm.name}</h3>
                        <p class="text-sm text-gray-600">${lm.distance_feet.toFixed(1)} ft away</p>
                      </div>
                    `)
                )
                .addTo(map.current!);
            }
          });
        }

        // Add zoning districts
        if (data.zoning_districts && data.zoning_districts.length > 0) {
          const zoningFeatures = data.zoning_districts.map((zd: any) => ({
            type: 'Feature',
            geometry: JSON.parse(zd.geometry),
            properties: {
              code: zd.zoning_code,
            },
          }));

          map.current!.addSource('zoning', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: zoningFeatures,
            },
          });

          map.current!.addLayer({
            id: 'zoning-layer',
            type: 'line',
            source: 'zoning',
            paint: {
              'line-color': '#10B981',
              'line-width': 2,
              'line-dasharray': [2, 2],
            },
          });
        }
      } catch (error) {
        console.error('Error loading geometry:', error);
        // Fallback to simple marker
        const center: [number, number] = [-74.006, 40.7128];
        map.current!.flyTo({ center, zoom: 12 });
        new mapboxgl.Marker({ color: '#3B82F6' })
          .setLngLat(center)
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div class="p-2">
                  <h3 class="font-semibold">${property.address || property.bbl}</h3>
                  <p class="text-sm text-gray-600">BBL: ${property.bbl}</p>
                </div>
              `)
          )
          .addTo(map.current!);
      }
    };

    loadGeometry();
  }, [property, mapLoaded]);

  if (!import.meta.env.VITE_MAPBOX_TOKEN) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center h-64 ${className}`}>
        <div className="text-center p-4">
          <p className="text-gray-600 mb-2">Map visualization requires Mapbox token</p>
          <p className="text-sm text-gray-500">
            Set VITE_MAPBOX_TOKEN in your .env file
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg overflow-hidden shadow-md ${className}`}>
      <div ref={mapContainer} className="w-full h-64 md:h-96" />
    </div>
  );
};
