import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GlobeIcon, WandIcon, CameraIcon, RefreshIcon } from './icons';
import LoadingSpinner from './LoadingSpinner';
import { fantasizeLocationImage } from '../services/geminiService';

declare global {
    interface Window {
        google: any;
        __googleMapsCallback__: () => void;
    }
}

interface LocationPickerTabProps {
  onStart: (prompt: string, image: { base64: string, mimeType: string }) => void;
  onClose: () => void;
}

type Step = 'loading' | 'search' | 'explore' | 'capture' | 'generate' | 'start' | 'error';

const stepInstructions: Record<Step, string> = {
    loading: "Initializing map...",
    search: "Search for a location on the globe or click 'Explore' to enter Street View.",
    explore: "Look around. When you find a view you like, capture it.",
    capture: "Describe the art style you want for your story's starting scene.",
    generate: "Generating your world...",
    start: "Your world is ready. Begin your adventure!",
    error: "There was a problem loading the map.",
};

const MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

const LocationPickerTab: React.FC<LocationPickerTabProps> = ({ onStart }) => {
    const [step, setStep] = useState<Step>('loading');
    const [map, setMap] = useState<any>(null); // google.maps.Map
    const [error, setError] = useState('');
    
    const [streetViewImage, setStreetViewImage] = useState<string | null>(null);
    const [finalImage, setFinalImage] = useState<{ base64: string, dataUrl: string } | null>(null);
    const [stylePrompt, setStylePrompt] = useState('a cinematic, high-fantasy painting');
    
    const mapRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const loadGoogleMapsScript = useCallback(() => {
        return new Promise<void>((resolve, reject) => {
            if (window.google && window.google.maps) {
                return resolve();
            }

            const scriptId = 'google-maps-script';
            if (document.getElementById(scriptId)) {
                // If script is already loading, wait for callback
                window.__googleMapsCallback__ = resolve;
                return;
            }
            
            window.__googleMapsCallback__ = resolve;
            
            const script = document.createElement('script');
            script.id = scriptId;
            script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_API_KEY}&libraries=places&loading=async&callback=__googleMapsCallback__`;
            script.async = true;
            script.onerror = () => reject(new Error('Failed to load Google Maps script.'));
            document.head.appendChild(script);
        });
    }, []);

    const initMap = useCallback(() => {
        if (!mapRef.current || !window.google) return;

        const initialLocation = { lat: 48.8584, lng: 2.2945 }; // Eiffel Tower
        const gMap = new window.google.maps.Map(mapRef.current, {
            center: initialLocation,
            zoom: 3,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
            zoomControl: false,
            styles: [
              { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
              { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
              { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
              { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
              { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
              { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
              { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
              { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
              { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
            ],
        });

        const panorama = gMap.getStreetView();
        panorama.setPosition(initialLocation);
        panorama.setPov({ heading: 34, pitch: 10 });
        
        panorama.addListener('visible_changed', () => {
            if(panorama.getVisible()) setStep('explore');
            else setStep('search');
        });

        setMap(gMap);

        if (searchInputRef.current) {
            const searchBox = new window.google.maps.places.Autocomplete(searchInputRef.current);
            searchBox.bindTo("bounds", gMap);
            searchBox.addListener("place_changed", () => {
                const place = searchBox.getPlace();
                if (place.geometry?.location) {
                    gMap.setCenter(place.geometry.location);
                    gMap.setZoom(14);
                }
            });
        }
        
        setStep('search');
    }, []);
    
    useEffect(() => {
        if (!MAPS_API_KEY) {
            setError('Google Maps API Key is missing. This feature is disabled.');
            setStep('error');
            return;
        }

        loadGoogleMapsScript()
            .then(initMap)
            .catch(err => {
                setError("Failed to load Google Maps. Please check your API key and network connection.");
                setStep('error');
            });
            
        // Cleanup function for the script tag
        return () => {
            const script = document.getElementById('google-maps-script');
            if (script) {
                // script.remove(); // This might cause issues with fast re-renders
            }
            if (window.__googleMapsCallback__) {
                delete window.__googleMapsCallback__;
            }
        }
    }, [loadGoogleMapsScript, initMap]);


    const blobToBase64 = (blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                const base64 = dataUrl.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    const captureView = async () => {
        if (!map || !MAPS_API_KEY) return;
        const panorama = map.getStreetView();
        if (!panorama.getVisible()) return;

        setStep('generate');
        const pov = panorama.getPov();
        const pano = panorama.getPano();
        const url = `https://maps.googleapis.com/maps/api/streetview?size=640x480&pano=${pano}&heading=${pov.heading}&pitch=${pov.pitch}&fov=90&key=${MAPS_API_KEY}`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch Street View image. Your API key might be missing the "Street View Static API".');
            const blob = await response.blob();
            const dataUrl = URL.createObjectURL(blob);
            setStreetViewImage(dataUrl);
            setStep('capture');
        } catch (e: any) {
            setError(e.message || "Could not capture view.");
            setStep('explore');
        }
    };

    const handleGenerate = async () => {
        if (!streetViewImage || !stylePrompt) return;
        setStep('generate');
        try {
            const response = await fetch(streetViewImage);
            const blob = await response.blob();
            const base64 = await blobToBase64(blob);

            const fantasizedBase64 = await fantasizeLocationImage(base64, blob.type, stylePrompt);
            setFinalImage({
                base64: fantasizedBase64,
                dataUrl: `data:image/jpeg;base64,${fantasizedBase64}`
            });
            setStep('start');
        } catch (e) {
            setError('Failed to generate AI scene. Please try again.');
            console.error(e);
            setStep('capture');
        }
    };
    
    const handleStart = () => {
        if (!finalImage) return;
        onStart('Start a story in the location shown in the image.', { base64: finalImage.base64, mimeType: 'image/jpeg' });
    };

    if (step === 'error') {
        return (
            <div className="text-center p-4 animate-fade-in">
                <h3 className="text-xl font-bold text-red-400 mb-2">Map Error</h3>
                <p className="text-text-secondary">{error}</p>
                <p className="text-xs text-text-secondary mt-4">
                    Please ensure your `GOOGLE_MAPS_API_KEY` is set correctly in your environment and that you have enabled the "Maps JavaScript API", "Places API", and "Street View Static API" in the Google Cloud Console.
                </p>
            </div>
        );
    }
    
    const isLoading = step === 'loading';

    return (
        <div className="animate-fade-in text-left space-y-4">
            <p className="text-text-secondary text-center min-h-[20px]">{stepInstructions[step]}</p>
            
            <div className="relative">
                <div ref={mapRef} className="w-full aspect-video bg-background-primary rounded-lg overflow-hidden border border-border-primary">
                    {isLoading && <div className="flex items-center justify-center h-full"><LoadingSpinner/></div>}
                </div>
                {step === 'search' && !isLoading && (
                    <div className="absolute top-3 left-3 right-3 flex gap-2">
                        <input ref={searchInputRef} type="text" placeholder="Search for a place..." className="w-full bg-background-primary/80 border border-border-primary rounded-full py-2 px-4 text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent" />
                        <button onClick={() => map?.getStreetView().setVisible(true)} className="bg-accent text-white font-semibold py-2 px-4 rounded-full hover:bg-accent-hover transition-colors">Explore</button>
                    </div>
                )}
            </div>

            {step === 'explore' && <button onClick={captureView} className="w-full flex items-center justify-center gap-2 font-semibold p-3 rounded-full transition-colors duration-200 bg-accent hover:bg-accent-hover"><CameraIcon className="w-5 h-5" /> Capture View</button>}

            {(step === 'capture' || step === 'generate' || step === 'start') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div className="relative aspect-video bg-background-primary rounded-lg overflow-hidden border border-border-primary flex items-center justify-center">
                        <img src={streetViewImage!} alt="Captured Street View" className="w-full h-full object-cover"/>
                    </div>
                     <div className="relative aspect-video bg-background-primary rounded-lg overflow-hidden border border-border-primary flex items-center justify-center">
                        {step === 'generate' && <div className="flex flex-col items-center gap-2 text-text-secondary"><LoadingSpinner/><span>Generating...</span></div>}
                        {finalImage && <img src={finalImage.dataUrl} alt="Generated AI Scene" className="w-full h-full object-cover animate-fade-in"/>}
                        {step === 'capture' && <p className="text-text-secondary text-sm p-4 text-center">Your AI-generated scene will appear here.</p>}
                    </div>
                </div>
            )}
            
            {step === 'capture' && (
                <div className="flex gap-2">
                    <input type="text" value={stylePrompt} onChange={e => setStylePrompt(e.target.value)} placeholder="e.g., a dark fantasy oil painting" className="w-full bg-surface-primary border border-border-primary rounded-full py-2 px-4 text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent" />
                    <button onClick={handleGenerate} className="flex items-center gap-2 bg-interactive-secondary text-white font-semibold py-2 px-4 rounded-full hover:bg-interactive-secondary/80 transition-colors"><WandIcon className="w-5 h-5"/> Generate</button>
                    <button onClick={() => setStep('explore')} className="flex items-center gap-2 bg-surface-primary text-text-secondary font-semibold py-2 px-4 rounded-full hover:bg-surface-primary/80 transition-colors"><RefreshIcon className="w-5 h-5"/> Recapture</button>
                </div>
            )}

            {step === 'start' && (
                 <button onClick={handleStart} className="w-full bg-accent text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-accent-hover transition duration-200 animate-glow">
                    Start Adventure Here
                </button>
            )}
        </div>
    );
};

export default LocationPickerTab;