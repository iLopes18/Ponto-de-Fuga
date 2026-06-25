/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  ArrowRight, 
  ArrowUp, 
  ArrowDown, 
  Send, 
  Mail, 
  Layers, 
  Camera, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  Compass,
  RefreshCw
} from 'lucide-react';
import { SpaceSection, Project } from './types';
import { paisagemProjects, retratoProjects, apenasEstarProjects, arquiteturaProjects } from './data';

const getRomanNumeral = (num: number) => {
  const map = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
  return map[num] || num.toString();
};

export const collections = [
  {
    id: 'collection-1',
    folderName: 'col-1',
    title: 'Antes do Amanhã',
    displayTitle: 'Antes do Amanhã',
    categoryLabel: 'Ponto de Fuga I',
    studio: 'ESTÚDIO I',
    studioKey: 'encruzilhada-1',
    description: 'Entre luzes artificiais e conversas esquecidas pelo tempo, Antes do Amanhã captura os rostos, os encontros e a euforia de uma geração suspensa entre a responsabilidade do dia seguinte e a liberdade da noite.',
    projects: retratoProjects,
  },
  {
    id: 'collection-2',
    folderName: 'col-2',
    title: 'Apenas Estar',
    displayTitle: 'Apenas Estar',
    categoryLabel: 'Presença Silenciosa',
    studio: 'ESTÚDIO I',
    studioKey: 'encruzilhada-1',
    description: `Uma câmara, um caminho e nenhuma pressa.
Esta coleção nasceu de um passeio sem mapa, sem plano e sem urgência. São fragmentos de um dia comum, onde a simplicidade se tornou motivo suficiente para parar, observar e existir.
Porque, às vezes, viver é apenas estar.
`,
    projects: apenasEstarProjects,
  },
  {
    id: 'collection-3',
    folderName: 'col-3',
    title: 'Paisagens',
    displayTitle: 'Paisagens Silenciosas',
    categoryLabel: 'Horizontes Contemplativos',
    studio: 'ESTÚDIO II',
    studioKey: 'encruzilhada-2',
    description: 'Névoas em longa exposição, geometrias da natureza e o silêncio vasto capturado sob perspetivas serenas.',
    projects: paisagemProjects,
  },
  {
    id: 'collection-4',
    folderName: 'col-4',
    title: 'Arquitetura',
    displayTitle: 'Arquitetura Brutalista',
    categoryLabel: 'Brutalismo e Espaço',
    studio: 'ESTÚDIO II',
    studioKey: 'encruzilhada-2',
    description: 'A solidez das formas de betão, o jogo rigoroso de sombras e reflexos nas estruturas urbanas contemporâneas.',
    projects: arquiteturaProjects,
  }
].filter(col => col.projects && col.projects.length > 0);

const getCollectionDescription = (photo: Project | null) => {
  if (!photo) return '';
  const col = collections.find(c => c.projects.some(p => p.id === photo.id));
  return col ? col.description : '';
};

export default function App() {
  // Navigation State
  const [section, setSection] = useState<SpaceSection>('vazio');
  const [prevSection, setPrevSection] = useState<SpaceSection>('vazio');
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  
  const [activeWebIndex, setActiveWebIndex] = useState<number>(0);
  const [selectedPhoto, setSelectedPhoto] = useState<Project | null>(null);
  
  // HUD interaction feedback
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Contact Form State
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success'>('idle');

  // Multi-layered visual stars/particles
  type Particle = { id: number; x: number; y: number; speed: number; size: number };
  const [particles, setParticles] = useState<Particle[]>([]);
  const [vazioBrightness, setVazioBrightness] = useState<number>(1.0);

  // Generate unique spatial particles once on mount - reduced to 35 stars for a cleaner, minimalist aesthetic
  useEffect(() => {
    const list: Particle[] = Array.from({ length: 35 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      speed: 0.1 + Math.random() * 0.4,
      size: 0.6 + Math.random() * 1.8,
    }));
    setParticles(list);
  }, []);

  // Multiplier increases star brightness over time while staying on entry/front page ('vazio')
  useEffect(() => {
    if (section !== 'vazio') {
      setVazioBrightness(1.0);
      return;
    }
    
    const interval = setInterval(() => {
      setVazioBrightness(prev => Math.min(prev + 0.04, 3.8));
    }, 120);
    
    return () => clearInterval(interval);
  }, [section]);

  // Mobile responsive detection state
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Track mouse for subtle ambient parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 30,
        y: (e.clientY / window.innerHeight - 0.5) * 30,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Unified camera transition trigger
  const navigateTo = (next: SpaceSection) => {
    if (isTransitioning || section === next) return;
    setIsTransitioning(true);
    setPrevSection(section);
    
    // Smooth timing matching animations
    setTimeout(() => {
      setSection(next);
      setIsTransitioning(false);
    }, 1000);
  };

  // Global Keyboard Navigation (ignores when typing in forms)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isInputFocused) return;
      
      const key = e.key.toUpperCase();
      const code = e.code;
      
      // Track currently down key for the interactive HUD
      setActiveKeys(prev => {
        const next = new Set(prev);
        next.add(key);
        next.add(code);
        return next;
      });

      // Camera navigation mapping
      if (isTransitioning) return;

      if (section === 'vazio') {
        if (key === 'W' || code === 'ArrowUp' || key === ' ' || code === 'Space') {
          navigateTo('encruzilhada-1');
        }
      } else if (section.startsWith('encruzilhada-')) {
        const currentFloor = parseInt(section.split('-')[1]);
        const numFloors = Math.ceil(collections.length / 2);
        const isOdd = collections.length % 2 !== 0;
        const isLastFloor = currentFloor === numFloors;

        const leftIdx = (currentFloor - 1) * 2;
        const rightIdx = leftIdx + 1;
        const leftCol = collections[leftIdx];
        const rightCol = rightIdx < collections.length ? collections[rightIdx] : null;

        if (key === 'A' || code === 'ArrowLeft') {
          navigateTo(leftCol.folderName);
          setActiveWebIndex(0);
        } else if (key === 'D' || code === 'ArrowRight') {
          if (isLastFloor && isOdd) {
            navigateTo('sobre-contacto');
          } else if (rightCol) {
            navigateTo(rightCol.folderName);
            setActiveWebIndex(0);
          }
        } else if (key === 'W' || code === 'ArrowUp') {
          if (!isLastFloor) {
            navigateTo(`encruzilhada-${currentFloor + 1}`);
          } else if (!isOdd) {
            navigateTo('sobre-contacto');
          }
        } else if (key === 'S' || code === 'ArrowDown') {
          if (currentFloor === 1) {
            navigateTo('vazio');
          } else {
            navigateTo(`encruzilhada-${currentFloor - 1}`);
          }
        }
      } else if (collections.some(c => c.folderName === section)) {
        const activeCol = collections.find(c => c.folderName === section)!;
        const projects = activeCol.projects;

        if (selectedPhoto) {
          if (e.key === 'Escape') {
            setSelectedPhoto(null);
          } else if (key === 'A' || code === 'ArrowLeft') {
            const idx = projects.findIndex(p => p.id === selectedPhoto.id);
            const nextIdx = idx === 0 ? projects.length - 1 : idx - 1;
            setSelectedPhoto(projects[nextIdx]);
          } else if (key === 'D' || code === 'ArrowRight') {
            const idx = projects.findIndex(p => p.id === selectedPhoto.id);
            const nextIdx = idx === projects.length - 1 ? 0 : idx + 1;
            setSelectedPhoto(projects[nextIdx]);
          }
        } else {
          if (key === 'S' || code === 'ArrowDown' || e.key === 'Escape') {
            navigateTo(activeCol.studioKey);
          } else if (key === 'A' || code === 'ArrowLeft') {
            setActiveWebIndex(prev => (prev === 0 ? projects.length - 1 : prev - 1));
          } else if (key === 'D' || code === 'ArrowRight') {
            setActiveWebIndex(prev => (prev === projects.length - 1 ? 0 : prev + 1));
          }
        }
      } else if (section === 'sobre-contacto') {
        if (key === 'S' || code === 'ArrowDown' || e.key === 'Escape') {
          const numFloors = Math.ceil(collections.length / 2);
          navigateTo(`encruzilhada-${numFloors}`);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      const code = e.code;
      setActiveKeys(prev => {
        const next = new Set(prev);
        next.delete(key);
        next.delete(code);
        return next;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [section, isTransitioning, isInputFocused, activeWebIndex, selectedPhoto]);

  // Handles mouse wheel / scroll gesture on the homepage as a trigger to advance
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isTransitioning) return;
      if (section === 'vazio' && e.deltaY > 20) {
        navigateTo('encruzilhada-1');
      } else if (section === 'encruzilhada-1' && e.deltaY < -20) {
        navigateTo('vazio');
      } else if (section === 'encruzilhada-1' && e.deltaY > 20) {
        navigateTo('encruzilhada-2');
      } else if (section === 'encruzilhada-2' && e.deltaY < -20) {
        navigateTo('encruzilhada-1');
      } else if (section === 'encruzilhada-2' && e.deltaY > 20) {
        navigateTo('sobre-contacto');
      } else if (section === 'sobre-contacto' && e.deltaY < -20) {
        navigateTo('encruzilhada-2');
      }
    };
    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [section, isTransitioning]);

  // Handle contact form simulation
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setFormStatus('sending');

    const emailTo = "18isaaclopes@gmail.com";
    const subject = encodeURIComponent(`Sinal de comunicado - ${formData.name}`);
    const body = encodeURIComponent(
      `Nome: ${formData.name}\n` +
      `Email original do remetente: ${formData.email}\n\n` +
      `Mensagem:\n${formData.message}`
    );
    const mailtoUrl = `mailto:${emailTo}?subject=${subject}&body=${body}`;

    setTimeout(() => {
      setFormStatus('success');
      window.location.href = mailtoUrl;
      setFormData({ name: '', email: '', message: '' });
    }, 1500);
  };

  // Background visual control depending on section
  const getBackgroundClass = () => {
    if (!isDarkMode) {
      if (section === 'vazio') {
        return 'bg-gradient-to-b from-stone-100 to-zinc-50 text-stone-900';
      }
      return 'bg-stone-50 text-stone-900 font-sans';
    }
    return 'bg-[#050505] text-[#e0e0e0] font-sans';
  };

  const isMobileMainView = isMobile && (section.startsWith('encruzilhada-') || section === 'sobre-contacto');

  return (
    <div 
      id="museum-root"
      className={`relative w-full font-sans uppercase-none transition-colors duration-[1600ms] ease-in-out ${getBackgroundClass()} ${
        isMobileMainView 
          ? 'h-screen overflow-y-auto overflow-x-hidden' 
          : 'h-screen overflow-hidden select-none'
      }`}
    >
      {/* 🌌 Luminous Background Fog / Aura effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {section === 'vazio' ? (
          // Ethereal aura
          <div 
            className="absolute inset-0 opacity-80 mix-blend-multiply filter blur-3xl transition-opacity duration-1000"
            style={{
              background: isDarkMode 
                ? 'radial-gradient(circle at 50% 50%, rgba(20, 20, 20, 0.4) 0%, rgba(5, 5, 5, 1) 100%)'
                : 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 1) 0%, rgba(244, 245, 247, 0.4) 100%)',
              transform: `translate(${mousePosition.x * 0.4}px, ${mousePosition.y * 0.4}px)`,
            }}
          />
        ) : (
          // Elegant Atmosphere: Depth Gradients, Vignette, and Perspective Grid
          <>
            {/* Base depth radial gradient */}
            <div 
              className={`absolute inset-0 transition-opacity duration-1000 ${
                isDarkMode 
                  ? 'bg-[radial-gradient(at_center,#1a1a1a_0%,#000000_100%)] opacity-60' 
                  : 'bg-[radial-gradient(at_center,#fbfbfb_0%,#e7e5e4_100%)] opacity-80'
              }`}
              style={{
                transform: `translate(${mousePosition.x * -0.2}px, ${mousePosition.y * -0.2}px) scale(1.15)`,
              }}
            />
            {/* Top modern light leak */}
            <div className={`absolute top-0 w-full h-[300px] pointer-events-none ${
              isDarkMode ? 'bg-gradient-to-b from-white/5 to-transparent' : 'bg-gradient-to-b from-black/5 to-transparent'
            }`} />
            
            {/* Ambient vignette */}
            <div className={`absolute inset-0 pointer-events-none ${
              isDarkMode ? 'shadow-[inset_0_0_220px_rgba(0,0,0,0.95)]' : 'shadow-[inset_0_0_220px_rgba(255,255,255,0.7)]'
            }`} />



            {/* Deep perspective background names */}
            <div 
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-0"
              style={{
                transform: `translate3d(${mousePosition.x * 0.15}px, ${mousePosition.y * 0.15}px, -180px)`,
              }}
            >
              <h1 className={`font-serif italic font-light text-[11vw] tracking-[0.2em] filter blur-[3px] leading-none mb-[-2.5vw] ${
                isDarkMode ? 'text-white/[0.02]' : 'text-stone-900/[0.02]'
              }`}>ISAAC</h1>
              <h1 className={`font-serif italic font-light text-[11vw] tracking-[0.2em] filter blur-[3px] leading-none ${
                isDarkMode ? 'text-white/[0.02]' : 'text-stone-900/[0.02]'
              }`}>LOPES</h1>
            </div>
          </>
        )}

        {/* Floating 3D Star Dust/Particles */}
        {particles.map((p) => {
          // Accelerate or drift differently depending on camera transition speed
          const speedFactor = isTransitioning ? 25 : 1;
          const scaleFactor = isTransitioning ? 3 : 1;
          const isVazio = section === 'vazio';
          return (
            <motion.div
              key={p.id}
              className={`absolute rounded-full pointer-events-none transition-all duration-1000 ${
                isVazio
                  ? (isDarkMode ? 'bg-white shadow-[0_0_12px_rgba(255,255,255,0.95)]' : 'bg-stone-850/40 shadow-[0_0_10px_rgba(120,113,108,0.5)]')
                  : 'bg-white/45 shadow-[0_0_8px_rgba(255,255,255,0.3)]'
              }`}
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size * scaleFactor}px`,
                height: `${p.size * scaleFactor}px`,
              }}
              animate={{
                y: [0, p.speed * -120 * speedFactor, 0],
                x: [0, p.speed * 40 * (mousePosition.x / 15), 0],
                opacity: isVazio 
                  ? [0.15 * vazioBrightness, Math.min(0.98, 0.65 * vazioBrightness), 0.15 * vazioBrightness]
                  : [0.1, 0.6, 0.1],
              }}
              transition={{
                duration: 10 + p.speed * 15,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          );
        })}
      </div>

      {/* 🏛️ PRIMARY MULTI-LEVEL CAMERA CONTAINER */}
      <div 
        id="camera-view"
        className={`relative w-full z-10 ${
          isMobileMainView 
            ? 'h-auto block pb-20' 
            : 'h-full flex items-center justify-center'
        }`}
        style={{
          perspective: isMobileMainView ? undefined : '1200px',
        }}
      >
        <AnimatePresence mode="wait">
          
          {isMobileMainView ? (
            <motion.div
              key="mobile-collections-list"
              className="w-full flex flex-col items-center select-text px-4 py-8 md:py-16 gap-12 max-w-lg mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30, transition: { duration: 0.5 } }}
            >
              {/* Header */}
              <div className="pt-8 pb-4 text-center">
                <p className={`font-mono text-[9px] tracking-[0.3em] uppercase ${
                  isDarkMode ? 'text-zinc-500' : 'text-stone-450'
                }`}>
                  PORTFÓLIO IMERSIVO // ISAAC LOPES
                </p>
                <h1 className={`font-serif italic font-light text-5xl mt-2.5 tracking-[0.1em] ${
                  isDarkMode ? 'text-white' : 'text-stone-900'
                }`}>
                  Ponto de Fuga
                </h1>
                <div className={`w-8 h-[1px] mx-auto my-5 ${
                  isDarkMode ? 'bg-white/20' : 'bg-stone-300'
                }`} />
                <p className={`font-sans font-light text-xs max-w-sm mx-auto leading-relaxed px-4 ${
                  isDarkMode ? 'text-zinc-400' : 'text-stone-600'
                }`}>
                  Um lugar para onde o olhar pode fugir
                </p>
                <p className={`font-mono text-[8px] tracking-widest mt-6 animate-pulse ${
                  isDarkMode ? 'text-zinc-500' : 'text-stone-400'
                }`}>
                  DESLIZE PARA EXPLORAR ↑
                </p>
              </div>

              {/* Collections List */}
              <div className="w-full flex flex-col gap-10">
                {collections.map((col, idx) => {
                  const tilt = idx % 2 === 0 ? -1.5 : 1.5;
                  const numRoman = getRomanNumeral(idx + 1);
                  return (
                    <motion.div
                      key={col.id}
                      whileHover={{ scale: 1.01, rotate: 0 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => {
                        navigateTo(col.folderName);
                        setActiveWebIndex(0);
                      }}
                      className={`w-full max-w-md rounded border p-4 cursor-pointer transition-all duration-300 ${
                        isDarkMode 
                          ? 'bg-[#0a0a0a] border-white/5 active:border-white/20' 
                          : 'bg-stone-50 border-stone-200 active:border-stone-850 shadow-sm'
                      }`}
                      style={{
                        transform: `rotate(${tilt}deg)`
                      }}
                    >
                      <div className="aspect-[4/3] w-full overflow-hidden rounded relative bg-stone-900 mb-4 group">
                        <img 
                          src={col.projects[0]?.image || ''} 
                          alt={col.title}
                          className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-500 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-4 flex justify-between items-end">
                          <span className="font-mono text-[8px] tracking-[0.2em] text-white/50">VER COLECÇÃO</span>
                          <ArrowRight className="w-3.5 h-3.5 text-white/80 rotate-[-45deg]" />
                        </div>
                      </div>
                      
                      <span className={`font-mono text-[9px] tracking-[0.25em] block mb-1 ${
                        isDarkMode ? 'text-zinc-500' : 'text-stone-450'
                      }`}>
                        {`SÉRIE ${numRoman}`}
                      </span>
                      
                      <h3 className={`font-serif italic text-xl font-light tracking-wide transition-colors ${
                        isDarkMode ? 'text-white' : 'text-stone-900 font-bold'
                      }`}>
                        {col.title}
                      </h3>
                      
                      <p className={`font-sans font-light text-xs leading-relaxed mt-2 ${
                        isDarkMode ? 'text-zinc-400' : 'text-stone-600'
                      }`}>
                        {col.description}
                      </p>
                    </motion.div>
                  );
                })}
              </div>

              {/* Bio & Contact Form Block */}
              <div className={`w-full max-w-md border-t pt-10 mt-6 ${
                isDarkMode ? 'border-white/10' : 'border-stone-200'
              }`}>
                <div className="text-center mb-8">
                  <p className={`font-mono text-[9px] tracking-[0.3em] uppercase ${
                    isDarkMode ? 'text-zinc-500' : 'text-stone-450'
                  }`}>
                    SOBRE MIM // DIÁLOGOS
                  </p>
                  <h2 className={`font-serif italic font-light text-3xl mt-1.5 ${
                    isDarkMode ? 'text-zinc-150' : 'text-stone-850 font-bold'
                  }`}>
                    Identidade &amp; Vínculo
                  </h2>
                </div>

                {/* Bio Card */}
                <div className={`border p-6 rounded mb-8 ${
                  isDarkMode ? 'border-white/10 bg-[#080808]/60' : 'border-stone-200 bg-stone-50 shadow-xs'
                }`}>
                  <h4 className={`font-serif italic text-lg font-light tracking-wide mb-3 ${
                    isDarkMode ? 'text-white' : 'text-stone-900 font-bold'
                  }`}>
                    Registos de uma fuga contínua.
                  </h4>
                  <p className={`font-sans font-light text-xs leading-relaxed ${
                    isDarkMode ? 'text-zinc-300' : 'text-stone-700'
                  }`}>
                    Chamo-me <strong className={`font-serif italic tracking-wide ${isDarkMode ? 'text-white' : 'text-stone-950 font-bold'}`}>Isaac Lopes</strong>. 
                  </p>
                  <p className={`font-sans font-light text-xs leading-relaxed mt-2.5 ${
                    isDarkMode ? 'text-zinc-300' : 'text-stone-700'
                  }`}>
                    O Ponto de Fuga é um arquivo pessoal de observações. Aqui reúno fotografias, projetos e experiências que marcaram a forma como vejo o mundo.
                  </p>
                  <p className={`font-sans font-light text-xs leading-relaxed mt-2.5 ${
                    isDarkMode ? 'text-zinc-300' : 'text-stone-700'
                  }`}>
                    Cada coleção nasce de uma curiosidade diferente: as pessoas que habitam um espaço, a tranquilidade de um passeio sem destino, a presença silenciosa dos animais ou a identidade escondida na arquitetura do quotidiano.
                  </p>
                  <p className={`font-sans font-light text-xs leading-relaxed mt-2.5 ${
                    isDarkMode ? 'text-zinc-300' : 'text-stone-700'
                  }`}>
                    Um lugar para guardar aquilo que merece um segundo olhar.
                  </p>
                  <div className={`mt-5 flex flex-col gap-1.5 font-mono text-[9px] border-t pt-4 ${
                    isDarkMode ? 'border-white/10 text-zinc-500' : 'border-stone-200 text-stone-450 font-bold'
                  }`}>
                    <span className="flex items-center gap-2">
                      <span className={`w-1 h-1 rounded-full ${isDarkMode ? 'bg-white/60' : 'bg-stone-700'}`} /> PORTUGAL, EUROPA // UTC
                    </span>
                    <span className="flex items-center gap-2">
                      <span className={`w-1 h-1 rounded-full ${isDarkMode ? 'bg-white/60' : 'bg-stone-700'}`} /> DISPONÍVEL PARA ALIANÇAS CRIATIVAS
                    </span>
                    <span className="flex items-center gap-2">
                      <span className={`w-1 h-1 rounded-full ${isDarkMode ? 'bg-white/60' : 'bg-stone-700'}`} /> EMAIL // <a href="mailto:18isaaclopes@gmail.com" className={`underline transition-colors lowercase font-sans text-xs ${isDarkMode ? 'hover:text-white text-zinc-300' : 'hover:text-stone-900 text-stone-700'}`}>18isaaclopes@gmail.com</a>
                    </span>
                  </div>
                </div>

                {/* Contact Form Card */}
                <div className={`border p-6 rounded ${
                  isDarkMode ? 'border-white/10 bg-[#080808]/60' : 'border-stone-200 bg-white shadow-xs'
                }`}>
                  <h4 className={`font-serif italic text-lg font-light tracking-wide mb-1 ${
                    isDarkMode ? 'text-white' : 'text-stone-900 font-bold'
                  }`}>
                    Inicie uma Conversa
                  </h4>
                  <p className={`font-mono text-[8px] tracking-wider mb-5 ${
                    isDarkMode ? 'text-zinc-500' : 'text-stone-400 font-semibold'
                  }`}>
                    PROPONHA UM PROJETO OU PARTILHE UMA REFLEXÃO
                  </p>

                  {formStatus === 'success' ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${
                        isDarkMode ? 'bg-white text-black bg-[#0d0d0d]' : 'bg-stone-900 text-stone-50'
                      }`}>
                        <Send className="w-4 h-4" />
                      </div>
                      <h5 className={`font-serif italic text-lg font-light ${
                        isDarkMode ? 'text-white' : 'text-stone-900 font-bold'
                      }`}>Mensagem Entregue</h5>
                      <p className={`font-sans font-light text-[11px] mt-1.5 leading-relaxed ${
                        isDarkMode ? 'text-zinc-400' : 'text-stone-600'
                      }`}>
                        Agradeço a partilha de energia. Entrarei em contacto por correio eletrónico com a celeridade que o silêncio permitir.
                      </p>
                      <button 
                        onClick={() => setFormStatus('idle')}
                        className={`font-mono text-[8px] tracking-widest border px-3 py-1.5 rounded-full mt-4 transition-all cursor-pointer ${
                          isDarkMode 
                            ? 'text-white border-white/10 hover:border-white/30 bg-white/5' 
                            : 'text-stone-600 border-stone-300 hover:border-stone-850 bg-stone-100 hover:bg-stone-200'
                        }`}
                      >
                        ENVIAR NOVA CORRESPONDÊNCIA
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div>
                        <label className={`font-mono text-[8.5px] block tracking-widest mb-1 ${
                          isDarkMode ? 'text-zinc-400' : 'text-stone-500 font-bold'
                        }`}>
                          NOME
                        </label>
                        <input 
                          type="text"
                          required
                          placeholder="Ex: Alberto Caeiro"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          onFocus={() => setIsInputFocused(true)}
                          onBlur={() => setIsInputFocused(false)}
                          className={`w-full rounded p-2.5 text-xs font-sans font-light focus:outline-none transition-all duration-300 ${
                            isDarkMode 
                              ? 'bg-[#0d0d0d] border border-white/10 text-zinc-100 focus:border-white/45' 
                              : 'bg-stone-100 border border-stone-300 text-stone-900 focus:border-stone-800'
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`font-mono text-[8.5px] block tracking-widest mb-1 ${
                          isDarkMode ? 'text-zinc-400' : 'text-stone-500 font-bold'
                        }`}>
                          ENDEREÇO ELETRÓNICO (EMAIL)
                        </label>
                        <input 
                          type="email"
                          required
                          placeholder="Ex: alberto@estrada.pt"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          onFocus={() => setIsInputFocused(true)}
                          onBlur={() => setIsInputFocused(false)}
                          className={`w-full rounded p-2.5 text-xs font-sans font-light focus:outline-none transition-all duration-300 ${
                            isDarkMode 
                              ? 'bg-[#0d0d0d] border border-white/10 text-zinc-100 focus:border-white/45' 
                              : 'bg-stone-100 border border-stone-300 text-stone-900 focus:border-stone-800'
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`font-mono text-[8.5px] block tracking-widest mb-1 ${
                          isDarkMode ? 'text-zinc-400' : 'text-stone-500 font-bold'
                        }`}>
                          DESCRIÇÃO DA IDEIA OU DIÁLOGO
                        </label>
                        <textarea 
                          rows={4}
                          required
                          placeholder="Escreva aqui sobre os seus objetivos e como posso colaborar..."
                          value={formData.message}
                          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                          onFocus={() => setIsInputFocused(true)}
                          onBlur={() => setIsInputFocused(false)}
                          className={`w-full rounded p-2.5 text-xs font-sans font-light focus:outline-none transition-all duration-300 resize-none ${
                            isDarkMode 
                              ? 'bg-[#0d0d0d] border border-white/10 text-zinc-100 focus:border-white/45' 
                              : 'bg-stone-100 border border-stone-300 text-stone-900 focus:border-stone-850'
                          }`}
                        />
                      </div>

                      <button 
                        type="submit"
                        disabled={formStatus === 'sending'}
                        className={`w-full font-mono text-[9px] tracking-widest py-3 rounded flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 ${
                          isDarkMode 
                            ? 'bg-white text-black hover:bg-zinc-200' 
                            : 'bg-stone-900 text-stone-50 hover:bg-stone-850'
                        }`}
                      >
                        {formStatus === 'sending' ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>A EXPEDIR MENSAGEM...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3" />
                            <span>DISPARAR SINAL DE COMUNICADO</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <>
              {/* ================= SECTION 1: PONTO DE FUGA ================= */}
              {section === 'vazio' && (
            <motion.div
              key="vazio"
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ 
                opacity: 0,
                scale: 2.8,
                filter: 'blur(20px)',
                transition: { duration: 1.3, ease: [0.7, 0, 0.3, 1] }
              }}
            >
              {/* Floating Ethereal Typography */}
              <div 
                className="relative text-center z-20 flex flex-col items-center px-6 transition-transform duration-300"
                style={{
                  transform: `translate3d(${mousePosition.x * 0.8}px, ${mousePosition.y * 0.8}px, 0)`,
                }}
              >
                {/* Visual indicator of the ethereal gate */}
                <motion.div
                  className={`w-1.5 h-1.5 rounded-full mb-8 opacity-45 animate-pulse ${
                    isDarkMode ? 'bg-white' : 'bg-stone-800'
                  }`}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: [1, 1.8, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />

                <h1 
                  id="artist-name"
                  className={`font-serif italic font-light tracking-[0.25em] text-5xl md:text-8xl lg:text-9xl transition-colors duration-[1600ms] filter drop-shadow-sm select-none ${
                    isDarkMode ? 'text-white' : 'text-stone-900'
                  }`}
                  style={{ wordSpacing: '0.2em' }}
                >
                  Isaac Lopes
                </h1>
                
                <p 
                  id="curator-tagline"
                  className={`font-mono text-xs md:text-sm tracking-[0.4em] mt-6 max-w-xl text-center leading-relaxed transition-colors duration-[1600ms] ${
                    isDarkMode ? 'text-zinc-400' : 'text-stone-500'
                  }`}
                >
                  Portfólio Imersivo
                </p>
                
                {/* Beautiful entry CTA */}
                <div id="entry-action-trigger" className="mt-16 flex flex-col items-center cursor-pointer group" onClick={() => navigateTo('encruzilhada-1')}>
                  <div className={`relative w-12 h-12 flex items-center justify-center rounded-full border transition-all duration-300 ${
                    isDarkMode 
                      ? 'border-white/10 group-hover:border-white group-hover:bg-white/5' 
                      : 'border-stone-200 group-hover:border-stone-900 group-hover:bg-stone-900/5'
                  }`}>
                    <ArrowUp className={`w-4 h-4 transition-all duration-300 ${
                      isDarkMode 
                        ? 'text-zinc-400 group-hover:text-white group-hover:translate-y-[-2px]' 
                        : 'text-stone-500 group-hover:text-stone-900 group-hover:translate-y-[-2px]'
                    }`} />
                  </div>
                  <span className={`font-mono text-[10px] tracking-[0.25em] mt-3 transition-colors duration-300 ${
                    isDarkMode ? 'text-zinc-500 group-hover:text-zinc-300' : 'text-stone-400 group-hover:text-stone-700'
                  }`}>
                    {isMobile ? 'CLICAR PARA ENTRAR' : 'PRESSIONAR [↑] OU CLICAR PARA ENTRAR'}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
             {/* =================             {/* ================= DYNAMIC FLOOR (CROSSROAD) SECTIONS ================= */}
          {section.startsWith('encruzilhada-') && (() => {
            const currentFloor = parseInt(section.split('-')[1]);
            const numFloors = Math.ceil(collections.length / 2);
            const isOdd = collections.length % 2 !== 0;
            const isLastFloor = currentFloor === numFloors;

            const leftIdx = (currentFloor - 1) * 2;
            const rightIdx = leftIdx + 1;

            const leftCol = collections[leftIdx];
            const rightCol = rightIdx < collections.length ? collections[rightIdx] : null;

            return (
              <motion.div
                key={`floor-${currentFloor}`}
                className={`absolute inset-0 flex flex-col justify-between items-center p-8 md:p-14 z-10 transition-colors duration-1000 ${
                  isDarkMode ? 'text-zinc-100' : 'text-stone-900'
                }`}
                initial={{ opacity: 0, scale: 0.7, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ 
                  opacity: 0, 
                  scale: 1.2, 
                  filter: 'blur(8px)',
                  transition: { duration: 0.8, ease: 'easeInOut' }
                }}
                style={{
                  transform: `rotateY(${mousePosition.x * -0.05}deg) rotateX(${mousePosition.y * 0.05}deg)`,
                }}
              >
                {/* Header Info */}
                <div className="w-full flex justify-between items-center z-10">
                  <span className={`font-serif italic font-light tracking-wide text-lg md:text-xl transition-colors ${
                    isDarkMode ? 'text-[#e0e0e0]/80' : 'text-stone-800'
                  }`}>
                    Isaac Lopes <span className="font-mono text-xs not-italic ml-2 opacity-50">// Estúdio {getRomanNumeral(currentFloor)}</span>
                  </span>
                  <span className={`font-mono text-[10px] tracking-[0.4em] transition-colors uppercase ${
                    isDarkMode ? 'text-white/40' : 'text-stone-500/50'
                  }`}>
                    {rightCol ? `${leftCol.title.toUpperCase()} E ${rightCol.title.toUpperCase()}` : `${leftCol.title.toUpperCase()} E CONTACTO`}
                  </span>
                </div>

                {/* Central Area: Left / Right Options as a physical corridor */}
                <div 
                  id={`crossroad-choices-${currentFloor}`}
                  className="w-full max-w-6xl flex-grow grid grid-cols-1 md:grid-cols-12 gap-8 items-center justify-center my-auto relative z-20 overflow-hidden px-4"
                  style={{ perspective: '1600px' }}
                >
                  {/* Corredor Parede Esquerda: Left Collection */}
                  <div 
                    className="md:col-span-4 flex flex-col items-center md:items-end justify-center text-center md:text-right cursor-pointer group p-6 transition-all duration-500 hover:z-30 rounded-lg hover:bg-stone-500/5"
                    style={{
                      transform: `rotateY(${24 + mousePosition.x * -0.05}deg) translateZ(-40px)`,
                      transformStyle: 'preserve-3d'
                    }}
                    onClick={() => { navigateTo(leftCol.folderName); setActiveWebIndex(0); }}
                  >
                    <span className={`text-[9px] tracking-[0.5em] uppercase mb-3 transition-colors ${
                      isDarkMode ? 'text-white/30' : 'text-stone-550/40'
                    }`}>{leftCol.categoryLabel}</span>
                    
                    <h3 className={`font-serif italic text-3xl md:text-4xl font-light transition-all tracking-wide ${
                      isDarkMode ? 'text-white/80 group-hover:text-white' : 'text-stone-800 group-hover:text-black'
                    }`}>
                      {leftCol.title.toUpperCase()}
                    </h3>
                    
                    <div className={`w-12 h-[1px] mt-3 mb-4 transition-all self-center md:self-end ${
                      isDarkMode ? 'bg-white/20 group-hover:bg-white group-hover:w-20' : 'bg-stone-300 group-hover:bg-stone-900 group-hover:w-20'
                    }`} />
                    
                    <p className={`font-mono text-[10px] leading-relaxed tracking-wider max-w-[240px] transition-colors ${
                      isDarkMode ? 'text-zinc-400 group-hover:text-zinc-350' : 'text-stone-600 group-hover:text-stone-800'
                    }`}>
                      {leftCol.description}
                    </p>
                    
                    <div className={`mt-5 flex items-center justify-center md:justify-end gap-2 transition-colors ${
                      isDarkMode ? 'text-zinc-400 group-hover:text-white' : 'text-stone-500 group-hover:text-stone-950'
                    }`}>
                      <span className="font-mono text-[9px] tracking-widest mr-1 group-hover:mr-3 transition-all">
                        ABRIR {leftCol.title.toUpperCase()} {!isMobile}
                      </span>
                      <ArrowLeft className="w-3 h-3" />
                    </div>
                  </div>

                  {/* Corredor Meio: Piso de Prespetiva & Portal */}
                  <div 
                    className="md:col-span-4 flex flex-col items-center justify-center relative py-4"
                    style={{
                      transform: `translateZ(20px)`,
                      transformStyle: 'preserve-3d'
                    }}
                  >
                    {/* Central perspective lines going towards horizon */}
                    <div className="absolute inset-0 hidden md:flex items-center justify-center pointer-events-none">
                      <div className={`w-full h-[1px] opacity-25 bg-gradient-to-r from-transparent via-stone-400 to-transparent`} />
                    </div>

                    {(!isLastFloor || !isOdd) && (
                      <div 
                        onClick={() => navigateTo(isLastFloor ? 'sobre-contacto' : `encruzilhada-${currentFloor + 1}`)}
                        className="relative cursor-pointer group flex flex-col items-center p-8 rounded-lg transition-all duration-500 w-full max-w-[280px]"
                      >
                        {/* Glowing gate outline representing corridor depth */}
                        <div className={`absolute inset-0 rounded-lg border transition-all duration-1000 ${
                          isDarkMode 
                            ? 'border-white/10 group-hover:border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.03)] group-hover:shadow-[0_0_25px_rgba(255,255,255,0.12)] bg-white/[0.01]' 
                            : 'border-stone-200 group-hover:border-stone-600 shadow-sm group-hover:shadow-[0_0_20px_rgba(0,0,0,0.05)] bg-black/[0.01]'
                         }`} />

                        <div className="relative z-10 flex flex-col items-center text-center">
                          <span className={`text-[8px] tracking-[0.4em] uppercase font-mono mb-2 block ${isDarkMode ? 'text-zinc-500' : 'text-stone-400'}`}>
                            {isLastFloor ? 'SOBRE MIM' : `ESTÚDIO ${getRomanNumeral(currentFloor + 1)}`}
                          </span>
                          <h4 className={`font-serif italic text-lg md:text-xl font-light tracking-wide ${isDarkMode ? 'text-[#e0e0e0] group-hover:text-white' : 'text-stone-800 group-hover:text-black font-semibold'}`}>
                            {isLastFloor 
                              ? 'CONTACTO' 
                              : collections[2 * currentFloor] ? `${collections[2 * currentFloor].title.toUpperCase()} & ${collections[2 * currentFloor + 1] ? collections[2 * currentFloor + 1].title.toUpperCase() : 'CONTACTO'}` : ''
                            }
                          </h4>
                          
                          {/* Luminous indicator arrow/dot */}
                          <div className="my-4 relative w-6 h-6 flex items-center justify-center">
                            <div className={`absolute w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'bg-stone-900'} group-hover:scale-150 transition-transform duration-500`} />
                            <div className={`absolute w-4 h-4 rounded-full border border-dashed animate-spin ${isDarkMode ? 'border-white/30' : 'border-stone-900/30'}`} />
                          </div>

                          <span className={`font-mono text-[8px] tracking-[0.2em] uppercase leading-relaxed ${isDarkMode ? 'text-zinc-650' : 'text-stone-400'}`}>
                            SEGUIR ADIANTE {!isMobile && '[↑]'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Corredor Parede Direita: Right Collection OR Contacts (if odd and last floor) */}
                  {rightCol ? (
                    <div 
                      className="md:col-span-4 flex flex-col items-center md:items-start justify-center text-center md:text-left cursor-pointer group p-6 transition-all duration-500 hover:z-30 rounded-lg hover:bg-stone-500/5"
                      style={{
                        transform: `rotateY(${-24 + mousePosition.x * -0.05}deg) translateZ(-40px)`,
                        transformStyle: 'preserve-3d'
                      }}
                      onClick={() => { navigateTo(rightCol.folderName); setActiveWebIndex(0); }}
                    >
                      <span className={`text-[9px] tracking-[0.5em] uppercase mb-3 transition-colors ${
                        isDarkMode ? 'text-white/30' : 'text-stone-550/40'
                      }`}>{rightCol.categoryLabel}</span>
                      
                      <h3 className={`font-serif italic text-3xl md:text-4xl font-light transition-all tracking-wide ${
                        isDarkMode ? 'text-white/80 group-hover:text-white' : 'text-stone-800 group-hover:text-black'
                      }`}>
                        {rightCol.title.toUpperCase()}
                      </h3>
                      
                      <div className={`w-12 h-[1px] mt-3 mb-4 transition-all self-center md:self-start ${
                        isDarkMode ? 'bg-white/20 group-hover:bg-white group-hover:w-20' : 'bg-stone-300 group-hover:bg-stone-900 group-hover:w-20'
                      }`} />
                      
                      <p className={`font-mono text-[10px] leading-relaxed tracking-wider max-w-[240px] transition-colors ${
                        isDarkMode ? 'text-zinc-400 group-hover:text-zinc-350' : 'text-stone-600 group-hover:text-stone-800'
                      }`}>
                        {rightCol.description}
                      </p>
                      
                      <div className={`mt-5 flex items-center justify-center md:justify-start gap-2 transition-colors ${
                        isDarkMode ? 'text-zinc-400 group-hover:text-white' : 'text-stone-500 group-hover:text-stone-950'
                      }`}>
                        <ArrowRight className="w-3 h-3" />
                        <span className="font-mono text-[9px] tracking-widest ml-1 group-hover:mr-3 transition-all">
                          ABRIR {rightCol.title.toUpperCase()} {!isMobile}
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* ODD FLOOR LAYOUT OPTION: Contacts occupying space on right side of last collection! */
                    <div 
                      className="md:col-span-4 flex flex-col items-center md:items-start justify-center text-center md:text-left cursor-pointer group p-6 transition-all duration-500 hover:z-30 rounded-lg hover:bg-stone-500/5"
                      style={{
                        transform: `rotateY(${-24 + mousePosition.x * -0.05}deg) translateZ(-40px)`,
                        transformStyle: 'preserve-3d'
                      }}
                      onClick={() => { navigateTo('sobre-contacto'); }}
                    >
                      <span className={`text-[9px] tracking-[0.5em] uppercase mb-3 transition-colors ${
                        isDarkMode ? 'text-white/30' : 'text-stone-550/40'
                      }`}>CONVERSAS &amp; PARCERIAS</span>
                      
                      <h3 className={`font-serif italic text-3xl md:text-4xl font-light transition-all tracking-wide ${
                        isDarkMode ? 'text-white/80 group-hover:text-white' : 'text-stone-800 group-hover:text-black'
                      }`}>
                        CONTACTO
                      </h3>
                      
                      <div className={`w-12 h-[1px] mt-3 mb-4 transition-all self-center md:self-start ${
                        isDarkMode ? 'bg-white/20 group-hover:bg-white group-hover:w-20' : 'bg-stone-300 group-hover:bg-stone-900 group-hover:w-20'
                      }`} />
                      
                      <p className={`font-mono text-[10px] leading-relaxed tracking-wider max-w-[240px] transition-colors ${
                        isDarkMode ? 'text-zinc-400 group-hover:text-zinc-350' : 'text-stone-600 group-hover:text-stone-800'
                      }`}>
                        Inicie uma conversa, proponha um novo projeto criativo ou partilhe as suas reflexões artísticas e críticas.
                      </p>
                      
                      <div className={`mt-5 flex items-center justify-center md:justify-start gap-2 transition-colors ${
                        isDarkMode ? 'text-zinc-400 group-hover:text-white' : 'text-stone-500 group-hover:text-stone-950'
                      }`}>
                        <ArrowRight className="w-3 h-3" />
                        <span className="font-mono text-[9px] tracking-widest ml-1 group-hover:mr-3 transition-all">
                          ABRIR CONTACTOS {!isMobile}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Perspective Guide & controls */}
                <div className="w-full flex flex-col items-center gap-2 relative z-20">
                  <div className="flex gap-4 mb-2">
                    <button 
                      onClick={() => { navigateTo(leftCol.folderName); setActiveWebIndex(0); }}
                      className={`font-mono text-[10px] p-2 hover:font-bold border rounded-full transition-all cursor-pointer ${
                        isDarkMode ? 'border-white/10 text-zinc-400 hover:text-white bg-white/5' : 'border-stone-200 text-stone-600 hover:text-stone-900 bg-black/5'
                      }`}
                    >
                      [←] {leftCol.title.toUpperCase()}
                    </button>
                    {(!isLastFloor || !isOdd) && (
                      <button 
                        onClick={() => navigateTo(isLastFloor ? 'sobre-contacto' : `encruzilhada-${currentFloor + 1}`)}
                        className={`font-mono text-[10px] p-2 hover:font-bold border rounded-full transition-all cursor-pointer ${
                          isDarkMode ? 'border-white/10 text-zinc-400 hover:text-white bg-white/5' : 'border-stone-200 text-stone-600 hover:text-stone-900 bg-black/5'
                        }`}
                      >
                        [↑] AVANÇAR
                      </button>
                    )}
                    {rightCol ? (
                      <button 
                        onClick={() => { navigateTo(rightCol.folderName); setActiveWebIndex(0); }}
                        className={`font-mono text-[10px] p-2 hover:font-bold border rounded-full transition-all cursor-pointer ${
                          isDarkMode ? 'border-white/10 text-zinc-400 hover:text-white bg-white/5' : 'border-stone-200 text-stone-600 hover:text-stone-900 bg-black/5'
                        }`}
                      >
                        [→] {rightCol.title.toUpperCase()}
                      </button>
                    ) : (
                      <button 
                        onClick={() => navigateTo('sobre-contacto')}
                        className={`font-mono text-[10px] p-2 hover:font-bold border rounded-full transition-all cursor-pointer ${
                          isDarkMode ? 'border-white/10 text-zinc-400 hover:text-white bg-white/5' : 'border-stone-200 text-stone-600 hover:text-stone-900 bg-black/5'
                        }`}
                      >
                        [→] CONTACTO
                      </button>
                    )}
                  </div>
                  {!isMobile && (
                    <p className={`font-mono text-[8px] tracking-widest ${
                      isDarkMode ? 'text-white/25' : 'text-stone-900/40'
                    }`}>Teclado [←] Esquerda // [→] Direita {(!isLastFloor || !isOdd) && '// [↑] Avançar'}</p>
                  )}
                </div>

                <div className={`w-full flex justify-between items-center font-mono text-[9px] tracking-[0.25em] border-t pt-4 mt-4 transition-colors ${
                  isDarkMode ? 'border-white/10 text-zinc-500' : 'border-stone-200 text-stone-400'
                }`}>
                  <span onClick={() => navigateTo(currentFloor === 1 ? 'vazio' : `encruzilhada-${currentFloor - 1}`)} className="cursor-pointer hover:font-bold">
                    {isMobile 
                      ? (currentFloor === 1 ? 'VOLTAR AO INÍCIO' : `REVERTER PARA O ESTÚDIO ${getRomanNumeral(currentFloor - 1)}`) 
                      : `ESC / [↓] ${currentFloor === 1 ? 'VOLTAR AO INÍCIO' : `REVERTER PARA O ESTÚDIO ${getRomanNumeral(currentFloor - 1)}`}`
                    }
                  </span>
                  <span>{`ESTÚDIO ${getRomanNumeral(currentFloor)} // ${currentFloor === 1 ? 'PISO PRINCIPAL' : 'PISO SUPERIOR'}`}</span>
                </div>
              </motion.div>
            );
          })()}

          {/* ================= DYNAMIC GALLERY SECTION ================= */}
          {collections.some(c => c.folderName === section) && (() => {
            const activeCol = collections.find(c => c.folderName === section)!;
            const projects = activeCol.projects;

            return (
              <motion.div
                key={activeCol.folderName}
                className={`absolute inset-0 flex flex-col justify-between p-6 md:p-14 z-10 w-full transition-colors duration-1000 ${
                  isDarkMode ? 'text-zinc-100' : 'text-stone-900'
                }`}
                initial={{ opacity: 0, x: -100, filter: 'blur(8px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ 
                  opacity: 0,
                  x: -150,
                  filter: 'blur(10px)',
                  transition: { duration: 0.8 }
                }}
              >
                {/* Gallery Header */}
                <div className="w-full flex justify-between items-start z-20">
                  <div className="flex flex-col">
                    <div className={`flex items-center gap-2 font-mono text-xs tracking-widest ${
                      isDarkMode ? 'text-zinc-500' : 'text-stone-450'
                    }`}>
                      <span className={`cursor-pointer transition-colors ${
                        isDarkMode ? 'hover:text-zinc-100' : 'hover:text-stone-950 hover:font-bold'
                      }`} onClick={() => navigateTo(activeCol.studioKey)}>ISAAC LOPES</span>
                      <span>/</span>
                      <span className={`cursor-pointer transition-colors ${
                        isDarkMode ? 'hover:text-zinc-100' : 'hover:text-stone-950 hover:font-bold'
                      }`} onClick={() => navigateTo(activeCol.studioKey)}>{activeCol.studio}</span>
                    </div>
                    <h3 className={`font-serif italic text-2xl md:text-3xl font-light mt-1.5 transition-colors ${
                      isDarkMode ? 'text-white' : 'text-stone-900 font-bold'
                    }`}>{activeCol.title}</h3>
                  </div>
                  
                  <button 
                    id={`close-${activeCol.folderName}-btn`}
                    onClick={() => navigateTo(activeCol.studioKey)}
                    className={`flex items-center gap-2 border p-2 md:px-4 md:py-2 rounded-full font-mono text-[10px] tracking-widest transition-all cursor-pointer ${
                      isDarkMode 
                        ? 'border-white/10 hover:border-white/40 text-zinc-400 hover:text-white' 
                        : 'border-stone-300 hover:border-stone-800 text-stone-500 hover:text-stone-900 bg-white/40'
                    }`}
                  >
                    <X className="w-4 h-4" /> 
                    <span className="hidden sm:inline">VOLTAR [↓]</span>
                  </button>
                </div>

                {/* Centered Gallery Layout */}
                <div className="relative w-full max-w-3xl mx-auto flex-1 flex flex-col items-center justify-center gap-6 z-10 px-4 md:px-0 my-4">
                  
                  {/* CENTERED: Perspective and Selected card slider */}
                  <div className="w-full relative min-h-[300px] h-[48vh] sm:h-[52vh] flex items-center justify-center">
                    <div className={`absolute inset-0 pointer-events-none ${
                      isDarkMode ? 'bg-radial-gradient from-zinc-000/50 to-transparent' : 'bg-radial-gradient from-stone-200/40 to-transparent'
                    }`} />
                    
                    {projects.map((proj, idx) => {
                      const offset = idx - activeWebIndex;
                      const isSelected = offset === 0;
                      
                      if (Math.abs(offset) > 2) return null;

                      return (
                        <motion.div
                          key={proj.id}
                          className={`absolute w-fit max-w-[85vw] h-auto flex flex-col rounded overflow-hidden shadow-3xl border transition-colors ${
                            isDarkMode 
                              ? 'bg-[#101010]/95 border-white/10' 
                              : 'bg-white border-stone-200 shadow-md'
                          }`}
                          style={{
                            zIndex: 10 - Math.abs(offset),
                          }}
                          initial={false}
                          animate={{
                            scale: isSelected ? 1 : 0.82 - Math.abs(offset) * 0.08,
                            x: offset * 180 + (mousePosition.x * (isSelected ? 0.3 : 0.1)),
                            y: isSelected ? (mousePosition.y * 0.3) : Math.abs(offset) * 15,
                            rotateY: offset * -28 + (mousePosition.x * (isSelected ? -0.1 : -0.05)),
                            opacity: isSelected ? 1 : 0.5 - Math.abs(offset) * 0.18,
                            filter: isSelected ? 'blur(0px)' : 'blur(2px)',
                          }}
                          transition={{
                            type: 'spring',
                            stiffness: 140,
                            damping: 18,
                          }}
                        >
                          {/* Aspect block holding portrait picture */}
                          <div className="relative overflow-hidden group bg-transparent flex justify-center h-auto max-h-[38vh] sm:max-h-[42vh] w-fit mx-auto">
                            <img 
                              src={proj.image} 
                              alt={proj.title}
                              className="max-h-[38vh] sm:max-h-[42vh] h-auto w-auto max-w-full object-contain select-none pointer-events-none block mx-auto"
                              referrerPolicy="no-referrer"
                            />
                            <div 
                              className="absolute inset-0 bg-transparent cursor-pointer" 
                              onClick={() => setSelectedPhoto(proj)}
                            />

                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 pointer-events-none">
                              <span className={`font-mono text-xs tracking-widest border px-4 py-2 rounded ${
                                isDarkMode 
                                  ? 'bg-black/85 border-white/10 text-white' 
                                  : 'bg-white/95 border-stone-300 text-stone-900 shadow-md'
                              }`}>
                                AMPLIAR DETALHES
                              </span>
                            </div>
                          </div>

                          {/* Brief descriptive label at bottom of card */}
                          <div className="pt-2 pb-4 px-4 flex-none select-none w-0 min-w-full">
                            <div className="flex justify-between items-center">
                              <span className={`font-mono text-[9px] ${isDarkMode ? 'text-zinc-500' : 'text-stone-450'}`}>
                                {activeCol.title.toUpperCase()} &copy; {proj.year}
                              </span>
                              <span className={`font-mono text-[9px] font-bold ${isDarkMode ? 'text-zinc-400' : 'text-stone-800'}`}>
                                0{idx + 1}
                              </span>
                            </div>
                            {proj.title && (
                              <h4 className={`font-serif italic text-base mt-0.5 ${isDarkMode ? 'text-white' : 'text-stone-900 font-bold'}`}>{proj.title}</h4>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Centered Controls under the image stack */}
                  <div className="flex items-center gap-4 mt-8 z-20">
                    <button 
                      onClick={() => setActiveWebIndex(prev => (prev === 0 ? projects.length - 1 : prev - 1))}
                      className={`w-10 h-10 flex items-center justify-center rounded-full border transition-all cursor-pointer ${
                        isDarkMode 
                          ? 'border-white/10 hover:border-white/40 hover:bg-white/5 text-zinc-400 hover:text-white' 
                          : 'border-stone-300 hover:border-stone-850 hover:bg-stone-100 text-stone-500 hover:text-stone-900 bg-white/40'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <span className={`font-mono text-xs tracking-widest ${isDarkMode ? 'text-zinc-400' : 'text-stone-600'}`}>
                      {activeWebIndex + 1} / {projects.length}
                    </span>

                    <button 
                      onClick={() => setActiveWebIndex(prev => (prev === projects.length - 1 ? 0 : prev + 1))}
                      className={`w-10 h-10 flex items-center justify-center rounded-full border transition-all cursor-pointer ${
                        isDarkMode 
                          ? 'border-white/10 hover:border-white/40 hover:bg-white/5 text-zinc-400 hover:text-white' 
                          : 'border-stone-350 hover:border-stone-850 hover:bg-stone-100 text-stone-700 hover:text-stone-950 bg-white/40'
                      }`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Bottom Nav indicators */}
                <div className={`w-full flex justify-between items-center font-mono text-[9px] tracking-widest border-t pt-6 transition-colors ${
                  isDarkMode ? 'border-white/10 text-zinc-500' : 'border-stone-200 text-stone-400'
                }`}>
                  <span>{isMobile ? 'CLIQUE NA IMAGEM PARA REVELAR EM ECRÃ INTEIRO' : '[←] ANTERIOR // [→] SEGUINTE // CLIQUE NA IMAGEM PARA REVELAR EM ECRÃ INTEIRO'}</span>
                  <span className={`cursor-pointer transition-colors ${
                    isDarkMode ? 'hover:text-white' : 'hover:text-stone-900 hover:font-bold'
                  }`} onClick={() => navigateTo(activeCol.studioKey)}>VOLTAR PARA {activeCol.studio}</span>
                </div>
              </motion.div>
            );
          })()}

          {/* Immersive Lightbox Modal */}
          <AnimatePresence>
            {selectedPhoto && (() => {
              const collectionInfo = (() => {
                let name = '';
                let index = '';
                let total = 0;
                
                // Find matching collection dynamically
                const matchedCol = collections.find(c => c.projects.some(p => p.id === selectedPhoto.id));
                if (matchedCol) {
                  const pIdx = matchedCol.projects.findIndex(p => p.id === selectedPhoto.id);
                  name = matchedCol.title.toUpperCase();
                  index = `#${pIdx + 1}`;
                  total = matchedCol.projects.length;
                }
                
                return { name, index, total };
              })();

              const activeCol = collections.find(c => c.projects.some(p => p.id === selectedPhoto.id));
              const activeList = activeCol ? activeCol.projects : [];

              return (
                <motion.div
                  key="lightbox"
                  className={`absolute inset-0 z-50 flex items-center justify-center p-4 md:p-12 overflow-y-auto ${
                    isDarkMode ? 'bg-black/95 backdrop-blur-md' : 'bg-stone-100/95 backdrop-blur-md'
                  }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className={`relative w-fit max-w-[90vw] flex flex-col rounded-lg overflow-hidden shadow-3xl border p-0 transition-all ${
                    isDarkMode 
                      ? 'bg-[#080808]/95 border-white/10 text-[#e0e0e0]' 
                      : 'bg-white border-stone-200 text-stone-900'
                  }`}>
                    
                    {/* Close trigger */}
                    <button 
                      onClick={() => setSelectedPhoto(null)}
                      className={`absolute top-4 right-4 z-[60] w-10 h-10 flex items-center justify-center rounded-full transition-all cursor-pointer border ${
                        isDarkMode 
                          ? 'bg-black/40 border-white/10 hover:border-white/40 hover:bg-white/5 text-zinc-400 hover:text-white' 
                          : 'bg-stone-50 border-stone-300 hover:border-stone-850 hover:bg-stone-150 text-stone-600 hover:text-stone-950 shadow'
                      }`}
                    >
                      <X className="w-5 h-5" />
                    </button>
 
                    {/* Centered Image Wrapper */}
                    <div className="w-fit flex flex-col items-center justify-center mx-auto">
                      <div className="relative h-auto max-h-[45vh] md:max-h-[55vh] w-fit flex items-center justify-center bg-transparent">
                        <img 
                          src={selectedPhoto.image} 
                          alt={selectedPhoto.title}
                          className="max-h-[45vh] md:max-h-[55vh] h-auto w-auto max-w-full object-contain block mx-auto"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Metadata: Title, Collection, Year and Number */}
                      <div className="pt-0 pb-6 px-6 md:pb-8 md:px-8 text-center w-0 min-w-full">
                        {selectedPhoto.title && (
                          <h2 className={`font-serif italic text-2xl md:text-3xl font-light tracking-wide ${
                            isDarkMode ? 'text-white' : 'text-stone-900'
                          }`}>
                            {selectedPhoto.title}
                          </h2>
                        )}
                        
                        <div className={`mt-3 font-mono text-[10px] tracking-[0.25em] uppercase flex flex-wrap items-center justify-center gap-3 ${
                          isDarkMode ? 'text-zinc-400' : 'text-stone-600'
                        }`}>
                          <span className="font-semibold">{collectionInfo.name}</span>
                          <span>•</span>
                          <span>{selectedPhoto.year}</span>
                          <span>•</span>
                          <span className={isDarkMode ? 'text-white' : 'text-stone-900 font-bold'}>{collectionInfo.index}</span>
                        </div>
                      </div>
                    </div>

                    {/* Lightbox Horizontal Navigation */}
                    <div className={`flex justify-between items-center px-6 pb-6 md:px-8 md:pb-8 pt-5 border-t mt-6 w-0 min-w-full ${
                      isDarkMode ? 'border-white/10' : 'border-stone-200'
                    }`}>
                      <button 
                        onClick={() => {
                          const idx = activeList.findIndex(p => p.id === selectedPhoto.id);
                          const prevIdx = idx === 0 ? activeList.length - 1 : idx - 1;
                          setSelectedPhoto(activeList[prevIdx]);
                        }}
                        className={`flex items-center gap-2 p-1.5 transition-colors cursor-pointer ${
                          isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-stone-500 hover:text-stone-900 hover:font-bold'
                        }`}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="font-mono text-[9px] tracking-widest">ANTERIOR</span>
                      </button>

                      <span className={`font-mono text-[9px] ${
                        isDarkMode ? 'text-zinc-650' : 'text-stone-400'
                      }`}>
                        {isMobile ? 'SÉRIE' : '[←] SÉRIE [→]'}
                      </span>

                      <button 
                        onClick={() => {
                          const idx = activeList.findIndex(p => p.id === selectedPhoto.id);
                          const nextIdx = idx === activeList.length - 1 ? 0 : idx + 1;
                          setSelectedPhoto(activeList[nextIdx]);
                        }}
                        className={`flex items-center gap-2 p-1.5 transition-colors cursor-pointer ${
                          isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-stone-500 hover:text-stone-900 hover:font-bold'
                        }`}
                      >
                        <span className="font-mono text-[9px] tracking-widest">SEGUINTE</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>

          {/* ================= SECTION 5: SOBRE MIM & CONTACTO ================= */}
          {section === 'sobre-contacto' && (
            <motion.div
              key="sobre-contacto"
              className={`absolute inset-0 flex flex-col justify-between p-6 md:p-14 z-10 w-full transition-colors duration-1000 ${
                isDarkMode ? 'text-zinc-100' : 'text-stone-900'
              }`}
              initial={{ opacity: 0, y: 100, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ 
                opacity: 0,
                y: -150,
                filter: 'blur(10px)',
                transition: { duration: 0.8 }
              }}
            >
              {/* Header */}
              <div className="w-full flex justify-between items-start z-10">
                <div className="flex flex-col">
                  <div className={`flex items-center gap-2 font-mono text-xs tracking-widest ${
                    isDarkMode ? 'text-zinc-500' : 'text-stone-400'
                  }`}>
                    <span className={`cursor-pointer transition-colors ${
                      isDarkMode ? 'hover:text-zinc-100' : 'hover:text-stone-950 hover:font-bold'
                    }`} onClick={() => navigateTo('encruzilhada-2')}>ISAAC LOPES</span>
                    <span>/</span>
                    <span className={isDarkMode ? 'text-zinc-300' : 'text-stone-700 font-bold'}>SOBRE MIM &amp; CONTACTO</span>
                  </div>
                  <h3 className={`font-serif italic text-2xl md:text-3xl font-light mt-1 ${
                    isDarkMode ? 'text-zinc-200' : 'text-stone-850'
                  }`}>Identidade &amp; Vínculo</h3>
                </div>

                <button 
                  id="close-about-btn"
                  onClick={() => navigateTo('encruzilhada-2')}
                  className={`flex items-center gap-2 border p-2 md:px-4 md:py-2 rounded-full font-mono text-[10px] tracking-widest transition-all cursor-pointer ${
                    isDarkMode 
                      ? 'border-white/10 hover:border-white/40 text-zinc-400 hover:text-white' 
                      : 'border-stone-300 hover:border-stone-800 text-stone-500 hover:text-stone-900 bg-white/40'
                  }`}
                >
                  <X className="w-4 h-4" /> 
                  <span className="hidden sm:inline">SAIR [↓]</span>
                </button>
              </div>

              {/* Main Content Area */}
              <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center max-w-7xl mx-auto w-full z-10 px-4 md:px-0 my-4 overflow-y-auto no-scrollbar max-h-[72vh]">
                
                {/* Visual side: Silhouette / Bio */}
                <div className="lg:col-span-5 flex flex-col justify-center">
                  <div className={`border p-6 md:p-8 rounded shadow-3xl overflow-hidden group transition-all duration-500 ${
                    isDarkMode ? 'border-white/10 bg-[#080808]/80' : 'border-stone-200 bg-white shadow-md'
                  }`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-radial-gradient from-white/5 to-transparent pointer-events-none" />
                    
                    {/* Generative light shape element depicting "Ponto de Fuga" */}
                    <div className={`w-full aspect-video rounded border relative flex items-center justify-center overflow-hidden mb-6 transition-all ${
                      isDarkMode ? 'bg-[#101010] border-white/5' : 'bg-stone-50 border-stone-200'
                    }`}>
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(120,120,120,0.06)_0%,rgba(0,0,0,0)_70%)]" />
                      {/* Subtle elegant rotating circle */}
                      <motion.div
                        className={`w-16 h-16 rounded-full border border-dashed ${
                          isDarkMode ? 'border-white/20' : 'border-stone-900/20'
                        }`}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                      />
                      <div className={`absolute w-2 h-2 rounded-full blur-xs ${
                        isDarkMode ? 'bg-white/40' : 'bg-stone-900/40'
                      }`} />
                    </div>

                    <h4 className={`font-serif italic text-2xl font-light tracking-wide mb-4 ${
                      isDarkMode ? 'text-white' : 'text-stone-900 font-bold'
                    }`}>
                      Estética em Suspenso, Código Concreto.
                    </h4>

                    <p className={`font-sans font-light text-sm leading-relaxed ${
                      isDarkMode ? 'text-zinc-300' : 'text-stone-700'
                    }`}>
                      Chamo-me <strong className={`font-serif italic tracking-wide transition-colors ${
                        isDarkMode ? 'text-white' : 'text-stone-950 font-bold'
                      }`}>Isaac Lopes</strong>. Sou designer criativa multidisciplinar, focada no desenvolvimento de narrativas digitais e artes visuais contemplativas.
                    </p>
                    
                    <p className={`font-sans font-light text-sm leading-relaxed mt-3 ${
                      isDarkMode ? 'text-zinc-300' : 'text-stone-700'
                    }`}>
                      A minha abordagem combina rigor tipográfico com espaços limpos, explorando como a ausência voluntária de elementos pode preencher de significado uma experiência virtual. Do desenho de interfaces ao preto-e-branco analógico, cada projeto é uma busca pelo silêncio essencial.
                    </p>

                    <div className={`mt-6 flex flex-col gap-2 font-mono text-[10px] border-t pt-5 transition-colors ${
                      isDarkMode ? 'border-white/10 text-zinc-500' : 'border-stone-200 text-stone-450 font-semibold'
                    }`}>
                      <span className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-white/60' : 'bg-stone-700'}`} /> PORTUGAL, EUROPA // FUSO UTC
                      </span>
                      <span className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-white/60' : 'bg-stone-700'}`} /> DISPONÍVEL PARA ALIANÇAS CRIATIVAS
                      </span>
                    </div>
                  </div>
                </div>

                {/* Interactible Form side */}
                <div className="lg:col-span-7 flex flex-col justify-center">
                  <div className={`border p-6 md:p-10 rounded shadow-3xl max-w-xl w-full transition-all duration-500 ${
                    isDarkMode ? 'border-white/10 bg-[#080808]/80' : 'border-stone-200 bg-white shadow-md'
                  }`}>
                    <h4 className={`font-serif italic text-2xl font-light tracking-wide mb-1 ${
                      isDarkMode ? 'text-white' : 'text-stone-900 font-bold'
                    }`}>
                      Inicie uma Conversa
                    </h4>
                    <p className={`font-mono text-[10px] tracking-wider mb-6 ${
                      isDarkMode ? 'text-zinc-500' : 'text-stone-400 font-bold'
                    }`}>
                      PROPONHA UM PROJETO OU PARTILHE UMA REFLEXÃO
                    </p>

                    {formStatus === 'success' ? (
                      <motion.div 
                        className="flex flex-col items-center justify-center py-10 text-center"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(255,255,255,0.4)] ${
                          isDarkMode ? 'bg-white text-[#050505]' : 'bg-stone-900 text-stone-50'
                        }`}>
                          <Send className="w-5 h-5" />
                        </div>
                        <h5 className={`font-serif italic text-xl font-light ${
                          isDarkMode ? 'text-white' : 'text-stone-900 font-bold'
                        }`}>Mensagem Entregue</h5>
                        <p className={`font-sans font-light text-xs mt-2 max-w-xs leading-relaxed ${
                          isDarkMode ? 'text-zinc-400' : 'text-stone-600'
                        }`}>
                          Agradeço a partilha de energia. Entrarei em contacto por correio eletrónico com a celeridade que o silêncio permitir.
                        </p>
                        <button 
                          onClick={() => setFormStatus('idle')}
                          className={`font-mono text-[9px] tracking-widest border px-4 py-2 rounded-full mt-6 transition-all cursor-pointer ${
                            isDarkMode 
                              ? 'text-[#e0e0e0] hover:text-white border-white/10 hover:border-white/45 bg-white/5' 
                              : 'text-stone-600 hover:text-stone-900 border-stone-300 hover:border-stone-850 bg-stone-100 hover:bg-stone-200'
                          }`}
                        >
                          ENVIAR NOVA CORRESPONDÊNCIA
                        </button>
                      </motion.div>
                    ) : (
                      <form onSubmit={handleContactSubmit} className="space-y-4">
                        <div>
                          <label className={`font-mono text-[9px] block tracking-widest mb-1.5 ${
                            isDarkMode ? 'text-zinc-400' : 'text-stone-500 font-bold'
                          }`}>
                            NOME DE COPILOTO CLIENTE
                          </label>
                          <input 
                            type="text"
                            required
                            placeholder="Ex: Alberto Caeiro"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            onFocus={() => setIsInputFocused(true)}
                            onBlur={() => setIsInputFocused(false)}
                            className={`w-full rounded p-3 text-xs font-sans font-light focus:outline-none transition-all duration-300 ${
                              isDarkMode 
                                ? 'bg-[#0d0d0d] border border-white/10 text-zinc-100 focus:border-white/45' 
                                : 'bg-stone-100 border border-stone-300 text-stone-900 focus:border-stone-800'
                            }`}
                          />
                        </div>

                        <div>
                          <label className={`font-mono text-[9px] block tracking-widest mb-1.5 ${
                            isDarkMode ? 'text-zinc-400' : 'text-stone-500 font-bold'
                          }`}>
                            ENDEREÇO ELETRÓNICO (EMAIL)
                          </label>
                          <input 
                            type="email"
                            required
                            placeholder="Ex: alberto@estrada.pt"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            onFocus={() => setIsInputFocused(true)}
                            onBlur={() => setIsInputFocused(false)}
                            className={`w-full rounded p-3 text-xs font-sans font-light focus:outline-none transition-all duration-300 ${
                              isDarkMode 
                                ? 'bg-[#0d0d0d] border border-white/10 text-zinc-100 focus:border-white/45' 
                                : 'bg-stone-100 border border-stone-300 text-stone-900 focus:border-stone-800'
                            }`}
                          />
                        </div>

                        <div>
                          <label className={`font-mono text-[9px] block tracking-widest mb-1.5 ${
                            isDarkMode ? 'text-zinc-400' : 'text-stone-500 font-bold'
                          }`}>
                            DESCRIÇÃO DA IDEIA OU DIÁLOGO
                          </label>
                          <textarea 
                            rows={4}
                            required
                            placeholder="Escreva aqui sobre os seus objetivos e como posso colaborar..."
                            value={formData.message}
                            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                            onFocus={() => setIsInputFocused(true)}
                            onBlur={() => setIsInputFocused(false)}
                            className={`w-full rounded p-3 text-xs font-sans font-light focus:outline-none transition-all duration-300 resize-none ${
                              isDarkMode 
                                ? 'bg-[#0d0d0d] border border-white/10 text-zinc-100 focus:border-white/451' 
                                : 'bg-stone-100 border border-stone-300 text-stone-900 focus:border-stone-850'
                            }`}
                          />
                        </div>

                        <button 
                          type="submit"
                          disabled={formStatus === 'sending'}
                          className={`w-full font-mono text-[10px] tracking-widest py-3.5 rounded flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 ${
                            isDarkMode 
                              ? 'bg-white hover:bg-zinc-200 text-[#050505]' 
                              : 'bg-stone-900 hover:bg-stone-850 text-stone-50'
                          }`}
                        >
                          {formStatus === 'sending' ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>A EXPEDIR MENSAGEM...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>DISPARAR SINAL DE COMUNICADO</span>
                            </>
                          )}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom control */}
              <div className={`w-full flex justify-between items-center font-mono text-[9px] tracking-widest border-t pt-6 transition-colors ${
                isDarkMode ? 'border-white/10 text-zinc-500' : 'border-stone-200 text-stone-400'
              }`}>
                <span>{isMobile ? 'CLIQUE NO CANTO PARA SAIR DESTA VISTA' : 'PRESSIONE [↓] OU CLIQUE NO CANTO PARA SAIR DESTA VISTA'}</span>
                <span className={`cursor-pointer transition-colors ${
                  isDarkMode ? 'hover:text-white' : 'hover:text-stone-900 hover:font-bold'
                }`} onClick={() => navigateTo('encruzilhada-2')}>REGRESSAR AO CONTEXTO</span>
              </div>
            </motion.div>
          )}
            </>
          )}

        </AnimatePresence>
      </div>

      {/* Floating navigation overlay for tiny viewports (Touch controls) */}
      {!isMobileMainView && (
        <div 
          id="touch-actions-dock"
          className={`absolute bottom-4 right-4 z-40 border p-2.5 rounded-full flex gap-2 items-center pointer-events-auto sm:hidden shadow-lg backdrop-blur transition-all ${
            isDarkMode ? 'bg-black/95 border-white/10' : 'bg-white/95 border-stone-200 shadow-md'
          }`}
        >
        {section !== 'vazio' && (
          <button 
            onClick={() => {
              const getBackSection = () => {
                if (section === 'retratos' || section === 'desporto' || section === 'encruzilhada-2') return 'encruzilhada-1';
                if (section === 'paisagens' || section === 'arquitetura' || section === 'sobre-contacto') return 'encruzilhada-2';
                return 'vazio';
              };
              navigateTo(getBackSection());
            }}
            className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${
              isDarkMode 
                ? 'bg-[#0c0c0c] border-white/10 hover:border-white/45 text-[#e0e0e0]' 
                : 'bg-stone-55 border-stone-300 text-stone-850 hover:bg-stone-150 shadow-sm'
            }`}
            title="Voltar"
          >
            <Compass className="w-4 h-4" />
          </button>
        )}
        {section === 'vazio' && (
          <button 
            onClick={() => navigateTo('encruzilhada-1')}
            className={`px-4 py-2 rounded-full font-mono text-[9px] tracking-widest font-bold flex items-center gap-1.5 transition-colors ${
              isDarkMode ? 'bg-white text-[#050505]' : 'bg-stone-900 text-stone-50 hover:bg-stone-850'
            }`}
          >
            AVANÇAR <ArrowUp className="w-3.5 h-3.5" />
          </button>
        )}
        {section === 'encruzilhada-1' && (
          <>
            <button 
              onClick={() => { navigateTo('retratos'); setActiveWebIndex(0); }}
              className={`px-3 py-2 rounded-full font-mono text-[9px] tracking-wider transition-colors border ${
                isDarkMode 
                  ? 'bg-[#0c0c0c] border-white/10 text-zinc-300' 
                  : 'bg-stone-55 border-stone-300 text-stone-800 hover:bg-stone-100 shadow-xs'
              }`}
            >
              RETRATOS
            </button>
            <button 
              onClick={() => { navigateTo('desporto'); setActiveWebIndex(0); }}
              className={`px-3 py-2 rounded-full font-mono text-[9px] tracking-wider transition-colors border ${
                isDarkMode 
                  ? 'bg-[#0c0c0c] border-white/10 text-zinc-300' 
                  : 'bg-stone-55 border-stone-300 text-stone-800 hover:bg-stone-100 shadow-xs'
              }`}
            >
              DESPORTO
            </button>
            <button 
              onClick={() => navigateTo('encruzilhada-2')}
              className={`px-2.5 py-2.5 rounded-full transition-colors border ${
                isDarkMode 
                  ? 'bg-[#0c0c0c] border-white/10 text-zinc-300' 
                  : 'bg-stone-55 border-stone-300 text-stone-800 hover:bg-stone-100 shadow-xs'
              }`}
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </>
        )}
        {section === 'encruzilhada-2' && (
          <>
            <button 
              onClick={() => { navigateTo('paisagens'); setActiveWebIndex(0); }}
              className={`px-3 py-2 rounded-full font-mono text-[9px] tracking-wider transition-colors border ${
                isDarkMode 
                  ? 'bg-[#0c0c0c] border-white/10 text-zinc-300' 
                  : 'bg-stone-55 border-stone-300 text-stone-800 hover:bg-stone-100 shadow-xs'
              }`}
            >
              PAISAGENS
            </button>
            <button 
              onClick={() => { navigateTo('arquitetura'); setActiveWebIndex(0); }}
              className={`px-3 py-2 rounded-full font-mono text-[9px] tracking-wider transition-colors border ${
                isDarkMode 
                  ? 'bg-[#0c0c0c] border-white/10 text-zinc-300' 
                  : 'bg-stone-55 border-stone-300 text-stone-800 hover:bg-stone-100 shadow-xs'
              }`}
            >
              ARQUITETURA
            </button>
            <button 
              onClick={() => navigateTo('sobre-contacto')}
              className={`px-2.5 py-2.5 rounded-full transition-colors border ${
                isDarkMode 
                  ? 'bg-[#0c0c0c] border-white/10 text-zinc-300' 
                  : 'bg-stone-55 border-stone-300 text-stone-800 hover:bg-stone-100 shadow-xs'
              }`}
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
      )}

    </div>
  );
}
