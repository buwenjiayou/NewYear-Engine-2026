
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AppAct } from './types';
import { ParticleEngine } from './engine/ParticleSystem';

/**
 * Created by Bu Wen Jia You
 * 2026: Chronos Gallop - Neo-Traditional New Year Experience
 */

const App: React.FC = () => {
  const [act, setAct] = useState<AppAct>(AppAct.BARRIER);
  const [time, setTime] = useState(new Date());
  const [charge, setCharge] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<ParticleEngine | null>(null);
  const chargeInterval = useRef<number | null>(null);
  
  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize engine
  useEffect(() => {
    if (canvasRef.current && !engineRef.current) {
      engineRef.current = new ParticleEngine(canvasRef.current);
      engineRef.current.render();
      initInitialState();
    }
  }, []);

  const initInitialState = () => {
    if (engineRef.current) {
      // Initial state: "2025" floating
      const points = engineRef.current.samplePoints("2025", 200);
      engineRef.current.updateTargets(points, "#00f2ff");
      engineRef.current.setState('IDLE');
    }
  };

  // Format the time string: "某年某月某日——12小时：分钟：秒钟"
  const hours12 = time.getHours() % 12 || 12;
  const formattedTime = `${time.getFullYear()}年${time.getMonth() + 1}月${time.getDate()}日——${String(hours12).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}:${String(time.getSeconds()).padStart(2, '0')}`;

  // Handle transitions
  const startCharging = useCallback(() => {
    if (act !== AppAct.BARRIER) return;
    engineRef.current?.setState('CHARGE');
    chargeInterval.current = window.setInterval(() => {
      setCharge(prev => {
        const next = Math.min(prev + 1, 100);
        engineRef.current?.setProgress(next / 100);
        if (next === 100) transitionToLeap();
        return next;
      });
    }, 30);
  }, [act]);

  const stopCharging = useCallback(() => {
    if (charge < 100 && act === AppAct.BARRIER) {
      if (chargeInterval.current) clearInterval(chargeInterval.current);
      setCharge(0);
      engineRef.current?.setProgress(0);
      engineRef.current?.setState('IDLE');
    }
  }, [charge, act]);

  const transitionToLeap = () => {
    if (chargeInterval.current) clearInterval(chargeInterval.current);
    setAct(AppAct.LEAP);
    engineRef.current?.setState('WARP');
    
    // After 2 seconds of warp, form the Horse
    setTimeout(() => {
      // 🐎 (Horse Emoji) or a custom shape. We'll use "2026 🐎" for clarity
      const points = engineRef.current?.samplePoints("2026 🐎", 150);
      if (points) engineRef.current?.updateTargets(points, "#ff003c");
      engineRef.current?.setState('FORMING');
      
      // Final revelation after some time
      setTimeout(() => {
        transitionToRevelation();
      }, 3000);
    }, 2500);
  };

  const transitionToRevelation = () => {
    setAct(AppAct.REVELATION);
    engineRef.current?.setState('EXPLODE');
    
    setTimeout(() => {
      const points = engineRef.current?.samplePoints("布文佳油", 120, 'Ma Shan Zheng');
      if (points) engineRef.current?.updateTargets(points, "#ffd700");
      engineRef.current?.setState('FINAL');
    }, 1500);
  };

  const handleReplay = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setAct(AppAct.BARRIER);
    setCharge(0);
    initInitialState();
  };

  return (
    <div 
      className="relative w-screen h-screen overflow-hidden bg-[#000b1e]"
      onMouseDown={startCharging}
      onMouseUp={stopCharging}
      onTouchStart={startCharging}
      onTouchEnd={stopCharging}
    >
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      {/* Act 1: Barrier UI */}
      {act === AppAct.BARRIER && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 transition-opacity duration-1000">
          <div className="text-3xl md:text-5xl font-black cyber-glow tracking-tight mb-6 opacity-90 text-center px-4">
            {formattedTime}
          </div>
          <div className="text-sm md:text-base tracking-[0.1em] opacity-60 mb-12 text-center px-4">
            人们在失去一些东西的时候也在得到一些东西
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mb-4">
              <div 
                className="h-full bg-cyan-400 shadow-[0_0_15px_#00f2ff] transition-all duration-100" 
                style={{ width: `${charge}%` }}
              />
            </div>
            <div className={`text-xs md:text-sm tracking-widest transition-all ${charge > 0 ? 'scale-110 text-cyan-400' : 'opacity-40'}`}>
              {charge === 0 ? "长按屏幕 · 为时空引擎充能" : `引擎过载中 ${charge}%`}
            </div>
          </div>
        </div>
      )}

      {/* Act 2: Leap UI */}
      {act === AppAct.LEAP && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="text-white text-center animate-pulse">
            <h1 className="text-4xl md:text-6xl font-black italic tracking-widest text-red-500 cyber-glow">
              JUMPING TO 2026
            </h1>
            <p className="text-xs mt-2 opacity-50 tracking-[0.5em]">WARP SPEED ENGAGED</p>
          </div>
        </div>
      )}

      {/* Act 3: Revelation UI */}
      {act === AppAct.REVELATION && (
        <>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
            <div className="mt-[200px] text-center animate-bounce-slow">
              <h2 
                className="text-4xl md:text-6xl font-bold tracking-[0.2em] gold-glow mb-4"
                style={{ fontFamily: 'Ma Shan Zheng, cursive' }}
              >
                布文佳油 祝您新年快乐
              </h2>
              <div className="h-px w-64 bg-gradient-to-r from-transparent via-yellow-500 to-transparent mx-auto opacity-50"></div>
              <p className="mt-8 text-sm md:text-lg tracking-[0.4em] opacity-80 typing-text">
                2026 · 时空策马 · 万事胜意
              </p>
            </div>
          </div>
          
          {/* Replay Button */}
          <div className="absolute bottom-12 left-0 right-0 flex justify-center z-50 animate-fade-in">
            <button 
              onClick={handleReplay}
              onTouchStart={(e) => e.stopPropagation()}
              className="px-6 py-2 text-[10px] tracking-[0.5em] text-white/40 hover:text-white/80 transition-all border border-white/10 hover:border-white/30 rounded-full uppercase"
            >
              重新播放
            </button>
          </div>
        </>
      )}

      {/* Attribution */}
      <div className="absolute bottom-6 right-6 text-[10px] tracking-widest opacity-20 uppercase z-50 pointer-events-none">
        Developed by Bu Wen Jia You / 2026 Creative Lab
      </div>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 2s ease-out forwards;
        }
        .typing-text {
          overflow: hidden;
          border-right: 2px solid #ffd700;
          white-space: nowrap;
          margin: 0 auto;
          animation: typing 3.5s steps(30, end), blink-caret .75s step-end infinite;
        }
        @keyframes typing {
          from { width: 0 }
          to { width: 100% }
        }
        @keyframes blink-caret {
          from, to { border-color: transparent }
          50% { border-color: #ffd700 }
        }
      `}</style>
    </div>
  );
};

export default App;
