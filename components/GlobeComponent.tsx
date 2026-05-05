'use client';
import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';

const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

export default function GlobeComponent() {
  const globeRef = useRef<any>();
  const [arcsData, setArcsData] = useState<any[]>([]);
  const [ringsData, setRingsData] = useState<any[]>([]);

  useEffect(() => {
    // Generate random arcs for data requests
    const generateData = () => {
      const arcs = Array.from({ length: 12 }).map(() => ({
        startLat: (Math.random() - 0.5) * 160,
        startLng: (Math.random() - 0.5) * 360,
        endLat: 37.7749, // Target server (e.g., San Francisco)
        endLng: -122.4194,
        color: ['#a78bfa', '#cebdff'][Math.round(Math.random())]
      }));
      setArcsData(arcs);

      // Generate random rings for intercepted PII leaks
      const rings = Array.from({ length: 4 }).map(() => ({
        lat: (Math.random() - 0.5) * 160,
        lng: (Math.random() - 0.5) * 360,
        maxR: Math.random() * 10 + 5,
        propagationSpeed: Math.random() * 2 + 1,
        repeatPeriod: Math.random() * 800 + 400
      }));
      setRingsData(rings);
    };

    generateData();
    const interval = setInterval(generateData, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 2.5;
      globeRef.current.controls().enableZoom = false;
      globeRef.current.pointOfView({ altitude: 2.2 });
    }
  }, [globeRef.current]);

  return (
    <div className="absolute -right-20 -top-20 opacity-80 pointer-events-none" style={{ width: '400px', height: '400px' }}>
      <Globe
        ref={globeRef}
        width={400}
        height={400}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        arcsData={arcsData}
        arcColor="color"
        arcDashLength={0.4}
        arcDashGap={0.2}
        arcDashAnimateTime={1500}
        ringsData={ringsData}
        ringColor={() => '#ffb4ab'}
        ringMaxRadius="maxR"
        ringPropagationSpeed="propagationSpeed"
        ringRepeatPeriod="repeatPeriod"
      />
    </div>
  );
}
