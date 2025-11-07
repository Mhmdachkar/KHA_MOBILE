import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Zap, Headphones, Smartphone, Gift, Gamepad2, LucideIcon } from "lucide-react";
import { useState, useEffect } from "react";

interface Announcement {
  icon: LucideIcon;
  text: string;
  color: string;
  highlight?: boolean;
}

const AnnouncementBar = () => {
  const announcements: Announcement[] = [
    { icon: Sparkles, text: "🎉 10% OFF Premium Gaming Accessories", color: "text-primary", highlight: true },
    { icon: Smartphone, text: "Cutting-Edge Smartphones & Latest Tech", color: "text-accent" },
    { icon: Headphones, text: "Crystal-Clear Audio Excellence", color: "text-primary" },
    { icon: Gift, text: "🎁 Instant Digital Gift Cards Worldwide", color: "text-accent" },
    { icon: Gamepad2, text: "PlayStation Store Cards - 10% OFF", color: "text-primary", highlight: true },
    { icon: Zap, text: "Lightning-Fast Delivery • Free Shipping", color: "text-accent" },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % announcements.length);
    }, 4000); // 4 seconds per announcement

    return () => clearInterval(interval);
  }, [announcements.length]);

  const currentAnnouncement = announcements[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border-b border-border/30 py-2 overflow-hidden"
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-center min-h-[2rem]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className={`flex items-center gap-2 group cursor-pointer relative ${
                currentAnnouncement.highlight ? 'px-3 py-1 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20' : ''
              }`}
            >
              {currentAnnouncement.highlight && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-full"
                  animate={{
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}
              <currentAnnouncement.icon 
                className={`h-4 w-4 ${currentAnnouncement.color} group-hover:scale-110 transition-transform duration-300 relative z-10 ${
                  currentAnnouncement.highlight ? 'animate-pulse' : ''
                }`} 
              />
              <span className={`text-xs transition-colors duration-300 font-light tracking-wide relative z-10 ${
                currentAnnouncement.highlight 
                  ? 'text-primary font-medium' 
                  : 'text-muted-foreground group-hover:text-foreground'
              }`}>
                {currentAnnouncement.text}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      {/* Elegant shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatDelay: 5,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  );
};

export default AnnouncementBar;

