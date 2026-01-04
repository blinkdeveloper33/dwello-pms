'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'motion/react';
import RotatingText from '@/components/RotatingText';
import BlurText from '@/components/BlurText';

export default function SplashPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Show splash for 1 full rotation
    // 8 words × 2.5 seconds per word = 20 seconds
    // Plus buffer for smooth exit animation = ~22 seconds total
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          // Check if user is logged in, redirect accordingly
          if (status === 'authenticated' && session) {
            router.push('/dashboard');
          } else {
            router.push('/auth/signin');
          }
        }, 500);
      }, 1000); // Time for exit animation
    }, 22000);

    return () => clearTimeout(timer);
  }, [router, session, status]);

  if (!isVisible) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: isExiting ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-transparent"
        >
          <div className="flex flex-col items-center justify-center space-y-8">
            {/* Rotating Text */}
            <div className="text-center w-full">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 flex items-center justify-center gap-3 flex-wrap">
                {!isExiting ? (
                  <BlurText
                    text="Welcome to"
                    delay={100}
                    animateBy="words"
                    direction="top"
                    className="text-5xl md:text-6xl font-bold text-white"
                    forceInView={true}
                  />
                ) : (
                  <motion.span
                    initial={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
                    animate={{ filter: 'blur(10px)', opacity: 0, y: -50 }}
                    transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                    className="text-5xl md:text-6xl font-bold text-white"
                  >
                    Welcome to
                  </motion.span>
                )}
                <motion.div
                  key="rotating-text-wrapper"
                  initial={{ filter: 'blur(10px)', opacity: 0, y: -50 }}
                  animate={isExiting ? {
                    filter: ['blur(0px)', 'blur(5px)', 'blur(10px)'],
                    opacity: [1, 0.5, 0],
                    y: [0, 5, -50]
                  } : {
                    filter: ['blur(10px)', 'blur(5px)', 'blur(0px)'],
                    opacity: [0, 0.5, 1],
                    y: [-50, 5, 0]
                  }}
                  transition={isExiting ? {
                    duration: 0.8,
                    times: [0, 0.5, 1],
                    ease: [0.4, 0, 0.2, 1]
                  } : {
                    duration: 0.7,
                    times: [0, 0.5, 1],
                    ease: [0.4, 0, 0.2, 1],
                    delay: 0.3
                  }}
                  style={{ display: 'inline-block', willChange: 'filter, opacity, transform' }}
                >
                  <RotatingText
                    texts={[
                      'Dwello.',
                      'Properties',
                      'Management',
                      'Efficiency',
                      'Innovation',
                      'Excellence',
                      'Solutions',
                      'Success',
                    ]}
                    mainClassName="px-3 md:px-4 bg-white/20 backdrop-blur-sm text-white py-2 md:py-3 justify-center rounded-xl border border-white/30 min-w-fit"
                    staggerFrom="last"
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: '-100%', opacity: 0 }}
                    staggerDuration={0.04}
                    splitLevelClassName="overflow-hidden pb-1 md:pb-2"
                    transition={{ 
                      type: 'spring', 
                      damping: 25, 
                      stiffness: 300
                    }}
                    rotationInterval={2500}
                    auto={true}
                  />
                </motion.div>
              </h1>
              <div className="w-full flex justify-center mt-4">
                {!isExiting ? (
                  <BlurText
                    text="Your Complete Property Management Solution"
                    delay={150}
                    animateBy="words"
                    direction="top"
                    className="text-xl md:text-2xl text-white text-center"
                    forceInView={true}
                  />
                ) : (
                  <motion.p
                    initial={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
                    animate={{ filter: 'blur(10px)', opacity: 0, y: -50 }}
                    transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                    className="text-xl md:text-2xl text-white text-center"
                  >
                    Your Complete Property Management Solution
                  </motion.p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

