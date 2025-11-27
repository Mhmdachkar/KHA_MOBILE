import { motion } from "framer-motion";
import { Tv, ArrowRight } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";

// Import streaming service images
import netflixImage from "@/assets/netflix,shahid,iptv/netflix.jpg";
import shahidImage from "@/assets/netflix,shahid,iptv/Shahid.net.png";
import iptvImage from "@/assets/netflix,shahid,iptv/IPTV.jpg";

// Types
interface SubscriptionPlan {
  id: number;
  duration: string;
  price?: number; // Optional price if available
  isFreeTrial?: boolean;
}

interface StreamingService {
  id: number;
  name: string;
  description: string;
  detailedDescription?: string;
  image: string;
  category: string;
  plans: SubscriptionPlan[];
}

// Data
const STREAMING_SERVICES: StreamingService[] = [
  {
    id: 1,
    name: "Netflix",
    description: "Premium streaming service with unlimited movies, TV shows, and original content",
    image: netflixImage,
    category: "Netflix",
    plans: [
      { id: 1, duration: "1 month" },
      { id: 2, duration: "3 months" },
      { id: 3, duration: "1 year" },
    ]
  },
  {
    id: 2,
    name: "Shahid.net",
    description: "Arabic streaming platform with exclusive content, movies, and TV series",
    image: shahidImage,
    category: "Shahid",
    plans: [
      { id: 1, duration: "1 month" },
      { id: 2, duration: "3 months" },
      { id: 3, duration: "1 year" },
    ]
  },
  {
    id: 3,
    name: "IPTV",
    description: "Internet Protocol Television service with live TV channels and on-demand content",
    detailedDescription: "Live TV Channels: Sports, news, entertainment, and movie channels (e.g., ESPN, BBC, CNN, HBO). Video on Demand (VOD): Movies, series, and documentaries available anytime. TV Series & Shows: Popular series like Game of Thrones, Breaking Bad, Friends, or The Office. Sports Events: Live football, basketball, Formula 1, UFC, and other major leagues. International Channels: Local and global content from regions like the Middle East, Europe, and Asia. Kids & Family: Cartoon Network, Disney Channel, Nickelodeon, etc.",
    image: iptvImage,
    category: "IPTV",
    plans: [
      { id: 1, duration: "Free Test Account", isFreeTrial: true },
      { id: 2, duration: "3 months" },
      { id: 3, duration: "6 months" },
      { id: 4, duration: "1 year" },
    ]
  },
];

// Service Card Component
interface ServiceCardProps {
  service: StreamingService;
}

const ServiceCard = ({ service }: ServiceCardProps) => {
  const navigate = useNavigate();

  const handlePlanClick = (plan: SubscriptionPlan) => {
    // Navigate to detail page with selected plan
    navigate(`/streaming-service/${service.id}?plan=${plan.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -12 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="group relative bg-white rounded-sm overflow-hidden border border-border hover:border-primary/40 transition-all duration-500 shadow-card hover:shadow-elegant"
      style={{ touchAction: "pan-y" }}
    >
      <Link to={`/streaming-service/${service.id}`}>
        <div className="aspect-[4/3] overflow-hidden bg-white relative border-b border-border cursor-pointer" style={{ touchAction: "pan-y" }}>
          <motion.img
            src={service.image}
            alt={service.name}
            className="h-full w-full object-cover p-4 transition-transform duration-700 group-hover:scale-110"
            style={{ touchAction: "pan-y" }}
          />
        </div>
      </Link>
      <div className="p-6">
        <Link to={`/streaming-service/${service.id}`}>
          <motion.span
            initial={{ opacity: 0.7 }}
            whileHover={{ opacity: 1 }}
            className="text-elegant text-[10px] text-primary mb-2 block"
          >
            {service.category}
          </motion.span>
          <h3 className="text-elegant text-xl mb-3 group-hover:text-primary transition-colors duration-300 cursor-pointer">
            {service.name}
          </h3>
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            {service.description}
          </p>
          {service.category === "IPTV" && (
            <p className="text-xs text-muted-foreground mb-4">
              Includes premium sports channels such as <span className="font-semibold text-foreground">beIN SPORTS</span> alongside the full IPTV catalog.
            </p>
          )}
          <div className="text-primary text-xs hover:underline mb-4 flex items-center gap-1 group/link">
            View Details <ArrowRight className="h-3 w-3 group-hover/link:translate-x-1 transition-transform" />
          </div>
        </Link>
        
        {/* Subscription Plans */}
        <div className="space-y-2 mb-4" style={{ touchAction: "pan-y" }}>
          <p className="text-elegant text-xs font-medium mb-3">Subscription Plans:</p>
          {service.plans.map((plan) => (
            <motion.button
              key={plan.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handlePlanClick(plan);
              }}
              className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                plan.isFreeTrial
                  ? "bg-accent/10 border-accent/30 hover:border-accent/50 hover:bg-accent/20"
                  : "bg-primary/5 border-primary/20 hover:border-primary/40 hover:bg-primary/10"
              }`}
              style={{ touchAction: "manipulation" }}
            >
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${
                  plan.isFreeTrial ? "text-accent" : "text-elegant"
                }`}>
                  {plan.duration}
                </span>
                {plan.isFreeTrial && (
                  <span className="text-xs bg-accent text-white px-2 py-1 rounded">
                    FREE
                  </span>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// Main Component
const StreamingServices = () => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  return (
    <div className="min-h-screen bg-white no-horizontal-scroll overflow-x-hidden" style={{ touchAction: "pan-y" }}>
      <Header />

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-12" style={{ touchAction: "pan-y" }}>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-elegant text-3xl sm:text-4xl mb-4"
        >
          Streaming Services
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground mb-8 text-sm sm:text-base"
        >
          Premium streaming subscriptions for Netflix, Shahid, and IPTV services
        </motion.p>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12" style={{ touchAction: "pan-y" }}>
          {STREAMING_SERVICES.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ServiceCard service={service} />
            </motion.div>
          ))}
        </div>

        {/* Information Banner */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-primary to-accent text-white rounded-sm p-6 sm:p-8 text-center"
        >
          <div className="flex items-center justify-center mb-4">
            <Tv className="h-8 w-8 sm:h-10 sm:w-10 mr-3" />
            <p className="text-elegant text-xl sm:text-2xl">Premium Streaming Experience</p>
          </div>
          <p className="text-sm sm:text-base font-light mb-4">
            Get instant access to your favorite streaming services. Contact us to learn more about subscription plans and pricing.
          </p>
          <Button variant="outline" className="bg-white text-primary hover:bg-white/90 border-white">
            Contact Us
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default StreamingServices;

