import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Zap, Headphones, Smartphone, Gift, Gamepad2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useSiteSettings } from "@/context/SiteSettingsContext";

// Icon pool for announcements (cycles through)
const ICONS = [Sparkles, Smartphone, Headphones, Gift, Gamepad2, Zap];
const COLORS = ["text-primary", "text-accent", "text-primary", "text-accent", "text-primary", "text-accent"];

const AnnouncementBar = () => {
  const { settings } = useSiteSettings();
  const announcements = settings.announcements;

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (announcements.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [announcements.length]);

  if (announcements.length === 0) return null;

  const current = announcements[currentIndex];
  const Icon = ICONS[currentIndex % ICONS.length];
  const color = COLORS[currentIndex % COLORS.length];

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
                current.highlight ? "px-3 py-1 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20" : ""
              }`}
            >
              {current.highlight && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-full"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
              <Icon
                className={`h-4 w-4 ${color} group-hover:scale-110 transition-transform duration-300 relative z-10 ${
                  current.highlight ? "animate-pulse" : ""
                }`}
              />
              <span
                className={`text-xs transition-colors duration-300 font-light tracking-wide relative z-10 ${
                  current.highlight
                    ? "text-primary font-medium"
                    : "text-muted-foreground group-hover:text-foreground"
                }`}
              >
                {current.text}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 5, ease: "easeInOut" }}
      />
    </motion.div>
  );
};

export default AnnouncementBar;
