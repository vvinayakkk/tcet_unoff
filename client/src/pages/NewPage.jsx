import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Check, X, Package, Shield, FileText, MapPin, Info, Search, Flag, Calendar, Users, Eye, Truck, BarChart2, Lock, Zap, Layers, Wind, Droplet } from 'lucide-react';
import * as THREE from 'three';
import '../styles/dashboard.css';

const RapidComplianceChecker = () => {
  // 3D scene references
  const globeRef = useRef(null);
  const packageRef = useRef(null);
  const formRef = useRef(null);
  const complianceRef = useRef(null);
  const networkRef = useRef(null);
  const dataVizRef = useRef(null);
  const securityRef = useRef(null);
  const weatherRef = useRef(null);
  
  // State for shipment details
  const [shipment, setShipment] = useState({
    id: 'SHP-29384',
    sender: 'Acme Electronics Ltd.',
    recipient: 'Global Tech Distributors',
    origin: 'United States',
    destination: 'Singapore',
    contents: 'Electronic components',
    weight: 5.2,
    value: 3200,
    dimensions: '45x30x25',
    dateRequired: '2025-03-15',
    declaredCategory: 'Electronics - Commercial',
    isHazardous: false,
    needsTemperatureControl: false,
    shipmentType: 'Commercial',
    courier: 'FastTrack International'
  });
  
  // State for compliance results
  const [complianceResults, setComplianceResults] = useState({
    status: 'passed', // 'passed', 'warnings', 'failed'
    score: 94,
    issues: [
      { 
        type: 'warning', 
        message: 'Dual-use electronics may require export license verification', 
        severity: 'medium',
        regulation: 'EAR 740.17',
        recommendation: 'Verify if items fall under Wassenaar Arrangement export controls'
      }
    ],
    requiredDocuments: [
      { name: 'Commercial Invoice', status: 'complete' },
      { name: 'Packing List', status: 'complete' },
      { name: 'Certificate of Origin', status: 'missing' },
      { name: 'Export Declaration', status: 'complete' }
    ],
    importDuties: {
      estimatedTotal: 192,
      taxRate: '6%',
      customsProcessingFee: 35,
      additionalTaxes: 0
    },
    destinationRestrictions: {
      restrictedItems: ['Lithium batteries not in equipment', 'Military-grade encryption'],
      specialPermits: ['Electronics containing encrypted technology'],
      importLimits: 'None for commercial shipments under $5000'
    }
  });
  
  // State for 3D loading
  const [isLoading, setIsLoading] = useState(true);
  
  // State for current view
  const [currentView, setCurrentView] = useState('main'); // 'main', 'documents', 'history'
  
  // State for animation frames
  const [animationFrame, setAnimationFrame] = useState(null);
  
  // Previous compliance scores for history chart
  const [complianceHistory] = useState([
    { id: 'SHP-29375', date: '2025-02-21', score: 100, destination: 'Canada' },
    { id: 'SHP-29376', date: '2025-02-22', score: 85, destination: 'Japan' },
    { id: 'SHP-29378', date: '2025-02-23', score: 75, destination: 'Brazil' },
    { id: 'SHP-29380', date: '2025-02-23', score: 98, destination: 'UK' },
    { id: 'SHP-29381', date: '2025-02-24', score: 92, destination: 'Germany' },
    { id: 'SHP-29382', date: '2025-02-24', score: 100, destination: 'Australia' },
    { id: 'SHP-29383', date: '2025-02-24', score: 88, destination: 'Mexico' }
  ]);
  
  // Sample countries database with coordinates and restrictions
  const [countries] = useState({
    'United States': { lat: 37.0902, lng: -95.7129, restrictionLevel: 'low' },
    'Singapore': { lat: 1.3521, lng: 103.8198, restrictionLevel: 'medium' },
    'China': { lat: 35.8617, lng: 104.1954, restrictionLevel: 'high' },
    'Brazil': { lat: -14.2350, lng: -51.9253, restrictionLevel: 'medium' },
    'Germany': { lat: 51.1657, lng: 10.4515, restrictionLevel: 'low' },
    'Japan': { lat: 36.2048, lng: 138.2529, restrictionLevel: 'medium' },
    'Australia': { lat: -25.2744, lng: 133.7751, restrictionLevel: 'low' },
    'UK': { lat: 55.3781, lng: -3.4360, restrictionLevel: 'low' },
    'Canada': { lat: 56.1304, lng: -106.3468, restrictionLevel: 'low' },
    'Mexico': { lat: 23.6345, lng: -102.5528, restrictionLevel: 'medium' }
  });
  
  // Helper function to determine color based on status
  const getStatusColor = (status) => {
    switch(status) {
      case 'passed': return { text: 'text-green-400', bg: 'bg-green-500' };
      case 'warnings': return { text: 'text-yellow-400', bg: 'bg-yellow-500' };
      case 'failed': return { text: 'text-red-400', bg: 'bg-red-500' };
      default: return { text: 'text-gray-400', bg: 'bg-gray-500' };
    }
  };
  
  // Helper function to determine restriction level color
  const getRestrictionColor = (level) => {
    switch(level) {
      case 'low': return 0x4ADE80; // green
      case 'medium': return 0xFACC15; // yellow
      case 'high': return 0xEF4444; // red
      default: return 0xA3A3A3; // gray
    }
  };
  
  // Initialize 3D scenes
  useEffect(() => {
    if (!globeRef.current || !packageRef.current || !formRef.current || !complianceRef.current) return;
    
    setIsLoading(true);
    
    // Clean up previous scenes
    while (globeRef.current.firstChild) globeRef.current.removeChild(globeRef.current.firstChild);
    while (packageRef.current.firstChild) packageRef.current.removeChild(packageRef.current.firstChild);
    while (formRef.current.firstChild) formRef.current.removeChild(formRef.current.firstChild);
    while (complianceRef.current.firstChild) complianceRef.current.removeChild(complianceRef.current.firstChild);
    
    // 1. Globe visualization
    const globeWidth = globeRef.current.clientWidth;
    const globeHeight = globeRef.current.clientHeight;
    
    const globeScene = new THREE.Scene();
    const globeCamera = new THREE.PerspectiveCamera(45, globeWidth / globeHeight, 0.1, 1000);
    const globeRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    globeRenderer.setSize(globeWidth, globeHeight);
    globeRenderer.setClearColor(0x111827, 0);
    globeRef.current.appendChild(globeRenderer.domElement);
    
    // Create sphere (globe)
    const sphereGeometry = new THREE.SphereGeometry(5, 32, 32);
    const sphereMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x1E3A8A,
      emissive: 0x172554,
      specular: 0x3B82F6,
      shininess: 30,
      opacity: 0.9,
      transparent: true
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    globeScene.add(sphere);
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    globeScene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 3, 5);
    globeScene.add(directionalLight);
    
    // Position camera
    globeCamera.position.z = 12;
    
    // Add origin point
    if (countries[shipment.origin]) {
      const originCoords = countries[shipment.origin];
      const originVector = latLngToVector3(originCoords.lat, originCoords.lng);
      const originGeometry = new THREE.SphereGeometry(0.2, 16, 16);
      const originMaterial = new THREE.MeshBasicMaterial({ color: 0x4ADE80 });
      const originSphere = new THREE.Mesh(originGeometry, originMaterial);
      originSphere.position.copy(originVector);
      globeScene.add(originSphere);
      
      // Add pulsing effect to origin
      const originPulseGeometry = new THREE.SphereGeometry(0.25, 16, 16);
      const originPulseMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x4ADE80,
        transparent: true,
        opacity: 0.6
      });
      const originPulse = new THREE.Mesh(originPulseGeometry, originPulseMaterial);
      originPulse.position.copy(originVector);
      originPulse.scale.set(1, 1, 1);
      globeScene.add(originPulse);
      
      // Animate the pulse
      const animateOriginPulse = () => {
        originPulse.scale.x = 1 + Math.sin(Date.now() * 0.005) * 0.5;
        originPulse.scale.y = originPulse.scale.x;
        originPulse.scale.z = originPulse.scale.x;
        originPulseMaterial.opacity = 0.6 - (originPulse.scale.x - 1) * 0.5;
      };
      
      globeScene.userData = { ...globeScene.userData, animateOriginPulse };
    }
    
    // Add destination point
    if (countries[shipment.destination]) {
      const destCoords = countries[shipment.destination];
      const destVector = latLngToVector3(destCoords.lat, destCoords.lng);
      const destGeometry = new THREE.SphereGeometry(0.2, 16, 16);
      const destMaterial = new THREE.MeshBasicMaterial({ 
        color: getRestrictionColor(destCoords.restrictionLevel)
      });
      const destSphere = new THREE.Mesh(destGeometry, destMaterial);
      destSphere.position.copy(destVector);
      globeScene.add(destSphere);
      
      // Add pulsing effect to destination
      const destPulseGeometry = new THREE.SphereGeometry(0.25, 16, 16);
      const destPulseMaterial = new THREE.MeshBasicMaterial({ 
        color: getRestrictionColor(destCoords.restrictionLevel),
        transparent: true,
        opacity: 0.6
      });
      const destPulse = new THREE.Mesh(destPulseGeometry, destPulseMaterial);
      destPulse.position.copy(destVector);
      destPulse.scale.set(1, 1, 1);
      globeScene.add(destPulse);
      
      // Animate the pulse
      const animateDestPulse = () => {
        destPulse.scale.x = 1 + Math.sin(Date.now() * 0.005 + Math.PI) * 0.5;
        destPulse.scale.y = destPulse.scale.x;
        destPulse.scale.z = destPulse.scale.x;
        destPulseMaterial.opacity = 0.6 - (destPulse.scale.x - 1) * 0.5;
      };
      
      globeScene.userData = { ...globeScene.userData, animateDestPulse };
      
      // Draw route line between points
      if (countries[shipment.origin]) {
        const originCoords = countries[shipment.origin];
        const originVector = latLngToVector3(originCoords.lat, originCoords.lng);
        
        // Create curved path
        const curvePoints = [];
        curvePoints.push(originVector);
        
        // Add elevated midpoint
        const midPoint = new THREE.Vector3().addVectors(originVector, destVector).multiplyScalar(0.5);
        const midPointElevation = 1.2;
        midPoint.normalize().multiplyScalar(5 * midPointElevation);
        curvePoints.push(midPoint);
        
        curvePoints.push(destVector);
        
        const curve = new THREE.CatmullRomCurve3(curvePoints);
        const points = curve.getPoints(50);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        
        const material = new THREE.LineBasicMaterial({ 
          color: 0x60A5FA,
          linewidth: 2
        });
        
        const routeLine = new THREE.Line(geometry, material);
        globeScene.add(routeLine);
        
        // Add animated particle along the route
        const particleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const particleMaterial = new THREE.MeshBasicMaterial({ 
          color: 0xFFFFFF,
          emissive: 0xFFFFFF,
          emissiveIntensity: 1
        });
        const routeParticle = new THREE.Mesh(particleGeometry, particleMaterial);
        globeScene.add(routeParticle);
        
        // Animation for particle along route
        let particleProgress = 0;
        const animateRouteParticle = () => {
          particleProgress = (particleProgress + 0.005) % 1;
          const point = curve.getPoint(particleProgress);
          routeParticle.position.copy(point);
        };
        
        globeScene.userData = { ...globeScene.userData, animateRouteParticle };
      }
    }
    
    // Add a restriction overlay for the destination based on its restriction level
    if (countries[shipment.destination]) {
      const destCoords = countries[shipment.destination];
      const restrictionLevel = destCoords.restrictionLevel;
      
      // Only show for medium and high restriction levels
      if (restrictionLevel === 'medium' || restrictionLevel === 'high') {
        const destVector = latLngToVector3(destCoords.lat, destCoords.lng);
        const radius = restrictionLevel === 'high' ? 1.5 : 1.0;
        
        const restrictionGeometry = new THREE.CircleGeometry(radius, 32);
        const restrictionMaterial = new THREE.MeshBasicMaterial({
          color: getRestrictionColor(restrictionLevel),
          transparent: true,
          opacity: 0.2,
          side: THREE.DoubleSide
        });
        
        const restrictionCircle = new THREE.Mesh(restrictionGeometry, restrictionMaterial);
        
        // Position and rotate to align with globe surface
        restrictionCircle.position.copy(destVector);
        restrictionCircle.lookAt(new THREE.Vector3(0, 0, 0));
        
        globeScene.add(restrictionCircle);
        
        // Add pulsing animation to restriction circle
        const animateRestrictionCircle = () => {
          const pulseScale = 1 + Math.sin(Date.now() * 0.003) * 0.2;
          restrictionCircle.scale.set(pulseScale, pulseScale, 1);
          restrictionMaterial.opacity = 0.2 - (pulseScale - 1) * 0.1;
        };
        
        globeScene.userData = { ...globeScene.userData, animateRestrictionCircle };
      }
    }
    
    // Add rotating atmosphere glow
    const atmosphereGeometry = new THREE.SphereGeometry(5.2, 32, 32);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x60A5FA,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    globeScene.add(atmosphere);
    
    // 2. Package 3D visualization
    const packageWidth = packageRef.current.clientWidth;
    const packageHeight = packageRef.current.clientHeight;
    
    const packageScene = new THREE.Scene();
    const packageCamera = new THREE.PerspectiveCamera(45, packageWidth / packageHeight, 0.1, 1000);
    const packageRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    packageRenderer.setSize(packageWidth, packageHeight);
    packageRenderer.setClearColor(0x111827, 0);
    packageRef.current.appendChild(packageRenderer.domElement);
    
    // Create a box (package)
    const boxGeometry = new THREE.BoxGeometry(3, 2, 2.5);
    const boxMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xF59E0B,
      emissive: 0x78350F,
      emissiveIntensity: 0.2,
      specular: 0xFBBF24,
      shininess: 30
    });
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    packageScene.add(box);
    
    // Add wireframe overlay to show scanning effect
    const wireframeGeometry = new THREE.BoxGeometry(3.05, 2.05, 2.55);
    const wireframeMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x60A5FA,
      wireframe: true,
      transparent: true,
      opacity: 0.5
    });
    const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    packageScene.add(wireframe);
    
    // Add shipping label
    const labelGeometry = new THREE.PlaneGeometry(1.5, 1);
    const labelMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xFFFFFF,
      side: THREE.DoubleSide
    });
    const label = new THREE.Mesh(labelGeometry, labelMaterial);
    label.position.set(0, 0, 1.26);
    packageScene.add(label);
    
    // Add barcode lines on the label
    const barcodeGroup = new THREE.Group();
    
    // Generate random barcode lines
    for (let i = 0; i < 15; i++) {
      const width = Math.random() * 0.1 + 0.02;
      const height = 0.5;
      const posX = (Math.random() - 0.5) * 1.2;
      
      const lineGeometry = new THREE.PlaneGeometry(width, height);
      const lineMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const line = new THREE.Mesh(lineGeometry, lineMaterial);
      
      line.position.set(posX, -0.2, 0.01);
      barcodeGroup.add(line);
    }
    
    label.add(barcodeGroup);
    
    // Add scanning effect
    const scanPlaneGeometry = new THREE.PlaneGeometry(3.5, 3);
    const scanPlaneMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x3B82F6,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide
    });
    const scanPlane = new THREE.Mesh(scanPlaneGeometry, scanPlaneMaterial);
    scanPlane.position.z = -2;
    scanPlane.rotation.x = Math.PI / 2;
    packageScene.add(scanPlane);
    
    // Scan animation function
    let scanDirection = 1;
    const animateScan = () => {
      scanPlane.position.y += 0.05 * scanDirection;
      
      if (scanPlane.position.y > 3 || scanPlane.position.y < -3) {
        scanDirection *= -1;
      }
      
      scanPlaneMaterial.opacity = 0.2 + Math.sin(Date.now() * 0.003) * 0.1;
    };
    
    packageScene.userData = { animateScan };
    
    // Add lighting
    const packageAmbientLight = new THREE.AmbientLight(0xffffff, 0.7);
    packageScene.add(packageAmbientLight);
    
    const packageSpotLight = new THREE.SpotLight(0xffffff, 1);
    packageSpotLight.position.set(5, 5, 5);
    packageSpotLight.angle = Math.PI / 6;
    packageSpotLight.penumbra = 0.5;
    packageScene.add(packageSpotLight);
    
    // Position camera
    packageCamera.position.set(0, 0, 6);
    
    // 3. Form 3D visualization
    const formWidth = formRef.current.clientWidth;
    const formHeight = formRef.current.clientHeight;
    
    const formScene = new THREE.Scene();
    const formCamera = new THREE.PerspectiveCamera(45, formWidth / formHeight, 0.1, 1000);
    const formRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    formRenderer.setSize(formWidth, formHeight);
    formRenderer.setClearColor(0x111827, 0);
    formRef.current.appendChild(formRenderer.domElement);
    
    // Create a document form
    const documentGeometry = new THREE.PlaneGeometry(4, 5);
    const documentMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xF9FAFB,
      side: THREE.DoubleSide
    });
    const document = new THREE.Mesh(documentGeometry, documentMaterial);
    formScene.add(document);
    
    // Add form lines
    const linesGroup = new THREE.Group();
    
    // Header line
    const headerGeometry = new THREE.PlaneGeometry(3.8, 0.1);
    const headerMaterial = new THREE.MeshBasicMaterial({ color: 0x3B82F6 });
    const header = new THREE.Mesh(headerGeometry, headerMaterial);
    header.position.set(0, 2.3, 0.01);
    linesGroup.add(header);
    
    // Form lines
    for (let i = 0; i < 10; i++) {
      const lineGeometry = new THREE.PlaneGeometry(3, 0.02);
      const lineMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xD1D5DB,
        transparent: true,
        opacity: 0.8
      });
      const line = new THREE.Mesh(lineGeometry, lineMaterial);
      
      line.position.set(0, 1.8 - i * 0.4, 0.01);
      linesGroup.add(line);
    }
    
    document.add(linesGroup);
    
    // Add animated stamp effect
    const stampGeometry = new THREE.CircleGeometry(0.7, 32);
    const stampMaterial = new THREE.MeshBasicMaterial({
      color: complianceResults.status === 'passed' ? 0x4ADE80 : 
             complianceResults.status === 'warnings' ? 0xFACC15 : 0xEF4444,
      transparent: true,
      opacity: 0.8
    });
    const stamp = new THREE.Mesh(stampGeometry, stampMaterial);
    stamp.position.set(1, -1.5, 0.05);
    stamp.rotation.z = -Math.PI / 12;
    document.add(stamp);
    
    // Animate the stamp
    const animateStamp = () => {
      stampMaterial.opacity = 0.5 + Math.sin(Date.now() * 0.003) * 0.3;
    };
    
    formScene.userData = { animateStamp };
    
    // Position camera
    formCamera.position.set(0, 0, 6);
    
    // 4. Compliance meter 3D visualization
    const complianceWidth = complianceRef.current.clientWidth;
    const complianceHeight = complianceRef.current.clientHeight;
    
    const complianceScene = new THREE.Scene();
    const complianceCamera = new THREE.PerspectiveCamera(45, complianceWidth / complianceHeight, 0.1, 1000);
    const complianceRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    complianceRenderer.setSize(complianceWidth, complianceHeight);
    complianceRenderer.setClearColor(0x111827, 0);
    complianceRef.current.appendChild(complianceRenderer.domElement);
    
    // Create a circular gauge
    const gaugeRadius = 2;
    const gaugeSegments = 60;
    const gaugeStartAngle = -Math.PI * 0.75;
    const gaugeEndAngle = Math.PI * 0.75;
    
    const gaugeBackGeometry = new THREE.RingGeometry(
      gaugeRadius - 0.2, 
      gaugeRadius, 
      gaugeSegments, 
      1, 
      gaugeStartAngle, 
      Math.PI * 1.5
    );
    const gaugeBackMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x1F2937,
      side: THREE.DoubleSide
    });
    const gaugeBack = new THREE.Mesh(gaugeBackGeometry, gaugeBackMaterial);
    complianceScene.add(gaugeBack);
    
    // Score percentage to angle
    const scoreAngle = (complianceResults.score / 100) * Math.PI * 1.5;
    
    // Create colored gauge based on score
    const gaugeFillGeometry = new THREE.RingGeometry(
      gaugeRadius - 0.2, 
      gaugeRadius, 
      gaugeSegments, 
      1, 
      gaugeStartAngle, 
      scoreAngle
    );
    
    // Color based on score
    let gaugeColor;
    if (complianceResults.score >= 90) gaugeColor = 0x4ADE80;
    else if (complianceResults.score >= 70) gaugeColor = 0xFACC15;
    else gaugeColor = 0xEF4444;
    
    const gaugeFillMaterial = new THREE.MeshBasicMaterial({ 
      color: gaugeColor,
      side: THREE.DoubleSide
    });
    const gaugeFill = new THREE.Mesh(gaugeFillGeometry, gaugeFillMaterial);
    complianceScene.add(gaugeFill);
    
    // Add ticker at current position
    const tickerGeometry = new THREE.CircleGeometry(0.2, 32);
    const tickerMaterial = new THREE.MeshBasicMaterial({ color: gaugeColor });
    const ticker = new THREE.Mesh(tickerGeometry, tickerMaterial);
    
    // Position ticker at end of gauge
    const tickerAngle = gaugeStartAngle + scoreAngle;
    ticker.position.x = gaugeRadius * Math.cos(tickerAngle);
    ticker.position.y = gaugeRadius * Math.sin(tickerAngle);
    
    complianceScene.add(ticker);
    
    // Add pulsing effect to ticker
    const animateTicker = () => {
      ticker.scale.x = 1 + Math.sin(Date.now() * 0.005) * 0.2;
      ticker.scale.y = ticker.scale.x;
    };
    
    complianceScene.userData = { animateTicker };
    
    // Position camera
    complianceCamera.position.z = 5;
    
    // Animation function for all scenes
    const animate = () => {
      const animFrameId = requestAnimationFrame(animate);
      setAnimationFrame(animFrameId);
      
      // Globe animations
      sphere.rotation.y += 0.002;
      if (globeScene.userData.animateOriginPulse) globeScene.userData.animateOriginPulse();
      if (globeScene.userData.animateDestPulse) globeScene.userData.animateDestPulse();
      if (globeScene.userData.animateRouteParticle) globeScene.userData.animateRouteParticle();
      if (globeScene.userData.animateRestrictionCircle) globeScene.userData.animateRestrictionCircle();
      
      // Package animations
      box.rotation.y += 0.005;
      wireframe.rotation.y += 0.005;
      if (packageScene.userData.animateScan) packageScene.userData.animateScan();
      
      // Form animations
      document.rotation.y = Math.sin(Date.now() * 0.001) * 0.1;
      if (formScene.userData.animateStamp) formScene.userData.animateStamp();
      
      // Compliance meter animations
      gaugeBack.rotation.z += 0.001;
      gaugeFill.rotation.z += 0.001;
      ticker.position.x = gaugeRadius * Math.cos(tickerAngle + gaugeBack.rotation.z);
      ticker.position.y = gaugeRadius * Math.sin(tickerAngle + gaugeBack.rotation.z);
      if (complianceScene.userData.animateTicker) complianceScene.userData.animateTicker();
      
      // Render scenes
      globeRenderer.render(globeScene, globeCamera);
      packageRenderer.render(packageScene, packageCamera);
      formRenderer.render(formScene, formCamera);
      complianceRenderer.render(complianceScene, complianceCamera);
    };
    
    animate();
    
    // Handle window resize for all renderers
    const handleResize = () => {
      if (globeRef.current) {
        const newGlobeWidth = globeRef.current.clientWidth;
        const newGlobeHeight = globeRef.current.clientHeight;
        globeCamera.aspect = newGlobeWidth / newGlobeHeight;
        globeCamera.updateProjectionMatrix();
        globeRenderer.setSize(newGlobeWidth, newGlobeHeight);
      }
      
      if (packageRef.current) {
        const newPackageWidth = packageRef.current.clientWidth;
        const newPackageHeight = packageRef.current.clientHeight;
        packageCamera.aspect = newPackageWidth / newPackageHeight;
        packageCamera.updateProjectionMatrix();
        packageRenderer.setSize(newPackageWidth, newPackageHeight);
      }
      
      if (formRef.current) {
        const newFormWidth = formRef.current.clientWidth;
        const newFormHeight = formRef.current.clientHeight;
        formCamera.aspect = newFormWidth / newFormHeight;
        formCamera.updateProjectionMatrix();
        formRenderer.setSize(newFormWidth, newFormHeight);
      }
      
      if (complianceRef.current) {
        const newComplianceWidth = complianceRef.current.clientWidth;
        const newComplianceHeight = complianceRef.current.clientHeight;
        complianceCamera.aspect = newComplianceWidth / newComplianceHeight;
        complianceCamera.updateProjectionMatrix();
        complianceRenderer.setSize(newComplianceWidth, newComplianceHeight);
      }
      
      if (networkRef.current) {
        const newNetworkWidth = networkRef.current.clientWidth;
        const newNetworkHeight = networkRef.current.clientHeight;
        networkCamera.aspect = newNetworkWidth / newNetworkHeight;
        networkCamera.updateProjectionMatrix();
        networkRenderer.setSize(newNetworkWidth, newNetworkHeight);
      }
      
      if (dataVizRef.current) {
        const newDataVizWidth = dataVizRef.current.clientWidth;
        const newDataVizHeight = dataVizRef.current.clientHeight;
        dataVizCamera.aspect = newDataVizWidth / newDataVizHeight;
        dataVizCamera.updateProjectionMatrix();
        dataVizRenderer.setSize(newDataVizWidth, newDataVizHeight);
      }
      
      if (securityRef.current) {
        const newSecurityWidth = securityRef.current.clientWidth;
        const newSecurityHeight = securityRef.current.clientHeight;
        securityCamera.aspect = newSecurityWidth / newSecurityHeight;
        securityCamera.updateProjectionMatrix();
        securityRenderer.setSize(newSecurityWidth, newSecurityHeight);
      }
      
      if (weatherRef.current) {
        const newWeatherWidth = weatherRef.current.clientWidth;
        const newWeatherHeight = weatherRef.current.clientHeight;
        weatherCamera.aspect = newWeatherWidth / newWeatherHeight;
        weatherCamera.updateProjectionMatrix();
        weatherRenderer.setSize(newWeatherWidth, newWeatherHeight);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Helper function to convert lat/lng to 3D vector
    function latLngToVector3(lat, lng, radius = 5) {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      
      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const y = (radius * Math.cos(phi));
      const z = (radius * Math.sin(phi) * Math.sin(theta));
      
      return new THREE.Vector3(x, y, z);
    }
    
    // Initialize Network Visualization (5th scene)
    if (networkRef.current) {
      const networkWidth = networkRef.current.clientWidth;
      const networkHeight = networkRef.current.clientHeight;
      
      const networkScene = new THREE.Scene();
      const networkCamera = new THREE.PerspectiveCamera(45, networkWidth / networkHeight, 0.1, 1000);
      const networkRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      
      networkRenderer.setSize(networkWidth, networkHeight);
      networkRenderer.setClearColor(0x111827, 0);
      networkRef.current.appendChild(networkRenderer.domElement);
      
      // Create network nodes and connections
      const nodesGroup = new THREE.Group();
      
      // Create server node
      const serverGeometry = new THREE.BoxGeometry(1, 1.5, 1);
      const serverMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x4F46E5,
        emissive: 0x312E81,
        emissiveIntensity: 0.3,
        specular: 0x818CF8
      });
      const serverNode = new THREE.Mesh(serverGeometry, serverMaterial);
      serverNode.position.set(0, 0, 0);
      nodesGroup.add(serverNode);
      
      // Add server lights
      const serverLightsGroup = new THREE.Group();
      for (let i = 0; i < 4; i++) {
        const lightGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const lightMaterial = new THREE.MeshBasicMaterial({ 
          color: 0x4ADE80,
          emissive: 0x4ADE80,
          emissiveIntensity: 1
        });
        const light = new THREE.Mesh(lightGeometry, lightMaterial);
        light.position.set(0.3, -0.5 + i * 0.3, 0.6);
        
        // Add pulsing animation data
        light.userData = {
          pulseSpeed: 0.005 + Math.random() * 0.01,
          pulseOffset: Math.random() * Math.PI * 2
        };
        
        serverLightsGroup.add(light);
      }
      serverNode.add(serverLightsGroup);
      
      // Create satellite nodes
      const nodePositions = [
        { x: -4, y: 2, z: -2, color: 0xEF4444 },
        { x: 4, y: 2, z: -2, color: 0x3B82F6 },
        { x: -4, y: -2, z: -2, color: 0xF59E0B },
        { x: 4, y: -2, z: -2, color: 0x10B981 },
        { x: 0, y: 3, z: -3, color: 0x8B5CF6 },
        { x: 0, y: -3, z: -3, color: 0xEC4899 }
      ];
      
      const nodes = [];
      
      nodePositions.forEach((pos, index) => {
        const nodeGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const nodeMaterial = new THREE.MeshPhongMaterial({ 
          color: pos.color,
          emissive: pos.color,
          emissiveIntensity: 0.2,
          specular: 0xFFFFFF
        });
        const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
        node.position.set(pos.x, pos.y, pos.z);
        nodes.push(node);
        nodesGroup.add(node);
        
        // Add connection to server
        const points = [];
        points.push(new THREE.Vector3(pos.x, pos.y, pos.z));
        points.push(new THREE.Vector3(0, 0, 0));
        
        const connectionGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const connectionMaterial = new THREE.LineBasicMaterial({ 
          color: pos.color,
          transparent: true,
          opacity: 0.6
        });
        
        const connection = new THREE.Line(connectionGeometry, connectionMaterial);
        
        // Add data packet for animation
        const packetGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const packetMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        const packet = new THREE.Mesh(packetGeometry, packetMaterial);
        
        // Add animation properties
        packet.userData = {
          startPoint: new THREE.Vector3(pos.x, pos.y, pos.z),
          endPoint: new THREE.Vector3(0, 0, 0),
          progress: Math.random(),
          speed: 0.01 + Math.random() * 0.01,
          direction: Math.round(Math.random()) * 2 - 1 // -1 or 1
        };
        
        nodesGroup.add(connection);
        nodesGroup.add(packet);
      });
      
      networkScene.add(nodesGroup);
      
      // Add ambient light
      const networkAmbientLight = new THREE.AmbientLight(0xffffff, 0.5);
      networkScene.add(networkAmbientLight);
      
      // Add directional light
      const networkDirectionalLight = new THREE.DirectionalLight(0xffffff, 1);
      networkDirectionalLight.position.set(5, 5, 5);
      networkScene.add(networkDirectionalLight);
      
      // Add network animation
      const animateNetwork = () => {
        nodesGroup.rotation.y += 0.003;
        
        // Animate server lights
        serverLightsGroup.children.forEach(light => {
          const { pulseSpeed, pulseOffset } = light.userData;
          light.material.emissiveIntensity = 0.7 + Math.sin(Date.now() * pulseSpeed + pulseOffset) * 0.3;
        });
        
        // Animate data packets
        nodesGroup.children.forEach(child => {
          if (child.type === 'Mesh' && child.geometry.type === 'SphereGeometry' && child.geometry.parameters.radius === 0.15) {
            const { startPoint, endPoint, progress, speed, direction } = child.userData;
            
            // Update progress
            child.userData.progress = (child.userData.progress + speed) % 1;
            
            // Calculate position
            if (direction === 1) {
              child.position.lerpVectors(startPoint, endPoint, child.userData.progress);
            } else {
              child.position.lerpVectors(endPoint, startPoint, child.userData.progress);
            }
            
            // Scale based on progress for pulse effect
            const scale = 1 + Math.sin(child.userData.progress * Math.PI) * 0.5;
            child.scale.set(scale, scale, scale);
          }
        });
      };
      
      networkScene.userData = { animateNetwork };
      
      // Position camera
      networkCamera.position.set(0, 0, 12);
      
      // Initialize Data Visualization (6th scene)
      const dataVizWidth = dataVizRef.current.clientWidth;
      const dataVizHeight = dataVizRef.current.clientHeight;
      
      const dataVizScene = new THREE.Scene();
      const dataVizCamera = new THREE.PerspectiveCamera(45, dataVizWidth / dataVizHeight, 0.1, 1000);
      const dataVizRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      
      dataVizRenderer.setSize(dataVizWidth, dataVizHeight);
      dataVizRenderer.setClearColor(0x111827, 0);
      dataVizRef.current.appendChild(dataVizRenderer.domElement);
      
      // Create 3D bar chart for compliance history
      const chartGroup = new THREE.Group();
      
      // Create base grid
      const gridGeometry = new THREE.PlaneGeometry(10, 10);
      const gridMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x1F2937,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
      });
      const grid = new THREE.Mesh(gridGeometry, gridMaterial);
      grid.rotation.x = Math.PI / 2;
      grid.position.y = -2;
      chartGroup.add(grid);
      
      // Add grid lines
      for (let i = -5; i <= 5; i += 1) {
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(i, -2, -5),
          new THREE.Vector3(i, -2, 5)
        ]);
        const lineMaterial = new THREE.LineBasicMaterial({ 
          color: 0x4B5563,
          transparent: true,
          opacity: 0.5
        });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        chartGroup.add(line);
        
        const crossLineGeometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-5, -2, i),
          new THREE.Vector3(5, -2, i)
        ]);
        const crossLine = new THREE.Line(crossLineGeometry, lineMaterial);
        chartGroup.add(crossLine);
      }
      
      // Create bars for compliance history
      complianceHistory.forEach((record, index) => {
        const xPos = (index - (complianceHistory.length - 1) / 2) * 1.2;
        const height = (record.score / 100) * 4;
        
        // Determine color based on score
        let barColor;
        if (record.score >= 90) barColor = 0x4ADE80;
        else if (record.score >= 70) barColor = 0xFACC15;
        else barColor = 0xEF4444;
        
        const barGeometry = new THREE.BoxGeometry(0.8, height, 0.8);
        const barMaterial = new THREE.MeshPhongMaterial({ 
          color: barColor,
          transparent: true,
          opacity: 0.9
        });
        const bar = new THREE.Mesh(barGeometry, barMaterial);
        
        // Position from bottom of grid
        bar.position.set(xPos, -2 + height / 2, 0);
        
        // Add hover glow
        bar.userData = {
          originalColor: barColor,
          originalHeight: height,
          targetHeight: height,
          isAnimating: false,
          animationProgress: 0
        };
        
        chartGroup.add(bar);
        
        // Add score label
        const scoreGeometry = new THREE.PlaneGeometry(0.6, 0.3);
        const scoreMaterial = new THREE.MeshBasicMaterial({ 
          color: 0xFFFFFF,
          transparent: true,
          opacity: 0.9,
          side: THREE.DoubleSide
        });
        const scoreLabel = new THREE.Mesh(scoreGeometry, scoreMaterial);
        scoreLabel.position.set(xPos, -2 + height + 0.3, 0);
        chartGroup.add(scoreLabel);
      });
      
      // Set chart rotation for better view
      chartGroup.rotation.x = -Math.PI / 6;
      dataVizScene.add(chartGroup);
      
      // Add floating legend
      const legendGroup = new THREE.Group();
      
      const legendBgGeometry = new THREE.PlaneGeometry(3, 1.5);
      const legendBgMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x1F2937,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
      });
      const legendBg = new THREE.Mesh(legendBgGeometry, legendBgMaterial);
      legendGroup.add(legendBg);
      
      // Add legend items
      const legendItems = [
        { color: 0x4ADE80, label: '90-100' },
        { color: 0xFACC15, label: '70-89' },
        { color: 0xEF4444, label: '0-69' }
      ];
      
      legendItems.forEach((item, index) => {
        const itemGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
        const itemMaterial = new THREE.MeshBasicMaterial({ color: item.color });
        const itemCube = new THREE.Mesh(itemGeometry, itemMaterial);
        itemCube.position.set(-1, 0.5 - index * 0.5, 0.1);
        legendGroup.add(itemCube);
      });
      
      legendGroup.position.set(4, 2, 0);
      dataVizScene.add(legendGroup);
      
      // Add floating stats panel
      const statsGroup = new THREE.Group();
      
      const statsBgGeometry = new THREE.PlaneGeometry(3, 2);
      const statsBgMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x1F2937,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
      });
      const statsBg = new THREE.Mesh(statsBgGeometry, statsBgMaterial);
      statsGroup.add(statsBg);
      
      // Add header bar
      const statsHeaderGeometry = new THREE.PlaneGeometry(3, 0.4);
      const statsHeaderMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x3B82F6,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide
      });
      const statsHeader = new THREE.Mesh(statsHeaderGeometry, statsHeaderMaterial);
      statsHeader.position.set(0, 0.8, 0.01);
      statsGroup.add(statsHeader);
      
      // Add divider lines
      for (let i = 0; i < 3; i++) {
        const dividerGeometry = new THREE.PlaneGeometry(2.8, 0.02);
        const dividerMaterial = new THREE.MeshBasicMaterial({ 
          color: 0x4B5563,
          transparent: true,
          opacity: 0.7,
          side: THREE.DoubleSide
        });
        const divider = new THREE.Mesh(dividerGeometry, dividerMaterial);
        divider.position.set(0, 0.4 - i * 0.5, 0.01);
        statsGroup.add(divider);
      }
      
      statsGroup.position.set(-4, 2, 0);
      dataVizScene.add(statsGroup);
      
      // Animate chart bars
      const animateDataViz = () => {
        chartGroup.rotation.y = Math.sin(Date.now() * 0.001) * 0.1;
        
        // Animate bars
        chartGroup.children.forEach(child => {
          if (child.geometry && child.geometry.type === 'BoxGeometry' && child.geometry.parameters.width === 0.8) {
            // Animation for hover effect
            if (child.userData.isAnimating) {
              child.userData.animationProgress += 0.05;
              if (child.userData.animationProgress >= 1) {
                child.userData.isAnimating = false;
                child.userData.animationProgress = 0;
                child.userData.targetHeight = child.userData.originalHeight;
              }
              
              const height = THREE.MathUtils.lerp(
                child.userData.originalHeight, 
                child.userData.targetHeight, 
                child.userData.animationProgress
              );
              
              child.scale.y = height / child.userData.originalHeight;
              child.position.y = -2 + (height / 2);
            }
            
            // Random hover animation trigger
            if (Math.random() < 0.01 && !child.userData.isAnimating) {
              child.userData.isAnimating = true;
              child.userData.animationProgress = 0;
              child.userData.targetHeight = child.userData.originalHeight * (1 + Math.random() * 0.3);
            }
          }
        });
        
        // Animate legend
        legendGroup.position.y = 2 + Math.sin(Date.now() * 0.001) * 0.1;
        
        // Animate stats panel
        statsGroup.position.y = 2 + Math.sin(Date.now() * 0.001 + Math.PI) * 0.1;
      };
      
      dataVizScene.userData = { animateDataViz };
      
      // Add lighting
      const dataVizAmbientLight = new THREE.AmbientLight(0xffffff, 0.7);
      dataVizScene.add(dataVizAmbientLight);
      
      const dataVizDirectionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      dataVizDirectionalLight.position.set(5, 5, 5);
      dataVizScene.add(dataVizDirectionalLight);
      
      // Position camera
      dataVizCamera.position.set(0, 0, 12);
      
      // Initialize Security Visualization (7th scene)
      const securityWidth = securityRef.current.clientWidth;
      const securityHeight = securityRef.current.clientHeight;
      
      const securityScene = new THREE.Scene();
      const securityCamera = new THREE.PerspectiveCamera(45, securityWidth / securityHeight, 0.1, 1000);
      const securityRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      
      securityRenderer.setSize(securityWidth, securityHeight);
      securityRenderer.setClearColor(0x111827, 0);
      securityRef.current.appendChild(securityRenderer.domElement);
      
      // Create security shield
      const shieldGroup = new THREE.Group();
      
      // Shield base
      const shieldGeometry = new THREE.CircleGeometry(3, 32, 0, Math.PI);
      const shieldMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x3B82F6,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
      });
      const shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
      shieldGroup.add(shield);
      
      // Shield border
      const borderGeometry = new THREE.TorusGeometry(3, 0.2, 16, 32, Math.PI);
      const borderMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x60A5FA,
        emissive: 0x1E40AF,
        emissiveIntensity: 0.5
      });
      const border = new THREE.Mesh(borderGeometry, borderMaterial);
      shieldGroup.add(border);
      
      // Shield center emblem
      const emblemGeometry = new THREE.CircleGeometry(1.5, 32);
      const emblemMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x1E40AF,
        emissive: 0x1E40AF,
        emissiveIntensity: 0.2,
        side: THREE.DoubleSide
      });
      const emblem = new THREE.Mesh(emblemGeometry, emblemMaterial);
      emblem.position.z = 0.1;
      shieldGroup.add(emblem);
      
      // Add security lock icon
      const lockGroup = new THREE.Group();
      
      // Lock body
      const lockBodyGeometry = new THREE.BoxGeometry(0.8, 1, 0.5);
      const lockBodyMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xFFFFFF,
        emissive: 0xFFFFFF,
        emissiveIntensity: 0.2,
      });
      const lockBody = new THREE.Mesh(lockBodyGeometry, lockBodyMaterial);
      lockBody.position.y = -0.2;
      lockGroup.add(lockBody);
      
      // Lock shackle
      const lockShackleGeometry = new THREE.TorusGeometry(0.3, 0.1, 16, 32, Math.PI);
      const lockShackleMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xFFFFFF,
        emissive: 0xFFFFFF,
        emissiveIntensity: 0.2,
      });
      const lockShackle = new THREE.Mesh(lockShackleGeometry, lockShackleMaterial);
      lockShackle.position.y = 0.3;
      lockShackle.rotation.x = Math.PI;
      lockGroup.add(lockShackle);
      
      lockGroup.position.z = 0.2;
      emblem.add(lockGroup);
      
      // Add security scan lines
      const scanLinesGroup = new THREE.Group();
      
      for (let i = 0; i < 10; i++) {
        const scanLineGeometry = new THREE.PlaneGeometry(5, 0.05);
        const scanLineMaterial = new THREE.MeshBasicMaterial({ 
          color: 0x60A5FA,
          transparent: true,
          opacity: 0.3,
          side: THREE.DoubleSide
        });
        const scanLine = new THREE.Mesh(scanLineGeometry, scanLineMaterial);
        scanLine.position.y = -2.5 + i * 0.6;
        scanLine.position.z = -0.5;
        
        // Add animation properties
        scanLine.userData = {
          speed: 0.01 + Math.random() * 0.02,
          opacity: 0.1 + Math.random() * 0.3
        };
        
        scanLinesGroup.add(scanLine);
      }
      
      securityScene.add(scanLinesGroup);
      
      // Add rotating protection rings
      const ringsGroup = new THREE.Group();
      
      for (let i = 0; i < 3; i++) {
        const ringGeometry = new THREE.TorusGeometry(4 - i * 0.5, 0.1, 16, 64);
        const ringMaterial = new THREE.MeshPhongMaterial({ 
          color: 0x93C5FD,
          transparent: true,
          opacity: 0.4 - i * 0.1,
          side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        
        // Set different rotation axis for each ring
        if (i === 0) {
          ring.rotation.x = Math.PI / 2;
        } else if (i === 1) {
          ring.rotation.y = Math.PI / 2;
        }
        
        // Add animation properties
        ring.userData = {
          rotateSpeed: 0.003 + i * 0.002,
          rotationAxis: i % 3
        };
        
        ringsGroup.add(ring);
      }
      
      securityScene.add(ringsGroup);
      
      // Add floating security nodes
      const securityNodesGroup = new THREE.Group();
      
      for (let i = 0; i < 15; i++) {
        const nodeGeometry = new THREE.SphereGeometry(0.15, 16, 16);
        const nodeMaterial = new THREE.MeshPhongMaterial({ 
          color: 0x93C5FD,
          emissive: 0x93C5FD,
          emissiveIntensity: 0.5,
          transparent: true,
          opacity: 0.8
        });
        const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
        
        // Position in spherical pattern
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const radius = 3 + Math.random();
        
        node.position.x = radius * Math.sin(phi) * Math.cos(theta);
        node.position.y = radius * Math.sin(phi) * Math.sin(theta);
        node.position.z = radius * Math.cos(phi);
        
        // Add animation properties
        node.userData = {
          orbitSpeed: 0.005 + Math.random() * 0.01,
          orbitRadius: Math.random() * 0.5,
          orbitOffset: Math.random() * Math.PI * 2,
          pulseSpeed: 0.01 + Math.random() * 0.02
        };
        
        securityNodesGroup.add(node);
      }
      
      securityScene.add(securityNodesGroup);
      
      // Position shield group
      shieldGroup.position.y = 0;
      shieldGroup.rotation.x = Math.PI / 2;
      securityScene.add(shieldGroup);
      
      // Animate security scene
      const animateSecurity = () => {
        // Animate shield
        shieldGroup.rotation.z += 0.003;
        
        // Animate emblem
        emblem.rotation.z -= 0.005;
        
        // Pulse emblem
        emblemMaterial.emissiveIntensity = 0.2 + Math.sin(Date.now() * 0.002) * 0.1;
        
        // Animate scan lines
        scanLinesGroup.children.forEach(line => {
          line.position.y += line.userData.speed;
          if (line.position.y > 3) {
            line.position.y = -3;
          }
          
          line.material.opacity = line.userData.opacity + Math.sin(Date.now() * 0.001) * 0.1;
        });
        
        // Animate protection rings
        ringsGroup.children.forEach(ring => {
          switch(ring.userData.rotationAxis) {
            case 0:
              ring.rotation.x += ring.userData.rotateSpeed;
              break;
            case 1:
              ring.rotation.y += ring.userData.rotateSpeed;
              break;
            case 2:
              ring.rotation.z += ring.userData.rotateSpeed;
              break;
          }
        });
        
        // Animate security nodes
        securityNodesGroup.children.forEach(node => {
          const { orbitSpeed, orbitRadius, orbitOffset, pulseSpeed } = node.userData;
          
          // Orbital motion
          const theta = Date.now() * orbitSpeed + orbitOffset;
          const originalDistance = Math.sqrt(
            node.position.x * node.position.x + 
            node.position.y * node.position.y + 
            node.position.z * node.position.z
          );
          
          const x = node.position.x + Math.cos(theta) * orbitRadius;
          const y = node.position.y + Math.sin(theta) * orbitRadius;
          const z = node.position.z;
          
          // Normalize to maintain distance from center
          const currentDistance = Math.sqrt(x * x + y * y + z * z);
          const factor = originalDistance / currentDistance;
          
          node.position.x = x * factor;
          node.position.y = y * factor;
          node.position.z = z * factor;
          
          // Pulse effect
          node.scale.set(
            1 + Math.sin(Date.now() * pulseSpeed) * 0.3,
            1 + Math.sin(Date.now() * pulseSpeed) * 0.3,
            1 + Math.sin(Date.now() * pulseSpeed) * 0.3
          );
          
          // Opacity pulsing
          node.material.opacity = 0.5 + Math.sin(Date.now() * pulseSpeed * 0.5) * 0.3;
        });
      };
      
      securityScene.userData = { animateSecurity };
      
      // Position camera
      securityCamera.position.set(0, 0, 10);
      
      // Initialize Weather Visualization (8th scene)
      const weatherWidth = weatherRef.current.clientWidth;
      const weatherHeight = weatherRef.current.clientHeight;
      
      const weatherScene = new THREE.Scene();
      const weatherCamera = new THREE.PerspectiveCamera(45, weatherWidth / weatherHeight, 0.1, 1000);
      const weatherRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      
      weatherRenderer.setSize(weatherWidth, weatherHeight);
      weatherRenderer.setClearColor(0x111827, 0);
      weatherRef.current.appendChild(weatherRenderer.domElement);
      
      // Create weather sphere
      const weatherSphereGeometry = new THREE.SphereGeometry(4, 32, 32);
      const weatherSphereMaterial = new THREE.MeshPhongMaterial({
        color: 0x1E3A8A,
        emissive: 0x172554,
        specular: 0x3B82F6,
        shininess: 30,
        opacity: 0.9,
        transparent: true
      });
      const weatherSphere = new THREE.Mesh(weatherSphereGeometry, weatherSphereMaterial);
      weatherScene.add(weatherSphere);
      
      // Add weather effects (e.g., clouds, rain, etc.)
      const cloudsGeometry = new THREE.SphereGeometry(4.1, 32, 32);
      const cloudsMaterial = new THREE.MeshPhongMaterial({
        color: 0xFFFFFF,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
      });
      const clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
      weatherScene.add(clouds);
      
      // Add ambient light
      const weatherAmbientLight = new THREE.AmbientLight(0xffffff, 0.5);
      weatherScene.add(weatherAmbientLight);
      
      // Add directional light
      const weatherDirectionalLight = new THREE.DirectionalLight(0xffffff, 1);
      weatherDirectionalLight.position.set(5, 3, 5);
      weatherScene.add(weatherDirectionalLight);
      
      // Position camera
      weatherCamera.position.z = 10;
      
      // Animate weather scene
      const animateWeather = () => {
        weatherSphere.rotation.y += 0.002;
        clouds.rotation.y += 0.001;
      };
      
      weatherScene.userData = { animateWeather };
      
      // Start animation loop
      const animateAllScenes = () => {
        const animFrameId = requestAnimationFrame(animateAllScenes);
        setAnimationFrame(animFrameId);
        
        // Animate globe scene
        if (globeScene.userData.animateOriginPulse) globeScene.userData.animateOriginPulse();
        if (globeScene.userData.animateDestPulse) globeScene.userData.animateDestPulse();
        if (globeScene.userData.animateRouteParticle) globeScene.userData.animateRouteParticle();
        if (globeScene.userData.animateRestrictionCircle) globeScene.userData.animateRestrictionCircle();
        
        // Animate package scene
        if (packageScene.userData.animateScan) packageScene.userData.animateScan();
        
        // Animate form scene
        if (formScene.userData.animateStamp) formScene.userData.animateStamp();
        
        // Animate compliance scene
        if (complianceScene.userData.animateTicker) complianceScene.userData.animateTicker();
        
        // Animate network scene
        if (networkScene.userData.animateNetwork) networkScene.userData.animateNetwork();
        
        // Animate data visualization scene
        if (dataVizScene.userData.animateDataViz) dataVizScene.userData.animateDataViz();
        
        // Animate security scene
        if (securityScene.userData.animateSecurity) securityScene.userData.animateSecurity();
        
        // Animate weather scene
        if (weatherScene.userData.animateWeather) weatherScene.userData.animateWeather();
        
        // Render all scenes
        globeRenderer.render(globeScene, globeCamera);
        packageRenderer.render(packageScene, packageCamera);
        formRenderer.render(formScene, formCamera);
        complianceRenderer.render(complianceScene, complianceCamera);
        networkRenderer.render(networkScene, networkCamera);
        dataVizRenderer.render(dataVizScene, dataVizCamera);
        securityRenderer.render(securityScene, securityCamera);
        weatherRenderer.render(weatherScene, weatherCamera);
      };
      
      animateAllScenes();
      
      // Cleanup function
      return () => {
        window.removeEventListener('resize', handleResize);
        if (animationFrame) cancelAnimationFrame(animationFrame);
      };
    }
  }, [shipment, complianceResults, countries, complianceHistory]);
  
  return (
    <div className="rapid-compliance-checker">
      <div className="scene-container" ref={globeRef}></div>
      <div className="scene-container" ref={packageRef}></div>
      <div className="scene-container" ref={formRef}></div>
      <div className="scene-container" ref={complianceRef}></div>
      <div className="scene-container" ref={networkRef}></div>
      <div className="scene-container" ref={dataVizRef}></div>
      <div className="scene-container" ref={securityRef}></div>
      <div className="scene-container" ref={weatherRef}></div>
    </div>
  );
};

export default RapidComplianceChecker;