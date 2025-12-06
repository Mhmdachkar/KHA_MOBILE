import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Phone, DollarSign, ShoppingBag, MessageCircle, ArrowLeft, Check, Plus, X, Minus, Trash2, MapPin } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/CartContext";
import { getProductById } from "@/data/products";
import { getGreenLionProductById } from "@/data/greenLionProducts";
import { useIsMobile } from "@/hooks/use-mobile";

// Import recharge images for display
import recharge1_67 from "@/assets/recharges/1.67$.png";
import recharge3_79 from "@/assets/recharges/3.79$.png";
import recharge4_50 from "@/assets/recharges/4.50$.png";
import recharge7_58 from "@/assets/recharges/7.58$.png";
import recharge10 from "@/assets/recharges/10$.png";
import recharge15_15 from "@/assets/recharges/15.15$.png";
import recharge22_73 from "@/assets/recharges/22.73$.png";
import recharge77_28 from "@/assets/recharges/77.28$.png";
import rechargeStart4_50 from "@/assets/recharges/start4.50$.png";
import rechargeSmart7_50 from "@/assets/recharges/smart7.50$.png";
import rechargeSuper13_50 from "@/assets/recharges/super13.50$.png";

// Import days recharge images
import recharge30days from "@/assets/recharges/days/30days.png";
import recharge60days from "@/assets/recharges/days/60days.png";
import recharge90days from "@/assets/recharges/days/90days.png";
import recharge180days from "@/assets/recharges/days/180days.png";
import recharge360days from "@/assets/recharges/days/360days.png";

// Recharge cards mapping
const RECHARGE_IMAGES: { [key: string]: string } = {
  "1.67": recharge1_67,
  "3.79": recharge3_79,
  "4.50": recharge4_50,
  "7.58": recharge7_58,
  "10": recharge10,
  "15.15": recharge15_15,
  "22.73": recharge22_73,
  "77.28": recharge77_28,
  "start4.50": rechargeStart4_50,
  "smart7.50": rechargeSmart7_50,
  "super13.50": rechargeSuper13_50,
};

// Additional Cards for the dropdown (Touch Cards)
const ADDITIONAL_TOUCH_CARDS = [
  { id: 1, name: "Touch $1.67 Card", price: 1.67, image: recharge1_67 },
  { id: 2, name: "Touch $3.79 Card", price: 3.79, image: recharge3_79 },
  { id: 3, name: "Touch $4.50 Card", price: 4.50, image: recharge4_50 },
  { id: 4, name: "Touch Start $4.50 Card", price: 4.50, image: rechargeStart4_50 },
  { id: 5, name: "Touch $7.58 Card", price: 7.58, image: recharge7_58 },
  { id: 6, name: "Touch Smart $7.50 Card", price: 7.50, image: rechargeSmart7_50 },
  { id: 7, name: "Touch $10 Card", price: 10, image: recharge10 },
  { id: 8, name: "Touch Super $13.50 Card", price: 20, image: rechargeSuper13_50 },
  { id: 9, name: "Touch $15.15 Card", price: 15.15, image: recharge15_15 },
  { id: 10, name: "Touch $22.73 Card", price: 22.73, image: recharge22_73 },
  { id: 11, name: "Touch $77.28 Card", price: 77.28, image: recharge77_28 },
];

// Additional Days Cards for the dropdown
const ADDITIONAL_DAYS_CARDS = [
  { id: 12, name: "30 Days Card", price: 2.8, image: recharge30days },
  { id: 13, name: "60 Days Card", price: 5.6, image: recharge60days },
  { id: 14, name: "90 Days Card", price: 8.4, image: recharge90days },
  { id: 15, name: "180 Days Card", price: 16.8, image: recharge180days },
  { id: 16, name: "360 Days Card", price: 33.6, image: recharge360days },
];

interface CheckoutFormData {
  // For product checkout
  customerName: string;
  phoneNumber: string;
  deliveryLocation: string;
  // For recharge/gift card checkout
  separateDollars: boolean;
  dollarsAmount: string;
  // For streaming service checkout
  accountType: string; // "1 user" or "full account"
}

interface AdditionalCard {
  id: number;
  name: string;
  price: number;
}

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const isMobile = useIsMobile();

  // Check if this is a recharge/gift card checkout (has URL params) or cart checkout
  const isRechargeCheckout = searchParams.has("name") || searchParams.has("price");

  // Get product details from URL params (for recharge/gift cards)
  const productName = searchParams.get("name") || "";
  const productPrice = parseFloat(searchParams.get("price") || "0");
  const productRegionalPrice = parseFloat(searchParams.get("regionalPrice") || "0");
  const productId = searchParams.get("id") || "1";
  const productImage = searchParams.get("image") || "";
  const productRegion = searchParams.get("region") || "";
  const productBrand = searchParams.get("brand") || "";
  const productCurrency = searchParams.get("currency") || "USD";
  const productRegionalCurrency = searchParams.get("regionalCurrency") || "USD";
  const productCategory = searchParams.get("category") || "Touch Cards";

  // Check if this is a streaming service checkout
  const isStreamingServiceCheckout = productCategory === "Streaming Services";
  const requiresAccountType =
    isStreamingServiceCheckout && (productBrand === "Netflix" || productBrand === "Shahid");

  // Check if this is a gift card (not a recharge card)
  const isGiftCard = productCategory === "Gift Cards" || productName.toLowerCase().includes("gift card");
  const isRechargeCard = isRechargeCheckout && !isGiftCard && !isStreamingServiceCheckout;

  // Monthly fee for streaming services
  const STREAMING_MONTHLY_FEE = 8.00;

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // Redirect to products if cart is empty and not a recharge checkout
  useEffect(() => {
    if (!isRechargeCheckout && cart.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checkout.",
        variant: "destructive",
      });
      navigate("/products");
    }
  }, [cart, isRechargeCheckout, navigate, toast]);

  // Get product image - prefer passed image, fallback to price-based lookup
  const getProductImage = () => {
    if (productImage) {
      return productImage;
    }
    const priceKey = productPrice.toString();
    return RECHARGE_IMAGES[priceKey] || recharge10;
  };

  const [formData, setFormData] = useState<CheckoutFormData>({
    customerName: "",
    phoneNumber: "",
    deliveryLocation: "",
    separateDollars: false,
    dollarsAmount: "",
    accountType: "1 user", // Default to "1 user"
  });

  const [errors, setErrors] = useState({
    customerName: "",
    phoneNumber: "",
    deliveryLocation: "",
    dollarsAmount: "",
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [additionalCards, setAdditionalCards] = useState<AdditionalCard[]>([]);

  // Validate customer name
  const validateCustomerName = (name: string): boolean => {
    if (!name || name.trim().length < 2) {
      setErrors(prev => ({
        ...prev,
        customerName: "Please enter a valid name (at least 2 characters)"
      }));
      return false;
    }
    setErrors(prev => ({ ...prev, customerName: "" }));
    return true;
  };

  // Validate delivery location
  const validateDeliveryLocation = (location: string): boolean => {
    if (!location || location.trim().length < 5) {
      setErrors(prev => ({
        ...prev,
        deliveryLocation: "Please enter a valid delivery address (at least 5 characters)"
      }));
      return false;
    }
    setErrors(prev => ({ ...prev, deliveryLocation: "" }));
    return true;
  };

  // Validate Lebanese phone number
  const validatePhoneNumber = (phone: string): boolean => {
    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, "");

    // Lebanese phone number patterns:
    // Mobile: 03, 70, 71, 76, 78, 79, 81 (followed by 6 digits)
    // Landline: 01, 04, 05, 06, 07, 08, 09 (followed by 6 digits)
    // With country code: +961 or 961 prefix

    let phoneToCheck = digitsOnly;

    // Remove country code if present
    if (phoneToCheck.startsWith("961")) {
      phoneToCheck = phoneToCheck.substring(3);
    }

    // Check if it's a valid Lebanese number (8 digits after removing country code)
    if (phoneToCheck.length !== 8) {
      setErrors(prev => ({
        ...prev,
        phoneNumber: "Lebanese phone numbers must be 8 digits (after country code)"
      }));
      return false;
    }

    // Check if it starts with valid Lebanese prefixes
    const validPrefixes = ["03", "70", "71", "76", "78", "79", "81", "01", "04", "05", "06", "07", "08", "09"];
    const prefix = phoneToCheck.substring(0, 2);

    if (!validPrefixes.includes(prefix)) {
      setErrors(prev => ({
        ...prev,
        phoneNumber: "Please enter a valid Lebanese phone number"
      }));
      return false;
    }

    setErrors(prev => ({ ...prev, phoneNumber: "" }));
    return true;
  };

  // Validate dollars amount
  const validateDollarsAmount = (amount: string): boolean => {
    if (!formData.separateDollars) return true;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrors(prev => ({
        ...prev,
        dollarsAmount: "Please enter a valid amount"
      }));
      return false;
    }

    setErrors(prev => ({ ...prev, dollarsAmount: "" }));
    return true;
  };

  // Format Lebanese phone number as user types
  const formatLebanesePhoneNumber = (value: string): string => {
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, "");

    // Handle country code
    if (digitsOnly.startsWith("961")) {
      const localNumber = digitsOnly.substring(3);
      if (localNumber.length === 0) return "+961 ";
      if (localNumber.length <= 2) return `+961 ${localNumber}`;
      if (localNumber.length <= 5) return `+961 ${localNumber.substring(0, 2)} ${localNumber.substring(2)}`;
      return `+961 ${localNumber.substring(0, 2)} ${localNumber.substring(2, 5)} ${localNumber.substring(5)}`;
    }

    // Handle local number without country code
    if (digitsOnly.length === 0) return "";
    if (digitsOnly.length <= 2) return digitsOnly;
    if (digitsOnly.length <= 5) return `${digitsOnly.substring(0, 2)} ${digitsOnly.substring(2)}`;
    return `${digitsOnly.substring(0, 2)} ${digitsOnly.substring(2, 5)} ${digitsOnly.substring(5)}`;
  };

  // Handle form input changes
  const handleCustomerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, customerName: value }));
    if (value) validateCustomerName(value);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formattedValue = formatLebanesePhoneNumber(value);
    setFormData(prev => ({ ...prev, phoneNumber: formattedValue }));
    if (value) validatePhoneNumber(value);
  };

  const handleDeliveryLocationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, deliveryLocation: value }));
    if (value) validateDeliveryLocation(value);
  };

  const handleDollarsAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, dollarsAmount: value }));
    if (value) validateDollarsAmount(value);
  };

  const handleSeparateDollarsChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      separateDollars: checked,
      dollarsAmount: checked ? prev.dollarsAmount : ""
    }));
    if (!checked) {
      setErrors(prev => ({ ...prev, dollarsAmount: "" }));
    }
  };

  // Add additional card
  const handleAddAdditionalCard = (cardId: string) => {
    let card;
    if (productCategory === "Touch Cards") {
      card = ADDITIONAL_TOUCH_CARDS.find(c => c.id.toString() === cardId);
    } else if (productCategory === "Days Cards") {
      card = ADDITIONAL_DAYS_CARDS.find(c => c.id.toString() === cardId);
    }

    if (card && !additionalCards.find(c => c.id === card.id)) {
      setAdditionalCards(prev => [...prev, card]);
    }
  };

  // Get available cards based on category
  const getAvailableCards = () => {
    if (productCategory === "Touch Cards") {
      return ADDITIONAL_TOUCH_CARDS;
    } else if (productCategory === "Days Cards") {
      return ADDITIONAL_DAYS_CARDS;
    }
    return [];
  };

  // Remove additional card
  const handleRemoveAdditionalCard = (cardId: number) => {
    setAdditionalCards(prev => prev.filter(c => c.id !== cardId));
  };

  // Delivery fee constant
  const DELIVERY_FEE = 4.00;

  // Calculate total
  const calculateTotal = (): number => {
    if (isStreamingServiceCheckout) {
      // Streaming service checkout - includes $8 per month fee
      return productPrice + STREAMING_MONTHLY_FEE;
    } else if (isRechargeCheckout) {
      // Recharge/gift card checkout - no delivery fee
      let total = productPrice;

      // Add additional cards prices
      additionalCards.forEach(card => {
        total += card.price;
      });

      // Only add separate dollars for recharge cards, not gift cards
      if (isRechargeCard && formData.separateDollars && formData.dollarsAmount) {
        total += parseFloat(formData.dollarsAmount);
      }
      return total;
    } else {
      // Cart checkout - includes delivery fee for physical products
      const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      return subtotal + DELIVERY_FEE;
    }
  };

  // Get cart items with full product details
  const getCartItemsWithDetails = () => {
    return cart.map(item => {
      // Check both regular products and Green Lion products
      const regularProduct = getProductById(item.id);
      const greenLionProduct = item.id >= 5000 ? getGreenLionProductById(item.id) : null;
      const fullProduct = regularProduct || greenLionProduct;

      return {
        ...item,
        title: fullProduct?.title || item.name,
        description: fullProduct?.description || "",
      };
    });
  };

  // Handle WhatsApp payment
  const handleWhatsAppPayment = () => {
    // Validate form based on checkout type
    let isValid = true;

    if (isStreamingServiceCheckout) {
      // Streaming service checkout validation - only phone number required
      const isPhoneValid = validatePhoneNumber(formData.phoneNumber);
      isValid = isPhoneValid;
    } else if (isRechargeCheckout) {
      // Recharge/gift card checkout validation
      const isPhoneValid = validatePhoneNumber(formData.phoneNumber);
      // Only validate separate dollars for recharge cards, not gift cards
      const isDollarsValid = isRechargeCard ? validateDollarsAmount(formData.dollarsAmount) : true;
      isValid = isPhoneValid && isDollarsValid;
    } else {
      // Product checkout validation
      const isNameValid = validateCustomerName(formData.customerName);
      const isPhoneValid = validatePhoneNumber(formData.phoneNumber);
      const isLocationValid = validateDeliveryLocation(formData.deliveryLocation);
      isValid = isNameValid && isPhoneValid && isLocationValid;
    }

    if (!isValid) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before proceeding.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    // Prepare WhatsApp message
    const total = calculateTotal();
    let message = `*New Order Request*\n\n`;

    if (isStreamingServiceCheckout) {
      // Streaming service checkout message
      message += `• *Service:* ${productName}\n`;
      if (productPrice > 0) {
        message += `• *Service Price:* $${productPrice.toFixed(2)}\n`;
      }
      message += `• *Monthly Fee:* $${STREAMING_MONTHLY_FEE.toFixed(2)} per month\n`;
      if (requiresAccountType && formData.accountType) {
        message += `• *Account Type:* ${formData.accountType === "1 user" ? "1 User" : "Full Account"}\n`;
      }
      message += `\n• *Phone Number:* ${formData.phoneNumber}\n`;
    } else if (isRechargeCheckout) {
      // Recharge/gift card checkout message
      message += `• *Product:* ${productName}\n`;
      message += `• *Product Price:* $${productPrice.toFixed(2)}\n`;

      if (productRegion !== "USA" && productRegionalPrice > 0) {
        message += `• *Regional Price:* ${productRegionalCurrency} ${productRegionalPrice}\n`;
      }

      // Add additional cards
      if (additionalCards.length > 0) {
        message += `\n• *Additional Cards:*\n`;
        additionalCards.forEach((card) => {
          message += `  - ${card.name} - $${card.price.toFixed(2)}\n`;
        });
      }

      if (productRegion) {
        message += `• *Region:* ${productRegion}\n`;
      }
      if (productBrand) {
        message += `• *Brand:* ${productBrand}\n`;
      }

      message += `\n• *Phone Number:* ${formData.phoneNumber}\n`;

      // Only include separate dollars for recharge cards, not gift cards
      if (isRechargeCard && formData.separateDollars && formData.dollarsAmount) {
        message += `• *Separate Dollars:* $${parseFloat(formData.dollarsAmount).toFixed(2)}\n`;
      }
    } else {
      // Product checkout message
      message += `• *Customer Name:* ${formData.customerName}\n`;
      message += `• *Phone Number:* ${formData.phoneNumber}\n`;
      message += `• *Delivery Location:* ${formData.deliveryLocation}\n\n`;

      message += `• *Order Items:*\n`;
      cart.forEach((item) => {
        let itemLabel = item.name;
        if (item.variantLabel) {
          itemLabel += ` - ${item.variantLabel}`;
        }
        if (item.color) {
          itemLabel += ` (Color: ${item.color})`;
        }
        message += `  - ${itemLabel} (Qty: ${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}\n`;
      });

      const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      message += `\n• *Subtotal:* $${subtotal.toFixed(2)}\n`;
      message += `• *Delivery:* $${DELIVERY_FEE.toFixed(2)}\n`;
    }

    message += `\n*Total Amount:* $${total.toFixed(2)}\n`;
    message += `\nPlease confirm this order. Thank you!`;

    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);

    // Replace with your WhatsApp business number (format: country code + number without +)
    const whatsappNumber = "96181861811"; // WhatsApp business number for receiving orders
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    // Open WhatsApp
    window.open(whatsappUrl, "_blank");

    // Show success message
    toast({
      title: "Redirecting to WhatsApp",
      description: "Opening WhatsApp to complete your payment...",
    });

    // Clear cart after successful checkout (only for cart checkout)
    if (!isRechargeCheckout) {
      setTimeout(() => {
        clearCart();
        setIsProcessing(false);
      }, 2000);
    } else {
      setTimeout(() => {
        setIsProcessing(false);
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 w-full">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-4 sm:mb-6 md:mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-elegant text-sm sm:text-base"
          >
            <ArrowLeft className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            {isRechargeCheckout ? "Back to Cards" : "Back to Cart"}
          </Button>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-white rounded-lg p-4 sm:p-6 md:p-8 shadow-elegant border border-border">
              <h2 className="text-elegant text-xl sm:text-2xl mb-4 sm:mb-6">Order Summary</h2>

              {isStreamingServiceCheckout || isRechargeCheckout ? (
                <>
                  {/* Streaming Service/Recharge/Gift Card Product Image */}
                  <div className="aspect-[4/3] bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg mb-4 sm:mb-6 overflow-hidden border border-border">
                    <img
                      src={productImage || getProductImage()}
                      alt={productName}
                      className="w-full h-full object-contain p-4 sm:p-6 md:p-8"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg";
                      }}
                    />
                  </div>

                  {/* Streaming Service/Recharge/Gift Card Product Details */}
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-border">
                      <div className="flex-1 min-w-0">
                        <p className="text-elegant text-[10px] sm:text-xs text-primary mb-1">{productCategory}</p>
                        <h3 className="text-elegant text-base sm:text-lg">{productName}</h3>
                        {productRegion && (
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2">
                            <span className="text-[10px] sm:text-xs bg-primary/10 text-primary px-2 py-0.5 sm:py-1 rounded-full">
                              🌍 {productRegion}
                            </span>
                            {productBrand && (
                              <span className="text-[10px] sm:text-xs bg-accent/10 text-accent px-2 py-0.5 sm:py-1 rounded-full">
                                {productBrand}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="text-left sm:text-right flex-shrink-0">
                        {isStreamingServiceCheckout ? (
                          <>
                            {productPrice > 0 && (
                              <p className="text-elegant text-lg sm:text-xl font-medium">${productPrice.toFixed(2)}</p>
                            )}
                            <p className="text-xs sm:text-sm text-muted-foreground">+ $8.00/month</p>
                          </>
                        ) : (
                          <>
                            <p className="text-elegant text-lg sm:text-xl font-medium">${productPrice.toFixed(2)}</p>
                            {productRegion !== "USA" && productRegionalPrice > 0 && (
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                {productRegionalCurrency} {productRegionalPrice}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Cart Items */}
                  <div className="space-y-4 mb-6">
                    {getCartItemsWithDetails().map((item) => {
                      // Use color image if available, otherwise use regular image
                      const displayImage = (item as any).colorImage || item.image;
                      const uniqueKey = `${item.id}-${item.variantKey || "base"}-${(item as any).color || "no-color"}`;

                      return (
                        <motion.div
                          key={uniqueKey}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 border border-border rounded-lg bg-gradient-to-r from-primary/5 to-accent/5"
                        >
                          {/* Product Image - Shows color-specific image if available */}
                          <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-white border border-border flex-shrink-0">
                            <img
                              src={displayImage}
                              alt={item.name}
                              className="w-full h-full object-contain p-1"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/placeholder.svg";
                              }}
                            />
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <Link to={`/product/${item.id}`} className="hover:underline">
                              <h3 className="text-xs sm:text-sm font-medium text-elegant line-clamp-2 mb-1">
                                {item.name}
                              </h3>
                            </Link>
                            {item.variantLabel && (
                              <p className="text-[10px] sm:text-xs text-primary/80 mb-1">
                                {item.variantLabel}
                              </p>
                            )}
                            {(item as any).color && (
                              <p className="text-[10px] sm:text-xs text-accent/80 mb-1 font-medium">
                                Color: {(item as any).color}
                              </p>
                            )}
                            {item.category && (
                              <p className="text-[10px] sm:text-xs text-muted-foreground mb-1 sm:mb-2">{item.category}</p>
                            )}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mt-1 sm:mt-2">
                              <div className="flex items-center gap-1 sm:gap-2 border border-border rounded-lg">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => updateQuantity(item.id, item.quantity - 1, item.variantKey, (item as any).color)}
                                  className="h-6 w-6 sm:h-7 sm:w-7 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all"
                                >
                                  <Minus className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                </motion.button>
                                <span className="text-xs sm:text-sm font-medium w-6 sm:w-8 text-center">
                                  {item.quantity}
                                </span>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => updateQuantity(item.id, item.quantity + 1, item.variantKey, (item as any).color)}
                                  className="h-6 w-6 sm:h-7 sm:w-7 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all"
                                >
                                  <Plus className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                </motion.button>
                              </div>
                              <div className="text-left sm:text-right">
                                <p className="text-base sm:text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </p>
                                <p className="text-[10px] sm:text-xs text-muted-foreground">
                                  ${item.price.toFixed(2)} each
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Remove Button */}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeFromCart(item.id, item.variantKey, (item as any).color)}
                            className="h-6 w-6 sm:h-8 sm:w-8 rounded-full hover:bg-destructive hover:text-destructive-foreground transition-all flex items-center justify-center self-start"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </motion.button>
                        </motion.div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Additional Cards (only for recharge checkout, not streaming services) */}
              {isRechargeCheckout && !isStreamingServiceCheckout && additionalCards.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-3 pt-4 border-b border-border"
                >
                  <p className="text-sm font-medium text-muted-foreground mb-3">Additional Cards</p>
                  {additionalCards.map((card) => (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between py-2 px-3 bg-primary/5 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium">{card.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">${card.price.toFixed(2)}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAdditionalCard(card.id)}
                          className="h-6 w-6 p-0 hover:bg-red-100"
                        >
                          <X className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Monthly Fee - Only for streaming service checkout */}
              {isStreamingServiceCheckout && (
                <div className="flex items-center justify-between py-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">Monthly Fee</p>
                  </div>
                  <p className="text-lg font-medium">${STREAMING_MONTHLY_FEE.toFixed(2)}</p>
                </div>
              )}

              {/* Separate Dollars - Only for recharge cards (not gift cards or streaming services) */}
              {isRechargeCard && formData.separateDollars && formData.dollarsAmount && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex items-center justify-between py-4 border-b border-border"
                >
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">Separate Dollars</p>
                  </div>
                  <p className="text-lg font-medium">${parseFloat(formData.dollarsAmount).toFixed(2)}</p>
                </motion.div>
              )}

              {/* Subtotal and Total */}
              <div className="space-y-3 pt-4 border-t border-border">
                {isStreamingServiceCheckout && (
                  <>
                    {productPrice > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Service Price</span>
                        <span className="font-medium">${productPrice.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Monthly Fee</span>
                      <span className="font-medium">${STREAMING_MONTHLY_FEE.toFixed(2)}</span>
                    </div>
                  </>
                )}
                {!isRechargeCheckout && !isStreamingServiceCheckout && (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">
                        ${cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Delivery</span>
                      <span className="font-medium">${DELIVERY_FEE.toFixed(2)}</span>
                    </div>
                  </>
                )}
                {isRechargeCard && formData.separateDollars && formData.dollarsAmount && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Additional Dollars</span>
                    <span className="font-medium">${parseFloat(formData.dollarsAmount).toFixed(2)}</span>
                  </div>
                )}
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between pt-2">
                  <p className="text-elegant text-xl">Total</p>
                  <p className="text-elegant text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    ${calculateTotal().toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Security Notice */}
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-start gap-2 sm:gap-3">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs sm:text-sm font-medium mb-1">Secure Payment</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      Your payment will be processed securely via WhatsApp. We'll send your card details instantly after confirmation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Checkout Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white rounded-lg p-4 sm:p-6 md:p-8 shadow-elegant border border-border">
              <h2 className="text-elegant text-xl sm:text-2xl mb-4 sm:mb-6">Checkout Details</h2>

              <div className="space-y-4 sm:space-y-6">
                {isStreamingServiceCheckout ? (
                  <>
                    {/* Account Type Dropdown - Only for Netflix and Shahid */}
                    {requiresAccountType && (
                      <div>
                        <Label className="text-elegant text-sm mb-2 flex items-center gap-2">
                          Account Type
                          <span className="text-red-500">*</span>
                        </Label>
                        {isMobile ? (
                          <select
                            value={formData.accountType}
                            onChange={(event) =>
                              setFormData({ ...formData, accountType: event.target.value })
                            }
                            className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                            style={{ touchAction: "manipulation" }}
                          >
                            <option value="1 user">1 User</option>
                            <option value="full account">Full Account</option>
                          </select>
                        ) : (
                          <Select
                            value={formData.accountType}
                            onValueChange={(value) => {
                              setFormData({ ...formData, accountType: value });
                            }}
                          >
                            <SelectTrigger
                              className="mt-2"
                              id="accountType"
                              type="button"
                            >
                              <SelectValue placeholder="Select account type" />
                            </SelectTrigger>
                            <SelectContent
                              position="popper"
                              className="z-[100]"
                              onCloseAutoFocus={(e) => {
                                e.preventDefault();
                              }}
                              onEscapeKeyDown={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              <SelectItem value="1 user">1 User</SelectItem>
                              <SelectItem value="full account">Full Account</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Choose between single user access or full account access
                        </p>
                      </div>
                    )}

                    {/* Phone Number Field - Required (for streaming services) */}
                    <div>
                      <Label htmlFor="phoneNumber" className="text-elegant text-sm mb-2 flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone Number
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        placeholder="+961 70 123 456"
                        value={formData.phoneNumber}
                        onChange={handlePhoneChange}
                        className={`mt-2 ${errors.phoneNumber ? "border-red-500" : ""}`}
                        required
                      />
                      {errors.phoneNumber && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-red-500 mt-2"
                        >
                          {errors.phoneNumber}
                        </motion.p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Lebanese phone number required. We'll send your subscription details to this number
                      </p>
                    </div>
                  </>
                ) : isRechargeCheckout ? (
                  <>
                    {/* Phone Number Field - Required (for recharge/gift cards) */}
                    <div>
                      <Label htmlFor="phoneNumber" className="text-elegant text-sm mb-2 flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone Number
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        placeholder="+961 70 123 456"
                        value={formData.phoneNumber}
                        onChange={handlePhoneChange}
                        className={`mt-2 ${errors.phoneNumber ? "border-red-500" : ""}`}
                        required
                      />
                      {errors.phoneNumber && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-red-500 mt-2"
                        >
                          {errors.phoneNumber}
                        </motion.p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Lebanese phone number required. We'll send your recharge card to this number
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Customer Name Field - Required (for product checkout) */}
                    <div>
                      <Label htmlFor="customerName" className="text-elegant text-sm mb-2 flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4" />
                        Full Name
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="customerName"
                        type="text"
                        placeholder="John Doe"
                        value={formData.customerName}
                        onChange={handleCustomerNameChange}
                        className={`mt-2 ${errors.customerName ? "border-red-500" : ""}`}
                        required
                      />
                      {errors.customerName && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-red-500 mt-2"
                        >
                          {errors.customerName}
                        </motion.p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Enter your full name for order processing
                      </p>
                    </div>

                    {/* Phone Number Field - Required (for product checkout) */}
                    <div>
                      <Label htmlFor="phoneNumber" className="text-elegant text-sm mb-2 flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone Number
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        placeholder="+961 70 123 456"
                        value={formData.phoneNumber}
                        onChange={handlePhoneChange}
                        className={`mt-2 ${errors.phoneNumber ? "border-red-500" : ""}`}
                        required
                      />
                      {errors.phoneNumber && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-red-500 mt-2"
                        >
                          {errors.phoneNumber}
                        </motion.p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Lebanese phone number required for order updates and delivery coordination
                      </p>
                    </div>

                    {/* Delivery Location Field - Required (for product checkout) */}
                    <div>
                      <Label htmlFor="deliveryLocation" className="text-elegant text-sm mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Delivery Address
                        <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="deliveryLocation"
                        placeholder="Street address, Building number, City, Area, Landmarks..."
                        value={formData.deliveryLocation}
                        onChange={handleDeliveryLocationChange}
                        className={`mt-2 min-h-[100px] resize-y ${errors.deliveryLocation ? "border-red-500" : ""}`}
                        required
                      />
                      {errors.deliveryLocation && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-red-500 mt-2"
                        >
                          {errors.deliveryLocation}
                        </motion.p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Enter the complete delivery address where you want to receive your order. Include street, building, area, and any landmarks.
                      </p>
                    </div>
                  </>
                )}

                {/* Additional Cards Dropdown - Only for Touch Cards and Days Cards (recharge checkout, not streaming services) */}
                {isRechargeCheckout && !isStreamingServiceCheckout && (productCategory === "Touch Cards" || productCategory === "Days Cards") && (
                  <div className="pt-4 border-t border-border">
                    <Label className="text-elegant text-sm mb-3 flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Additional Card (Optional)
                    </Label>
                    <Select onValueChange={handleAddAdditionalCard}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={`Select another ${productCategory}...`} />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableCards().map((card) => (
                          <SelectItem
                            key={card.id}
                            value={card.id.toString()}
                            disabled={additionalCards.some(c => c.id === card.id)}
                          >
                            {card.name} - ${card.price.toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-2">
                      Add more cards to your order without checking out twice
                    </p>
                  </div>
                )}

                {/* Separate Dollars Option - Only for recharge cards (not gift cards or streaming services) */}
                {isRechargeCard && (
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center space-x-2 mb-4">
                      <Checkbox
                        id="separateDollars"
                        checked={formData.separateDollars}
                        onCheckedChange={handleSeparateDollarsChange}
                      />
                      <Label
                        htmlFor="separateDollars"
                        className="text-sm font-medium cursor-pointer"
                      >
                        Add separate dollars to my order
                      </Label>
                    </div>

                    {formData.separateDollars && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.3 }}
                      >
                        <Label htmlFor="dollarsAmount" className="text-elegant text-sm mb-2 flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Amount in Dollars
                        </Label>
                        <Input
                          id="dollarsAmount"
                          type="number"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          value={formData.dollarsAmount}
                          onChange={handleDollarsAmountChange}
                          className={`mt-2 ${errors.dollarsAmount ? "border-red-500" : ""}`}
                        />
                        {errors.dollarsAmount && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs text-red-500 mt-2"
                          >
                            {errors.dollarsAmount}
                          </motion.p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Optional: Add extra dollars to your purchase
                        </p>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Payment Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="pt-6"
                >
                  <Button
                    onClick={handleWhatsAppPayment}
                    disabled={
                      isProcessing ||
                      (isStreamingServiceCheckout
                        ? !formData.phoneNumber
                        : isRechargeCheckout
                          ? !formData.phoneNumber
                          : !formData.customerName || !formData.phoneNumber || !formData.deliveryLocation)
                    }
                    className="w-full bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#128C7E] hover:to-[#25D366] text-white py-6 text-lg shadow-lg"
                  >
                    {isProcessing ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="mr-2"
                        >
                          <ShoppingBag className="h-5 w-5" />
                        </motion.div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <MessageCircle className="mr-2 h-5 w-5" />
                        Pay with WhatsApp - ${calculateTotal().toFixed(2)}
                      </>
                    )}
                  </Button>
                </motion.div>

                {/* Payment Info */}
                <div className="pt-3 sm:pt-4 space-y-2 sm:space-y-3">
                  <div className="flex items-start gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
                    <Check className="h-3 w-3 sm:h-4 sm:w-4 text-primary mt-0.5 flex-shrink-0" />
                    <p>Instant delivery via WhatsApp after payment confirmation</p>
                  </div>
                  <div className="flex items-start gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
                    <Check className="h-3 w-3 sm:h-4 sm:w-4 text-primary mt-0.5 flex-shrink-0" />
                    <p>Secure payment process - your information is protected</p>
                  </div>
                  <div className="flex items-start gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
                    <Check className="h-3 w-3 sm:h-4 sm:w-4 text-primary mt-0.5 flex-shrink-0" />
                    <p>24/7 customer support available</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
