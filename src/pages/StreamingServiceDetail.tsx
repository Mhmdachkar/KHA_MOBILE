import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingCart, CheckCircle2 } from "lucide-react";
import { Link, useParams, useNavigate, useSearchParams } from "react-router-dom";
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
  price?: number;
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

// Data - should match StreamingServices.tsx
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

// Helper function to get service by ID
const getServiceById = (id: number): StreamingService | undefined => {
  return STREAMING_SERVICES.find(service => service.id === id);
};

const StreamingServiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const serviceId = id ? parseInt(id, 10) : null;
  const service = serviceId ? getServiceById(serviceId) : null;

  // Get selected plan from URL query parameter
  const selectedPlanId = searchParams.get("plan");
  const [selectedPlan, setSelectedPlan] = useState<number | null>(
    selectedPlanId ? parseInt(selectedPlanId, 10) : null
  );

  // Redirect if service not found
  useEffect(() => {
    if (serviceId && !service) {
      navigate("/streaming-services");
    }
  }, [serviceId, service, navigate]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // Set selected plan when component mounts or plan changes
  useEffect(() => {
    if (selectedPlanId) {
      const planId = parseInt(selectedPlanId, 10);
      if (service && service.plans.some(p => p.id === planId)) {
        setSelectedPlan(planId);
        // Scroll to plans section after a short delay to ensure DOM is ready
        // Only scroll to section if plan parameter exists in URL
        setTimeout(() => {
          const plansSection = document.getElementById('subscription-plans');
          if (plansSection) {
            plansSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 500); // Increased delay to ensure scroll-to-top happens first
      }
    } else if (service && service.plans.length > 0) {
      // Default to first plan if no plan is selected
      setSelectedPlan(service.plans[0].id);
    }
  }, [selectedPlanId, service]);

  if (!service) {
    return (
      <div className="min-h-screen bg-white w-full">
        <Header />
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-12 text-center">
          <h2 className="text-2xl mb-4">Service not found</h2>
          <Link to="/streaming-services">
            <Button>Back to Streaming Services</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubscribe = (plan: SubscriptionPlan) => {
    // Navigate to checkout with service and plan details
    const params = new URLSearchParams({
      id: `${service.id}-${plan.id}`,
      name: `${service.name} - ${plan.duration}`,
      price: plan.isFreeTrial ? "0" : "0",
      image: service.image,
      region: "Global",
      brand: service.category,
      currency: "USD",
      regionalCurrency: "USD",
      category: "Streaming Services",
      duration: plan.duration,
      isFreeTrial: plan.isFreeTrial ? "true" : "false"
    });
    navigate(`/checkout?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white w-full" style={{ touchAction: "pan-y" }}>
      <Header />

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm mb-4 sm:mb-6 md:mb-8 text-muted-foreground flex-wrap"
        >
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link to="/streaming-services" className="hover:text-foreground">Streaming Services</Link>
          <span>/</span>
          <span className="text-foreground">{service.name}</span>
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-4 sm:mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-elegant text-sm sm:text-base"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </motion.div>

        {/* Service Detail Section */}
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 mb-12" style={{ touchAction: "pan-y" }}>
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            style={{ touchAction: "pan-y" }}
          >
            <div className="relative aspect-square bg-white rounded-sm overflow-hidden border border-border">
              <img
                src={service.image}
                alt={service.name}
                className="h-full w-full object-cover p-6"
                style={{ touchAction: "pan-y" }}
              />
            </div>
          </motion.div>

          {/* Service Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            style={{ touchAction: "pan-y" }}
          >
            <motion.span
              initial={{ opacity: 0.7 }}
              animate={{ opacity: 1 }}
              className="text-elegant text-sm text-primary mb-2 block"
            >
              {service.category}
            </motion.span>
            <h1 className="text-elegant text-3xl sm:text-4xl mb-4">
              {service.name}
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg mb-4 sm:mb-5">
              {service.description}
            </p>
            {service.category === "IPTV" && (
              <p className="text-sm sm:text-base text-muted-foreground mb-6">
                Enjoy comprehensive live TV coverage including <span className="font-semibold text-foreground">beIN SPORTS</span> alongside movies, series, and international channels.
              </p>
            )}

            {/* Detailed Description */}
            {service.detailedDescription && (
              <div className="mb-8">
                <h2 className="text-elegant text-xl sm:text-2xl mb-4">Service Details</h2>
                <div className="text-muted-foreground text-sm sm:text-base leading-relaxed space-y-3">
                  {service.detailedDescription.split('. ').filter(part => part.trim()).map((part, index) => {
                    const trimmedPart = part.trim();
                    if (!trimmedPart) return null;

                    // Format sections with colons
                    if (trimmedPart.includes(':')) {
                      const [category, ...rest] = trimmedPart.split(':');
                      const content = rest.join(':').trim();
                      return (
                        <div key={index} className="mb-3">
                          <span className="font-semibold text-foreground">{category.trim()}:</span>
                          {content && <span className="ml-2">{content}</span>}
                        </div>
                      );
                    }

                    return (
                      <p key={index}>
                        {trimmedPart}
                      </p>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Subscription Plans */}
            <div id="subscription-plans" className="mb-6 sm:mb-8 scroll-mt-24" style={{ touchAction: "pan-y" }}>
              <h2 className="text-elegant text-xl sm:text-2xl mb-3 sm:mb-4">Subscription Plans</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {service.plans.map((plan) => {
                  const isSelected = selectedPlan === plan.id;
                  return (
                    <motion.button
                      key={plan.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 text-left relative ${isSelected
                        ? plan.isFreeTrial
                          ? "bg-accent/20 border-accent shadow-lg"
                          : "bg-primary/10 border-primary shadow-lg"
                        : plan.isFreeTrial
                          ? "bg-accent/10 border-accent/30 hover:border-accent/50 hover:bg-accent/20"
                          : "bg-primary/5 border-primary/20 hover:border-primary/40 hover:bg-primary/10"
                        }`}
                      style={{ touchAction: "manipulation" }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-sm sm:text-base font-medium ${plan.isFreeTrial ? "text-accent" : "text-elegant"
                          }`}>
                          {plan.duration}
                        </span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {plan.isFreeTrial && (
                            <span className="text-[10px] sm:text-xs bg-accent text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded">
                              FREE
                            </span>
                          )}
                          {isSelected && (
                            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Subscribe Button */}
            <Button
              size="lg"
              className="w-full sm:w-auto text-elegant py-4 sm:py-5 md:py-6 text-sm sm:text-base"
              onClick={() => {
                // Navigate to checkout with selected plan
                const plan = service.plans.find(p => p.id === selectedPlan) || service.plans[0];
                if (plan) {
                  handleSubscribe(plan);
                }
              }}
              disabled={!selectedPlan}
            >
              <ShoppingCart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Subscribe Now
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default StreamingServiceDetail;

