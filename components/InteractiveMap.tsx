import React, { useState, useRef, MouseEvent as ReactMouseEvent, useEffect } from 'react';
import type { MapData, MapLocation } from '../types';
import { LocationIcon, SettlementIcon, SkullIcon, LandmarkIcon, NaturalIcon, InteriorIcon, QuestionMarkCircleIcon, PlusIcon, MinusIcon, RefreshIcon, ChevronDownIcon } from './icons';

interface InteractiveMapProps {
  mapData?: MapData;
  onNodeHover: (tooltip: { visible: boolean; content: React.ReactNode; x: number; y: number; }) => void;
}

const locationTypeIcons: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
    settlement: SettlementIcon,
    dungeon: SkullIcon,
    landmark: LandmarkIcon,
    natural: NaturalIcon,
    interior: InteriorIcon,
    poi: QuestionMarkCircleIcon,
    default: LocationIcon,
};

const MapLegend: React.FC = () => {
    const legendItems = [
        { icon: SettlementIcon, label: 'Settlement' },
        { icon: SkullIcon, label: 'Dungeon' },
        { icon: LandmarkIcon, label: 'Landmark' },
        { icon: NaturalIcon, label: 'Natural' },
        { icon: InteriorIcon, label: 'Interior' },
        { icon: QuestionMarkCircleIcon, label: 'POI' },
    ];
    return (
        <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-sm p-2 rounded-md border border-white/10 text-xs">
            {legendItems.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                    <Icon className="w-3 h-3 text-text-secondary" />
                    <span className="text-text-secondary">{label}</span>
                </div>
            ))}
        </div>
    )
}


const InteractiveMap: React.FC<InteractiveMapProps> = ({ mapData, onNodeHover }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [viewBox, setViewBox] = useState({ x: -10, y: -10, width: 120, height: 120 });
    const [isPanning, setIsPanning] = useState(false);
    const [showLegend, setShowLegend] = useState(false);
    const lastMousePosition = useRef({ x: 0, y: 0 });
    const svgRef = useRef<SVGSVGElement>(null);

    const locations = mapData?.locations || [];
    const connections = mapData?.connections || [];
    const currentLoc = locations.find(l => l.isCurrent);

    useEffect(() => {
        if (currentLoc) {
            // Smoothly pan to the new location
            // This is a simplified animation, a library like d3-zoom would be more robust
            setViewBox(prev => ({
                ...prev,
                x: currentLoc.x - prev.width / 2,
                y: currentLoc.y - prev.height / 2,
            }));
        }
    }, [currentLoc?.id]); // Only recenter when current location ID changes

    if (locations.length === 0) {
        return (
            <div className="border-t border-white/10 bg-black/20 p-4 text-center text-text-secondary text-sm">
                <LocationIcon className="w-8 h-8 mx-auto mb-2" />
                <p>Your map will be drawn here as you explore.</p>
            </div>
        );
    }

    const handleZoom = (factor: number) => {
        const newWidth = viewBox.width * factor;
        const newHeight = viewBox.height * factor;
        if (newWidth > 400 || newWidth < 30) return;

        const newX = viewBox.x - (newWidth - viewBox.width) / 2;
        const newY = viewBox.y - (newHeight - viewBox.height) / 2;
        setViewBox({ x: newX, y: newY, width: newWidth, height: newHeight });
    };

    const handleReset = () => {
        if (currentLoc) {
            setViewBox({ x: currentLoc.x - 60, y: currentLoc.y - 60, width: 120, height: 120 });
        } else {
            setViewBox({ x: -10, y: -10, width: 120, height: 120 });
        }
    }

    const handleMouseDown = (e: ReactMouseEvent<SVGSVGElement>) => {
        setIsPanning(true);
        lastMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
        setIsPanning(false);
    };

    const handleMouseMove = (e: ReactMouseEvent<SVGSVGElement>) => {
        if (isPanning) {
            const dx = e.clientX - lastMousePosition.current.x;
            const dy = e.clientY - lastMousePosition.current.y;
            const scaleX = viewBox.width / (svgRef.current?.clientWidth || 1);
            const scaleY = viewBox.height / (svgRef.current?.clientHeight || 1);
            
            setViewBox(prev => ({
                ...prev,
                x: prev.x - dx * scaleX,
                y: prev.y - dy * scaleY
            }));
            
            lastMousePosition.current = { x: e.clientX, y: e.clientY };
        }
    };

    const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
        e.preventDefault();
        const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
        handleZoom(zoomFactor);
    };
    
    const handleMouseEnter = (e: React.MouseEvent, location: MapLocation) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const content = (
            <div>
                <strong>{location.name}</strong>
                <p className="text-xs text-text-secondary mt-1">{location.description}</p>
            </div>
        );
        onNodeHover({
            visible: true,
            content: content,
            x: rect.left + rect.width / 2,
            y: rect.top,
        });
    };

    const handleMouseLeave = () => {
        onNodeHover({ visible: false, content: null, x: 0, y: 0 });
    };

    return (
        <div className="border-t border-white/10 bg-black/30" data-tour-id="world-map">
             <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-4 flex justify-between items-center text-left hover:bg-white/5 transition-colors"
                aria-expanded={isOpen}
            >
                <h4 className="font-semibold text-sm text-white">World Map</h4>
                <ChevronDownIcon className={`w-5 h-5 text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
           {isOpen && (
             <div className="p-4 pt-0 animate-fade-in">
                <div className="relative aspect-[16/10] bg-background-primary rounded-md overflow-hidden border border-border-primary">
                    <svg
                        ref={svgRef}
                        width="100%"
                        height="100%"
                        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
                        preserveAspectRatio="xMidYMid meet"
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onMouseMove={handleMouseMove}
                        onWheel={handleWheel}
                        className={isPanning ? 'cursor-grabbing' : 'cursor-grab'}
                    >
                        <defs>
                            <pattern id="mapGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                                <circle cx="1" cy="1" r="0.2" fill="var(--color-border-primary)" opacity="0.5" />
                            </pattern>
                        </defs>
                        <rect x={viewBox.x - viewBox.width} y={viewBox.y - viewBox.height} width={viewBox.width * 3} height={viewBox.height * 3} fill="var(--color-background-secondary)" />
                        <rect x={viewBox.x - viewBox.width} y={viewBox.y - viewBox.height} width={viewBox.width * 3} height={viewBox.height * 3} fill="url(#mapGrid)" />
                        
                        <g>
                            {connections.map((conn, index) => {
                                const fromLoc = locations.find(l => l.id === conn.from);
                                const toLoc = locations.find(l => l.id === conn.to);
                                if (!fromLoc || !toLoc) return null;
                                return (
                                    <line
                                        key={index}
                                        x1={fromLoc.x} y1={fromLoc.y}
                                        x2={toLoc.x} y2={toLoc.y}
                                        stroke="var(--color-interactive-secondary)"
                                        strokeWidth="0.5"
                                        strokeDasharray="1 1"
                                        vectorEffect="non-scaling-stroke"
                                    />
                                )
                            })}
                        </g>
                        <g>
                            {locations.map(loc => {
                                const isCurrent = loc.isCurrent;
                                const Icon = locationTypeIcons[loc.type || 'default'] || LocationIcon;
                                const iconSize = isCurrent ? 5 : 4;
                                return (
                                    <g key={loc.id} transform={`translate(${loc.x}, ${loc.y})`} onMouseEnter={(e) => handleMouseEnter(e, loc)} onMouseLeave={handleMouseLeave} className="cursor-pointer group">
                                        {isCurrent && (
                                            <>
                                                <circle r="6" fill="var(--color-accent)" opacity="0.3" style={{ vectorEffect: 'non-scaling-stroke' }}>
                                                    <animate attributeName="r" from="6" to="10" dur="2s" repeatCount="indefinite" />
                                                    <animate attributeName="opacity" from="0.3" to="0" dur="2s" repeatCount="indefinite" />
                                                </circle>
                                                <circle r="4" fill="var(--color-accent)" opacity="0.5" style={{ vectorEffect: 'non-scaling-stroke' }} />
                                            </>
                                        )}
                                        <circle r={isCurrent ? '3' : '2.5'} fill="var(--color-background-secondary)" stroke="var(--color-interactive-secondary)" strokeWidth="0.5" style={{ vectorEffect: 'non-scaling-stroke' }} />
                                        <Icon 
                                            className={isCurrent ? 'text-accent-text' : 'text-text-secondary'}
                                            x={-iconSize/2.5}
                                            y={-iconSize/2.5}
                                            width={iconSize/1.25}
                                            height={iconSize/1.25}
                                            style={{
                                                filter: isCurrent ? 'drop-shadow(0 0 2px var(--color-accent))' : 'none',
                                                vectorEffect: 'non-scaling-stroke'
                                            }}
                                        />
                                        <text x="0" y={iconSize + 1} fontSize="2.5" fill="var(--color-text-primary)" textAnchor="middle" className="font-sans font-semibold" style={{vectorEffect: 'non-scaling-stroke', paintOrder: 'stroke', stroke: 'var(--color-background-primary)', strokeWidth: '0.5px', strokeLinecap: 'butt', strokeLinejoin: 'miter' }}>{loc.name}</text>
                                    </g>
                                )
                            })}
                        </g>
                    </svg>
                    <div className="absolute bottom-2 right-2 flex flex-col gap-1">
                        <button onClick={() => handleZoom(0.8)} className="p-1.5 bg-black/50 rounded-md text-white hover:bg-black/80 transition-colors" aria-label="Zoom in"><PlusIcon className="w-4 h-4" /></button>
                        <button onClick={() => handleZoom(1.25)} className="p-1.5 bg-black/50 rounded-md text-white hover:bg-black/80 transition-colors" aria-label="Zoom out"><MinusIcon className="w-4 h-4" /></button>
                        <button onClick={handleReset} className="p-1.5 bg-black/50 rounded-md text-white hover:bg-black/80 transition-colors" aria-label="Center map"><RefreshIcon className="w-4 h-4" /></button>
                    </div>
                    <div className="absolute top-2 left-2">
                        <button onClick={() => setShowLegend(!showLegend)} className="p-1.5 bg-black/50 rounded-md text-white hover:bg-black/80 transition-colors" aria-label="Toggle map legend">
                           <QuestionMarkCircleIcon className="w-5 h-5" />
                        </button>
                    </div>
                    {showLegend && <MapLegend />}
                </div>
            </div>
           )}
        </div>
    );
};

export default InteractiveMap;