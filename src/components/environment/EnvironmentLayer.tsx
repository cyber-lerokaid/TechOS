import { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export function EnvironmentLayer() {
  const isClient = typeof window !== 'undefined';
  const mouseX = useMotionValue(isClient ? window.innerWidth / 2 : 0);
  const mouseY = useMotionValue(isClient ? window.innerHeight / 2 : 0);

  // Heavy spring for smooth, minimal movement
  const springConfig = { damping: 40, stiffness: 40, mass: 1 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 bg-[#020308]">
      {/* Subtle, almost invisible glow */}
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full blur-[120px] bg-cyan-500/5 mix-blend-screen"
        style={{
          x: useTransform(smoothX, (v) => v - 400),
          y: useTransform(smoothY, (v) => v - 400),
        }}
      />

      {/* Extremely subtle grid, hardly noticeable */}
      <motion.div 
        className="absolute inset-[-10%] w-[120%] h-[120%] opacity-20"
        style={{
          x: useTransform(smoothX, [0, isClient ? window.innerWidth : 1000], [10, -10]),
          y: useTransform(smoothY, [0, isClient ? window.innerHeight : 1000], [10, -10]),
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:48px_48px] [mask-image:radial-gradient(100%_100%_at_50%_0%,black_0%,black_30%,transparent_60%)]" />
      </motion.div>
      
      {/* Fixed side vignette for focus */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(2,3,8,0.95)_0%,transparent_20%,transparent_80%,rgba(2,3,8,0.95)_100%),linear-gradient(to_bottom,transparent_40%,rgba(2,3,8,0.95)_100%)]" />
      
      {/* Fixed top light line, very subtle */}
      <div className="absolute top-0 left-[-10%] right-[-10%] h-[1px] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
    </div>
  );
}
