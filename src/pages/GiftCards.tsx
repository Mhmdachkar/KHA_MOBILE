import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Grid3x3, List, ShoppingCart, Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Import all iTunes USA gift card images
import itunesUSA2 from "@/assets/gift cards/itunes/USA/2$.png";
import itunesUSA3 from "@/assets/gift cards/itunes/USA/3$.png";
import itunesUSA4 from "@/assets/gift cards/itunes/USA/4$.png";
import itunesUSA5 from "@/assets/gift cards/itunes/USA/5$.png";
import itunesUSA10 from "@/assets/gift cards/itunes/USA/10$.png";
import itunesUSA15 from "@/assets/gift cards/itunes/USA/15$.png";
import itunesUSA20 from "@/assets/gift cards/itunes/USA/20$.png";
import itunesUSA25 from "@/assets/gift cards/itunes/USA/25$.png";
import itunesUSA30 from "@/assets/gift cards/itunes/USA/30$.png";
import itunesUSA50 from "@/assets/gift cards/itunes/USA/50$.png";
import itunesUSA100 from "@/assets/gift cards/itunes/USA/100$.png";
import itunesUSA150 from "@/assets/gift cards/itunes/USA/150$.png";
import itunesUSA200 from "@/assets/gift cards/itunes/USA/200$.png";
import itunesUSA300 from "@/assets/gift cards/itunes/USA/300$.png";
import itunesUSA400 from "@/assets/gift cards/itunes/USA/400$.png";
import itunesUSA500 from "@/assets/gift cards/itunes/USA/500$.png";

// Import all iTunes UAE gift card images
import itunesUAE50 from "@/assets/gift cards/itunes/UAE/50AED.png";
import itunesUAE100 from "@/assets/gift cards/itunes/UAE/100AED.png";
import itunesUAE250 from "@/assets/gift cards/itunes/UAE/250AED.png";
import itunesUAE500 from "@/assets/gift cards/itunes/UAE/500AED.png";

// Import all iTunes KSA gift card images
import itunesKSA50 from "@/assets/gift cards/itunes/KSA/50SAR.png";
import itunesKSA75 from "@/assets/gift cards/itunes/KSA/75SAR.png";
import itunesKSA100 from "@/assets/gift cards/itunes/KSA/100SAR.png";
import itunesKSA150 from "@/assets/gift cards/itunes/KSA/150SAR.png";
import itunesKSA200 from "@/assets/gift cards/itunes/KSA/200SAR.png";
import itunesKSA250 from "@/assets/gift cards/itunes/KSA/250SAR.png";
import itunesKSA300 from "@/assets/gift cards/itunes/KSA/300SAR.png";
import itunesKSA350 from "@/assets/gift cards/itunes/KSA/350SAR.png";
import itunesKSA500 from "@/assets/gift cards/itunes/KSA/500SAR.png";

// Import all PlayStation Store USA gift card images
import psUSA10 from "@/assets/gift cards/playtaition_store/USA/10$.png";
import psUSA25 from "@/assets/gift cards/playtaition_store/USA/25$.png";
import psUSA50 from "@/assets/gift cards/playtaition_store/USA/50$.png";
import psUSA75 from "@/assets/gift cards/playtaition_store/USA/75$.png";
import psUSA100 from "@/assets/gift cards/playtaition_store/USA/100$.png";

// Import all PlayStation Store UAE gift card images
import psUAE10 from "@/assets/gift cards/playtaition_store/UAE/10$.png";
import psUAE20 from "@/assets/gift cards/playtaition_store/UAE/20$.png";
import psUAE40 from "@/assets/gift cards/playtaition_store/UAE/40$.png";
import psUAE50 from "@/assets/gift cards/playtaition_store/UAE/50$.png";
import psUAE60 from "@/assets/gift cards/playtaition_store/UAE/60$.png";
import psUAE70 from "@/assets/gift cards/playtaition_store/UAE/70$.png";
import psUAE100 from "@/assets/gift cards/playtaition_store/UAE/100$.png";
import psUAE120 from "@/assets/gift cards/playtaition_store/UAE/120$.png";
import psUAE160 from "@/assets/gift cards/playtaition_store/UAE/160$.png";
import psUAE200 from "@/assets/gift cards/playtaition_store/UAE/200$.png";

// Import all PlayStation Store KSA gift card images
import psKSA10 from "@/assets/gift cards/playtaition_store/KSA/10$.png";
import psKSA20 from "@/assets/gift cards/playtaition_store/KSA/20$.png";
import psKSA40 from "@/assets/gift cards/playtaition_store/KSA/40$.png";
import psKSA50 from "@/assets/gift cards/playtaition_store/KSA/50$.png";
import psKSA60 from "@/assets/gift cards/playtaition_store/KSA/60$.png";
import psKSA70 from "@/assets/gift cards/playtaition_store/KSA/70$.png";

// Import all PlayStation Store OMAN gift card images
import psOMAN10 from "@/assets/gift cards/playtaition_store/OMAN/10$.png";
import psOMAN20 from "@/assets/gift cards/playtaition_store/OMAN/20$.png";
import psOMAN40 from "@/assets/gift cards/playtaition_store/OMAN/40$.png";
import psOMAN45 from "@/assets/gift cards/playtaition_store/OMAN/45$.png";
import psOMAN50 from "@/assets/gift cards/playtaition_store/OMAN/50$.png";
import psOMAN60 from "@/assets/gift cards/playtaition_store/OMAN/60$.png";
import psOMAN70 from "@/assets/gift cards/playtaition_store/OMAN/70$.png";
import psOMAN100 from "@/assets/gift cards/playtaition_store/OMAN/100$.png";

// Import all PlayStation Store LEB gift card images
import psLEB10 from "@/assets/gift cards/playtaition_store/LEB/10$.png";
import psLEB20 from "@/assets/gift cards/playtaition_store/LEB/20$.png";
import psLEB40 from "@/assets/gift cards/playtaition_store/LEB/40$.png";
import psLEB50 from "@/assets/gift cards/playtaition_store/LEB/50$.png";
import psLEB100 from "@/assets/gift cards/playtaition_store/LEB/100$.png";

// Import Anghami gift card images
import anghami5 from "@/assets/gift cards/anghami/5$.png";
import anghami7_5Family from "@/assets/gift cards/anghami/7.5$_family.png";
import anghami8 from "@/assets/gift cards/anghami/8$.png";
import anghami15 from "@/assets/gift cards/anghami/15$.png";
import anghami25 from "@/assets/gift cards/anghami/25$.png";
import anghami50 from "@/assets/gift cards/anghami/50$.png";
import anghami75Family from "@/assets/gift cards/anghami/75$_family.png";
import anghami88 from "@/assets/gift cards/anghami/88$.png";

// Import Fortnite gift card images
import fortnite10 from "@/assets/gift cards/fortnite/10$.png";
import fortnite25 from "@/assets/gift cards/fortnite/25$.png";
import fortnite100 from "@/assets/gift cards/fortnite/100$.png";

// Import Free Fire gift card images
import freefire1 from "@/assets/gift cards/free fire/1$.png";
import freefire2 from "@/assets/gift cards/free fire/2$.png";
import freefire5 from "@/assets/gift cards/free fire/5$.png";
import freefire10 from "@/assets/gift cards/free fire/10$.png";
import freefire20 from "@/assets/gift cards/free fire/20$.png";

// Import PUBG gift card images
import pubg1 from "@/assets/gift cards/pupg/1$.png";
import pubg5 from "@/assets/gift cards/pupg/5$.png";
import pubg10 from "@/assets/gift cards/pupg/10$.png";
import pubg25 from "@/assets/gift cards/pupg/25$.png";
import pubg50 from "@/assets/gift cards/pupg/50$.png";
import pubg100 from "@/assets/gift cards/pupg/100$.png";
import pubg200 from "@/assets/gift cards/pupg/200$.png";
import pubg300 from "@/assets/gift cards/pupg/300$.png";
import pubg400 from "@/assets/gift cards/pupg/400$.png";

// Import Roblox gift card images
import roblox10 from "@/assets/gift cards/roblox/10$.png";
import roblox20 from "@/assets/gift cards/roblox/20$.png";
import roblox25 from "@/assets/gift cards/roblox/25$.png";
import roblox50 from "@/assets/gift cards/roblox/50$.png";

// Types
interface GiftCard {
  id: number;
  name: string;
  price: number; // Price in USD
  regionalPrice: number; // Price in regional currency
  image: string;
  region: string;
  brand: string;
  currency: string;
  regionalCurrency: string;
}

interface FilterState {
  regions: string[];
  brands: string[];
  priceRange: number[];
  selectedPriceRanges: string[];
  sortBy: string;
}

type ViewMode = "grid" | "list";

// Data
const GIFT_CARDS: GiftCard[] = [
  // iTunes USA Cards
  {
    id: 1,
    name: "iTunes USA $2 Gift Card",
    price: 2,
    regionalPrice: 2,
    image: itunesUSA2,
    region: "USA",
    brand: "iTunes",
    currency: "USD",
    regionalCurrency: "USD"
  },
  {
    id: 2,
    name: "iTunes USA $3 Gift Card",
    price: 3,
    regionalPrice: 3,
    image: itunesUSA3,
    region: "USA",
    brand: "iTunes",
    currency: "USD",
    regionalCurrency: "USD"
  },
  {
    id: 3,
    name: "iTunes USA $4 Gift Card",
    price: 4,
    regionalPrice: 4,
    image: itunesUSA4,
    region: "USA",
    brand: "iTunes",
    currency: "USD",
    regionalCurrency: "USD"
  },
  {
    id: 4,
    name: "iTunes USA $5 Gift Card",
    price: 5,
    regionalPrice: 5,
    image: itunesUSA5,
    region: "USA",
    brand: "iTunes",
    currency: "USD",
    regionalCurrency: "USD"
  },
  {
    id: 5,
    name: "iTunes USA $10 Gift Card",
    price: 10,
    regionalPrice: 10,
    image: itunesUSA10,
    region: "USA",
    brand: "iTunes",
    currency: "USD",
    regionalCurrency: "USD"
  },
  {
    id: 6,
    name: "iTunes USA $15 Gift Card",
    price: 15,
    regionalPrice: 15,
    image: itunesUSA15,
    region: "USA",
    brand: "iTunes",
    currency: "USD",
    regionalCurrency: "USD"
  },
  {
    id: 7,
    name: "iTunes USA $20 Gift Card",
    price: 20,
    regionalPrice: 20,
    image: itunesUSA20,
    region: "USA",
    brand: "iTunes",
    currency: "USD",
    regionalCurrency: "USD"
  },
  {
    id: 8,
    name: "iTunes USA $25 Gift Card",
    price: 25,
    regionalPrice: 25,
    image: itunesUSA25,
    region: "USA",
    brand: "iTunes",
    currency: "USD",
    regionalCurrency: "USD"
  },
  {
    id: 9,
    name: "iTunes USA $30 Gift Card",
    price: 30,
    regionalPrice: 30,
    image: itunesUSA30,
    region: "USA",
    brand: "iTunes",
    currency: "USD",
    regionalCurrency: "USD"
  },
  {
    id: 10,
    name: "iTunes USA $50 Gift Card",
    price: 50,
    regionalPrice: 50,
    image: itunesUSA50,
    region: "USA",
    brand: "iTunes",
    currency: "USD",
    regionalCurrency: "USD"
  },
  {
    id: 11,
    name: "iTunes USA $100 Gift Card",
    price: 100,
    regionalPrice: 100,
    image: itunesUSA100,
    region: "USA",
    brand: "iTunes",
    currency: "USD",
    regionalCurrency: "USD"
  },
  {
    id: 12,
    name: "iTunes USA $150 Gift Card",
    price: 150,
    regionalPrice: 150,
    image: itunesUSA150,
    region: "USA",
    brand: "iTunes",
    currency: "USD",
    regionalCurrency: "USD"
  },
  {
    id: 13,
    name: "iTunes USA $200 Gift Card",
    price: 200,
    regionalPrice: 200,
    image: itunesUSA200,
    region: "USA",
    brand: "iTunes",
    currency: "USD",
    regionalCurrency: "USD"
  },
  {
    id: 14,
    name: "iTunes USA $300 Gift Card",
    price: 300,
    regionalPrice: 300,
    image: itunesUSA300,
    region: "USA",
    brand: "iTunes",
    currency: "USD",
    regionalCurrency: "USD"
  },
  {
    id: 15,
    name: "iTunes USA $400 Gift Card",
    price: 400,
    regionalPrice: 400,
    image: itunesUSA400,
    region: "USA",
    brand: "iTunes",
    currency: "USD",
    regionalCurrency: "USD"
  },
  {
    id: 16,
    name: "iTunes USA $500 Gift Card",
    price: 500,
    regionalPrice: 500,
    image: itunesUSA500,
    region: "USA",
    brand: "iTunes",
    currency: "USD",
    regionalCurrency: "USD"
  },

  // iTunes UAE Cards
  {
    id: 17,
    name: "iTunes UAE 50 AED Gift Card",
    price: 13.61,
    regionalPrice: 50,
    image: itunesUAE50,
    region: "UAE",
    brand: "iTunes",
    currency: "USD",
    regionalCurrency: "AED"
  },
  {
    id: 18,
    name: "iTunes UAE 100 AED Gift Card",
    price: 27.22,
    regionalPrice: 100,
    image: itunesUAE100,
    region: "UAE",
    brand: "iTunes",
    currency: "USD",
    regionalCurrency: "AED"
  },
  {
    id: 19,
    name: "iTunes UAE 250 AED Gift Card",
    price: 68.06,
    regionalPrice: 250,
    image: itunesUAE250,
    region: "UAE",
    brand: "iTunes",
    currency: "USD",
    regionalCurrency: "AED"
  },
  {
    id: 20,
    name: "iTunes UAE 500 AED Gift Card",
    price: 136.11,
    regionalPrice: 500,
    image: itunesUAE500,
    region: "UAE",
    brand: "iTunes",
    currency: "USD",
    regionalCurrency: "AED"
  },

  // iTunes KSA Cards
  {
    id: 21,
    name: "iTunes KSA 50 SAR Gift Card",
    price: 13.33,
    regionalPrice: 50,
    image: itunesKSA50,
    region: "KSA",
    brand: "iTunes",
    currency: "USD",
    regionalCurrency: "SAR"
  },
  {
    id: 22,
    name: "iTunes KSA 75 SAR Gift Card",
    price: 20.00,
    regionalPrice: 75,
    image: itunesKSA75,
    region: "KSA",
    brand: "iTunes",
    currency: "USD",
    regionalCurrency: "SAR"
  },
  {
    id: 23,
    name: "iTunes KSA 100 SAR Gift Card",
    price: 26.67,
    regionalPrice: 100,
    image: itunesKSA100,
    region: "KSA",
    brand: "iTunes",
    currency: "USD",
    regionalCurrency: "SAR"
  },
  {
    id: 24,
    name: "iTunes KSA 150 SAR Gift Card",
    price: 40.00,
    regionalPrice: 150,
    image: itunesKSA150,
    region: "KSA",
    brand: "iTunes",
    currency: "USD",
    regionalCurrency: "SAR"
  },
  {
    id: 25,
    name: "iTunes KSA 200 SAR Gift Card",
    price: 53.33,
    regionalPrice: 200,
    image: itunesKSA200,
    region: "KSA",
    brand: "iTunes",
    currency: "USD",
    regionalCurrency: "SAR"
  },
  {
    id: 26,
    name: "iTunes KSA 250 SAR Gift Card",
    price: 66.67,
    regionalPrice: 250,
    image: itunesKSA250,
    region: "KSA",
    brand: "iTunes",
    currency: "USD",
    regionalCurrency: "SAR"
  },
  {
    id: 27,
    name: "iTunes KSA 300 SAR Gift Card",
    price: 80.00,
    regionalPrice: 300,
    image: itunesKSA300,
    region: "KSA",
    brand: "iTunes",
    currency: "USD",
    regionalCurrency: "SAR"
  },
  {
    id: 28,
    name: "iTunes KSA 350 SAR Gift Card",
    price: 93.33,
    regionalPrice: 350,
    image: itunesKSA350,
    region: "KSA",
    brand: "iTunes",
    currency: "USD",
    regionalCurrency: "SAR"
  },
  {
    id: 29,
    name: "iTunes KSA 500 SAR Gift Card",
    price: 133.33,
    regionalPrice: 500,
    image: itunesKSA500,
    region: "KSA",
    brand: "iTunes",
    currency: "USD",
    regionalCurrency: "SAR"
  },

  // PlayStation Store USA Cards
  {
    id: 30,
    name: "PlayStation Store USA $10 Gift Card",
    price: 10,
    regionalPrice: 10,
    image: psUSA10,
    region: "USA",
    brand: "PlayStation Store",
    currency: "USD",
    regionalCurrency: "USD"
  },
  {
    id: 31,
    name: "PlayStation Store USA $25 Gift Card",
    price: 25,
    regionalPrice: 25,
    image: psUSA25,
    region: "USA",
    brand: "PlayStation Store",
    currency: "USD",
    regionalCurrency: "USD"
  },
  {
    id: 32,
    name: "PlayStation Store USA $50 Gift Card",
    price: 50,
    regionalPrice: 50,
    image: psUSA50,
    region: "USA",
    brand: "PlayStation Store",
    currency: "USD",
    regionalCurrency: "USD"
  },
  {
    id: 33,
    name: "PlayStation Store USA $75 Gift Card",
    price: 75,
    regionalPrice: 75,
    image: psUSA75,
    region: "USA",
    brand: "PlayStation Store",
    currency: "USD",
    regionalCurrency: "USD"
  },
  {
    id: 34,
    name: "PlayStation Store USA $100 Gift Card",
    price: 100,
    regionalPrice: 100,
    image: psUSA100,
    region: "USA",
    brand: "PlayStation Store",
    currency: "USD",
    regionalCurrency: "USD"
  },

  // PlayStation Store UAE Cards
  {
    id: 35,
    name: "PlayStation Store UAE $10 Gift Card",
    price: 10,
    regionalPrice: 37,
    image: psUAE10,
    region: "UAE",
    brand: "PlayStation Store",
    currency: "USD",
    regionalCurrency: "AED"
  },
  {
    id: 36,
    name: "PlayStation Store UAE $20 Gift Card",
    price: 20,
    regionalPrice: 74,
    image: psUAE20,
    region: "UAE",
    brand: "PlayStation Store",
    currency: "USD",
    regionalCurrency: "AED"
  },
  {
    id: 37,
    name: "PlayStation Store UAE $40 Gift Card",
    price: 40,
    regionalPrice: 148,
    image: psUAE40,
    region: "UAE",
    brand: "PlayStation Store",
    currency: "USD",
    regionalCurrency: "AED"
  },
  {
    id: 38,
    name: "PlayStation Store UAE $50 Gift Card",
    price: 50,
    regionalPrice: 185,
    image: psUAE50,
    region: "UAE",
    brand: "PlayStation Store",
    currency: "USD",
    regionalCurrency: "AED"
  },
  {
    id: 39,
    name: "PlayStation Store UAE $60 Gift Card",
    price: 60,
    regionalPrice: 222,
    image: psUAE60,
    region: "UAE",
    brand: "PlayStation Store",
    currency: "USD",
    regionalCurrency: "AED"
  },
  {
    id: 40,
    name: "PlayStation Store UAE $70 Gift Card",
    price: 70,
    regionalPrice: 259,
    image: psUAE70,
    region: "UAE",
    brand: "PlayStation Store",
    currency: "USD",
    regionalCurrency: "AED"
  },
  {
    id: 41,
    name: "PlayStation Store UAE $100 Gift Card",
    price: 100,
    regionalPrice: 370,
    image: psUAE100,
    region: "UAE",
    brand: "PlayStation Store",
    currency: "USD",
    regionalCurrency: "AED"
  },
  {
    id: 42,
    name: "PlayStation Store UAE $120 Gift Card",
    price: 120,
    regionalPrice: 444,
    image: psUAE120,
    region: "UAE",
    brand: "PlayStation Store",
    currency: "USD",
    regionalCurrency: "AED"
  },
  {
    id: 43,
    name: "PlayStation Store UAE $160 Gift Card",
    price: 160,
    regionalPrice: 592,
    image: psUAE160,
    region: "UAE",
    brand: "PlayStation Store",
    currency: "USD",
    regionalCurrency: "AED"
  },
  {
    id: 44,
    name: "PlayStation Store UAE $200 Gift Card",
    price: 200,
    regionalPrice: 740,
    image: psUAE200,
    region: "UAE",
    brand: "PlayStation Store",
    currency: "USD",
    regionalCurrency: "AED"
  },

  // PlayStation Store KSA Cards
  {
    id: 45,
    name: "PlayStation Store KSA $10 Gift Card",
    price: 10,
    regionalPrice: 38,
    image: psKSA10,
    region: "KSA",
    brand: "PlayStation Store",
    currency: "USD",
    regionalCurrency: "SAR"
  },
  {
    id: 46,
    name: "PlayStation Store KSA $20 Gift Card",
    price: 20,
    regionalPrice: 76,
    image: psKSA20,
    region: "KSA",
    brand: "PlayStation Store",
    currency: "USD",
    regionalCurrency: "SAR"
  },
  {
    id: 47,
    name: "PlayStation Store KSA $40 Gift Card",
    price: 40,
    regionalPrice: 152,
    image: psKSA40,
    region: "KSA",
    brand: "PlayStation Store",
    currency: "USD",
    regionalCurrency: "SAR"
  },
  {
    id: 48,
    name: "PlayStation Store KSA $50 Gift Card",
    price: 50,
    regionalPrice: 190,
    image: psKSA50,
    region: "KSA",
    brand: "PlayStation Store",
    currency: "USD",
    regionalCurrency: "SAR"
  },
  {
    id: 49,
    name: "PlayStation Store KSA $60 Gift Card",
    price: 60,
    regionalPrice: 228,
    image: psKSA60,
    region: "KSA",
    brand: "PlayStation Store",
    currency: "USD",
    regionalCurrency: "SAR"
  },
  {
    id: 50,
    name: "PlayStation Store KSA $70 Gift Card",
    price: 70,
    regionalPrice: 266,
    image: psKSA70,
    region: "KSA",
    brand: "PlayStation Store",
    currency: "USD",
    regionalCurrency: "SAR"
  },

  // PlayStation Store OMAN Cards
  {
    id: 51,
    name: "PlayStation Store OMAN $10 Gift Card",
    price: 10,
    regionalPrice: 3.85,
    image: psOMAN10,
    region: "OMAN",
    brand: "PlayStation Store",
    currency: "USD",
    regionalCurrency: "OMR"
  },
  {
    id: 52,
    name: "PlayStation Store OMAN $20 Gift Card",
    price: 20,
    regionalPrice: 7.70,
    image: psOMAN20,
    region: "OMAN",
    brand: "PlayStation Store",
    currency: "USD",
    regionalCurrency: "OMR"
  },
  {
    id: 53,
    name: "PlayStation Store OMAN $40 Gift Card",
    price: 40,
    regionalPrice: 15.40,
    image: psOMAN40,
    region: "OMAN",
    brand: "PlayStation Store",
    currency: "USD",
    regionalCurrency: "OMR"
  },
  {
    id: 54,
    name: "PlayStation Store OMAN $45 Gift Card",
    price: 45,
    regionalPrice: 17.33,
    image: psOMAN45,
    region: "OMAN",
    brand: "PlayStation Store",
    currency: "USD",
    regionalCurrency: "OMR"
  },
  {
    id: 55,
    name: "PlayStation Store OMAN $50 Gift Card",
    price: 50,
    regionalPrice: 19.25,
    image: psOMAN50,
    region: "OMAN",
    brand: "PlayStation Store",
    currency: "USD",
    regionalCurrency: "OMR"
  },
  {
    id: 56,
    name: "PlayStation Store OMAN $60 Gift Card",
    price: 60,
    regionalPrice: 23.10,
    image: psOMAN60,
    region: "OMAN",
    brand: "PlayStation Store",
    currency: "USD",
    regionalCurrency: "OMR"
  },
  {
    id: 57,
    name: "PlayStation Store OMAN $70 Gift Card",
    price: 70,
    regionalPrice: 26.95,
    image: psOMAN70,
    region: "OMAN",
    brand: "PlayStation Store",
    currency: "USD",
    regionalCurrency: "OMR"
  },
  {
    id: 58,
    name: "PlayStation Store OMAN $100 Gift Card",
    price: 100,
    regionalPrice: 38.50,
    image: psOMAN100,
    region: "OMAN",
    brand: "PlayStation Store",
    currency: "USD",
    regionalCurrency: "OMR"
  },

  // PlayStation Store LEB Cards
  {
    id: 59,
    name: "PlayStation Store LEB $10 Gift Card",
    price: 10,
    regionalPrice: 151500,
    image: psLEB10,
    region: "LEB",
    brand: "PlayStation Store",
    currency: "USD",
    regionalCurrency: "LBP"
  },
  {
    id: 60,
    name: "PlayStation Store LEB $20 Gift Card",
    price: 20,
    regionalPrice: 303000,
    image: psLEB20,
    region: "LEB",
    brand: "PlayStation Store",
    currency: "USD",
    regionalCurrency: "LBP"
  },
  {
    id: 61,
    name: "PlayStation Store LEB $40 Gift Card",
    price: 40,
    regionalPrice: 606000,
    image: psLEB40,
    region: "LEB",
    brand: "PlayStation Store",
    currency: "USD",
    regionalCurrency: "LBP"
  },
  {
    id: 62,
    name: "PlayStation Store LEB $50 Gift Card",
    price: 50,
    regionalPrice: 757500,
    image: psLEB50,
    region: "LEB",
    brand: "PlayStation Store",
    currency: "USD",
    regionalCurrency: "LBP"
  },
  {
    id: 63,
    name: "PlayStation Store LEB $100 Gift Card",
    price: 100,
    regionalPrice: 1515000,
    image: psLEB100,
    region: "LEB",
    brand: "PlayStation Store",
    currency: "USD",
    regionalCurrency: "LBP"
  },

  // Anghami Gift Cards (Regular)
  {
    id: 64,
    name: "Anghami $5 Gift Card",
    price: 5,
    regionalPrice: 5,
    image: anghami5,
    region: "Global",
    brand: "Anghami",
    currency: "USD",
    regionalCurrency: "USD"
  },
  {
    id: 65,
    name: "Anghami $8 Gift Card",
    price: 8,
    regionalPrice: 8,
    image: anghami8,
    region: "Global",
    brand: "Anghami",
    currency: "USD",
    regionalCurrency: "USD"
  },
  {
    id: 66,
    name: "Anghami $15 Gift Card",
    price: 15,
    regionalPrice: 15,
    image: anghami15,
    region: "Global",
    brand: "Anghami",
    currency: "USD",
    regionalCurrency: "USD"
  },
  {
    id: 67,
    name: "Anghami $25 Gift Card",
    price: 25,
    regionalPrice: 25,
    image: anghami25,
    region: "Global",
    brand: "Anghami",
    currency: "USD",
    regionalCurrency: "USD"
  },
  {
    id: 68,
    name: "Anghami $50 Gift Card",
    price: 50,
    regionalPrice: 50,
    image: anghami50,
    region: "Global",
    brand: "Anghami",
    currency: "USD",
    regionalCurrency: "USD"
  },
  {
    id: 69,
    name: "Anghami $88 Gift Card",
    price: 88,
    regionalPrice: 88,
    image: anghami88,
    region: "Global",
    brand: "Anghami",
    currency: "USD",
    regionalCurrency: "USD"
  },
  // Anghami Family Gift Cards
  {
    id: 70,
    name: "Anghami $7.5 Family Gift Card",
    price: 7.5,
    regionalPrice: 7.5,
    image: anghami7_5Family,
    region: "Family",
    brand: "Anghami",
    currency: "USD",
    regionalCurrency: "USD"
  },
  {
    id: 71,
    name: "Anghami $75 Family Gift Card",
    price: 75,
    regionalPrice: 75,
    image: anghami75Family,
    region: "Family",
    brand: "Anghami",
    currency: "USD",
    regionalCurrency: "USD"
  },

  // Fortnite Gift Cards
  {
    id: 72,
    name: "Fortnite $10 Gift Card",
    price: 10,
    regionalPrice: 10,
    image: fortnite10,
    region: "Global",
    brand: "Fortnite",
    currency: "USD",
    regionalCurrency: "USD"
  },
  {
    id: 73,
    name: "Fortnite $25 Gift Card",
    price: 25,
    regionalPrice: 25,
    image: fortnite25,
    region: "Global",
    brand: "Fortnite",
    currency: "USD",
    regionalCurrency: "USD"
  },
  {
    id: 74,
    name: "Fortnite $100 Gift Card",
    price: 100,
    regionalPrice: 100,
    image: fortnite100,
    region: "Global",
    brand: "Fortnite",
    currency: "USD",
    regionalCurrency: "USD"
  },

  // Free Fire Gift Cards
  {
    id: 75,
    name: "Free Fire $1 Gift Card",
    price: 1,
    regionalPrice: 1,
    image: freefire1,
    region: "Global",
    brand: "Free Fire",
    currency: "USD",
    regionalCurrency: "USD"
  },
  {
    id: 76,
    name: "Free Fire $2 Gift Card",
    price: 2,
    regionalPrice: 2,
    image: freefire2,
    region: "Global",
    brand: "Free Fire",
    currency: "USD",
    regionalCurrency: "USD"
  },
  {
    id: 77,
    name: "Free Fire $5 Gift Card",
    price: 5,
    regionalPrice: 5,
    image: freefire5,
    region: "Global",
    brand: "Free Fire",
    currency: "USD",
    regionalCurrency: "USD"
  },
  {
    id: 78,
    name: "Free Fire $10 Gift Card",
    price: 10,
    regionalPrice: 10,
    image: freefire10,
    region: "Global",
    brand: "Free Fire",
    currency: "USD",
    regionalCurrency: "USD"
  },
  {
    id: 79,
    name: "Free Fire $20 Gift Card",
    price: 20,
    regionalPrice: 20,
    image: freefire20,
    region: "Global",
    brand: "Free Fire",
    currency: "USD",
    regionalCurrency: "USD"
  },

  // PUBG Gift Cards
  {
    id: 80,
    name: "PUBG $1 Gift Card",
    price: 1,
    regionalPrice: 1,
    image: pubg1,
    region: "Global",
    brand: "PUBG",
    currency: "USD",
    regionalCurrency: "USD"
  },
  {
    id: 81,
    name: "PUBG $5 Gift Card",
    price: 5,
    regionalPrice: 5,
    image: pubg5,
    region: "Global",
    brand: "PUBG",
    currency: "USD",
    regionalCurrency: "USD"
  },
  {
    id: 82,
    name: "PUBG $10 Gift Card",
    price: 10,
    regionalPrice: 10,
    image: pubg10,
    region: "Global",
    brand: "PUBG",
    currency: "USD",
    regionalCurrency: "USD"
  },
  {
    id: 83,
    name: "PUBG $25 Gift Card",
    price: 25,
    regionalPrice: 25,
    image: pubg25,
    region: "Global",
    brand: "PUBG",
    currency: "USD",
    regionalCurrency: "USD"
  },
  {
    id: 84,
    name: "PUBG $50 Gift Card",
    price: 50,
    regionalPrice: 50,
    image: pubg50,
    region: "Global",
    brand: "PUBG",
    currency: "USD",
    regionalCurrency: "USD"
  },
  {
    id: 85,
    name: "PUBG $100 Gift Card",
    price: 100,
    regionalPrice: 100,
    image: pubg100,
    region: "Global",
    brand: "PUBG",
    currency: "USD",
    regionalCurrency: "USD"
  },
  {
    id: 86,
    name: "PUBG $200 Gift Card",
    price: 200,
    regionalPrice: 200,
    image: pubg200,
    region: "Global",
    brand: "PUBG",
    currency: "USD",
    regionalCurrency: "USD"
  },
  {
    id: 87,
    name: "PUBG $300 Gift Card",
    price: 300,
    regionalPrice: 300,
    image: pubg300,
    region: "Global",
    brand: "PUBG",
    currency: "USD",
    regionalCurrency: "USD"
  },
  {
    id: 88,
    name: "PUBG $400 Gift Card",
    price: 400,
    regionalPrice: 400,
    image: pubg400,
    region: "Global",
    brand: "PUBG",
    currency: "USD",
    regionalCurrency: "USD"
  },

  // Roblox Gift Cards
  {
    id: 89,
    name: "Roblox $10 Gift Card",
    price: 10,
    regionalPrice: 10,
    image: roblox10,
    region: "Global",
    brand: "Roblox",
    currency: "USD",
    regionalCurrency: "USD"
  },
  {
    id: 90,
    name: "Roblox $20 Gift Card",
    price: 20,
    regionalPrice: 20,
    image: roblox20,
    region: "Global",
    brand: "Roblox",
    currency: "USD",
    regionalCurrency: "USD"
  },
  {
    id: 91,
    name: "Roblox $25 Gift Card",
    price: 25,
    regionalPrice: 25,
    image: roblox25,
    region: "Global",
    brand: "Roblox",
    currency: "USD",
    regionalCurrency: "USD"
  },
  {
    id: 92,
    name: "Roblox $50 Gift Card",
    price: 50,
    regionalPrice: 50,
    image: roblox50,
    region: "Global",
    brand: "Roblox",
    currency: "USD",
    regionalCurrency: "USD"
  },
];

const REGIONS = ["USA", "UAE", "KSA", "OMAN", "LEB", "Global", "Family"];
const BRANDS = ["iTunes", "PlayStation Store", "Anghami", "Fortnite", "Free Fire", "PUBG", "Roblox"];
const PRICE_RANGES = [
  { label: "$0-$10", min: 0, max: 10 },
  { label: "$10-$25", min: 10, max: 25 },
  { label: "$25-$50", min: 25, max: 50 },
  { label: "$50-$100", min: 50, max: 100 },
  { label: "$100-$200", min: 100, max: 200 },
  { label: "$200+", min: 200, max: Infinity },
];

const SORT_OPTIONS = [
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "name", label: "Name A-Z" },
  { value: "name-desc", label: "Name Z-A" },
  { value: "region", label: "Region" },
];

// Custom hooks
const useFilters = () => {
  const [filters, setFilters] = useState<FilterState>({
    regions: ["USA", "Global", "Family"],
    brands: BRANDS,
    priceRange: [0, 500],
    selectedPriceRanges: [],
    sortBy: "price-low"
  });

  const updateFilters = (updates: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  const clearAllFilters = () => {
    setFilters({
      regions: ["USA", "Global", "Family"],
      brands: BRANDS,
      priceRange: [0, 500],
      selectedPriceRanges: [],
      sortBy: "price-low"
    });
  };

  return { filters, updateFilters, clearAllFilters };
};

const useFilteredCards = (cards: GiftCard[], filters: FilterState) => {
  return useMemo(() => {
    let filtered = [...cards];

    // Filter by regions
    filtered = filtered.filter(card => 
      filters.regions.includes(card.region)
    );

    // Filter by brands
    filtered = filtered.filter(card => 
      filters.brands.includes(card.brand)
    );

    // Filter by price range slider
    filtered = filtered.filter(card => 
      card.price >= filters.priceRange[0] && card.price <= filters.priceRange[1]
    );

    // Filter by selected price ranges
    if (filters.selectedPriceRanges.length > 0) {
      filtered = filtered.filter(card => {
        return filters.selectedPriceRanges.some(rangeLabel => {
          const range = PRICE_RANGES.find(r => r.label === rangeLabel);
          if (!range) return false;
          return card.price >= range.min && 
                 (range.max === Infinity ? true : card.price <= range.max);
        });
      });
    }

    // Sort cards
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "name":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "region":
          return a.region.localeCompare(b.region);
        default:
          return 0;
      }
    });

    return filtered;
  }, [cards, filters]);
};

// Components
interface FilterSidebarProps {
  filters: FilterState;
  onUpdateFilters: (updates: Partial<FilterState>) => void;
  onClearFilters: () => void;
}

const FilterSidebar = ({ filters, onUpdateFilters, onClearFilters }: FilterSidebarProps) => {
  const handleRegionChange = (region: string, checked: boolean) => {
    const newRegions = checked
      ? [...filters.regions, region]
      : filters.regions.filter(r => r !== region);
    onUpdateFilters({ regions: newRegions });
  };

  const handleBrandChange = (brand: string, checked: boolean) => {
    const newBrands = checked
      ? [...filters.brands, brand]
      : filters.brands.filter(b => b !== brand);
    onUpdateFilters({ brands: newBrands });
  };

  const handlePriceRangeChange = (rangeLabel: string, checked: boolean) => {
    const newRanges = checked
      ? [...filters.selectedPriceRanges, rangeLabel]
      : filters.selectedPriceRanges.filter(r => r !== rangeLabel);
    onUpdateFilters({ selectedPriceRanges: newRanges });
  };

  return (
    <motion.aside
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="lg:col-span-1"
    >
      <div className="sticky top-24 space-y-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-elegant text-lg">Filters</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-elegant text-xs"
            onClick={onClearFilters}
          >
            Clear All
          </Button>
        </div>

        {/* Region */}
        <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg p-4 border border-primary/20">
          <h3 className="text-elegant text-sm mb-4 font-medium">🌍 Region</h3>
          <div className="space-y-3">
            {REGIONS.map((region) => (
              <div key={region} className={`flex items-center space-x-2 p-2 rounded transition-all duration-200 ${
                filters.regions.includes(region) 
                  ? "bg-primary/10 border border-primary/30" 
                  : "hover:bg-white/50"
              }`}>
                <Checkbox 
                  id={`region-${region}`}
                  checked={filters.regions.includes(region)}
                  onCheckedChange={(checked) => 
                    handleRegionChange(region, checked as boolean)
                  }
                />
                 <Label
                   htmlFor={`region-${region}`}
                   className={`text-sm cursor-pointer transition-colors duration-200 ${
                     filters.regions.includes(region) 
                       ? "font-medium text-primary" 
                       : "font-light"
                   }`}
                 >
                   {region === "Family" ? `${region} (Anghami only)` : region}
                 </Label>
              </div>
            ))}
          </div>
          {filters.regions.length > 0 && (
            <div className="mt-3 p-2 bg-primary/10 rounded border border-primary/20">
              <p className="text-xs text-primary font-medium">
                Selected: {filters.regions.join(", ")}
              </p>
            </div>
          )}
        </div>

        {/* Brand */}
        <div>
          <h3 className="text-elegant text-sm mb-4">Brand</h3>
          <div className="space-y-3">
            {BRANDS.map((brand) => (
              <div key={brand} className="flex items-center space-x-2">
                <Checkbox 
                  id={`brand-${brand}`}
                  checked={filters.brands.includes(brand)}
                  onCheckedChange={(checked) => 
                    handleBrandChange(brand, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`brand-${brand}`}
                  className="text-sm font-light cursor-pointer"
                >
                  {brand}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Price Range Slider */}
        <div>
          <h3 className="text-elegant text-sm mb-4">Price Range</h3>
          <Slider
            value={filters.priceRange}
            onValueChange={(value) => onUpdateFilters({ priceRange: value })}
            max={500}
            min={0}
            step={1}
            className="mb-4"
          />
          <div className="flex items-center justify-between text-sm">
            <span>${filters.priceRange[0].toFixed(2)}</span>
            <span>${filters.priceRange[1].toFixed(2)}</span>
          </div>
        </div>

        {/* Quick Price Filters */}
        <div>
          <h3 className="text-elegant text-sm mb-4">Quick Filters</h3>
          <div className="space-y-3">
            {PRICE_RANGES.map((range) => (
              <div key={range.label} className="flex items-center space-x-2">
                <Checkbox 
                  id={range.label}
                  checked={filters.selectedPriceRanges.includes(range.label)}
                  onCheckedChange={(checked) => 
                    handlePriceRangeChange(range.label, checked as boolean)
                  }
                />
                <Label
                  htmlFor={range.label}
                  className="text-sm font-light cursor-pointer"
                >
                  {range.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.aside>
  );
};

interface ControlsProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  totalCount: number;
}

const Controls = ({ viewMode, onViewModeChange, sortBy, onSortChange, totalCount }: ControlsProps) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <p className="text-sm text-muted-foreground">
        Showing {totalCount} gift cards
      </p>
      <div className="flex items-center gap-4">
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[180px] text-elegant text-xs">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => onViewModeChange("grid")}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => onViewModeChange("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

interface GiftCardProps extends GiftCard {
  viewMode: ViewMode;
}

const GiftCardComponent = ({ id, name, price, regionalPrice, image, region, brand, currency, regionalCurrency, viewMode }: GiftCardProps) => {
  const navigate = useNavigate();

  const handleBuyNow = () => {
    // Navigate to checkout with all gift card details
    const params = new URLSearchParams({
      id: id.toString(),
      name: name,
      price: price.toString(),
      regionalPrice: regionalPrice.toString(),
      image: image,
      region: region,
      brand: brand,
      currency: currency,
      regionalCurrency: regionalCurrency,
      category: "Gift Cards"
    });
    navigate(`/checkout?${params.toString()}`);
  };

  return (
    <motion.div
      whileHover={{ y: -12 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="group relative bg-white rounded-sm overflow-hidden border border-border hover:border-primary/40 transition-all duration-500 shadow-card hover:shadow-elegant"
    >
      <div className={`overflow-hidden bg-white relative border-b border-border ${
        viewMode === "grid" ? "aspect-[4/3]" : "aspect-[16/9]"
      }`}>
        <motion.img
          src={image}
          alt={name}
          className="h-full w-full object-contain p-4 transition-transform duration-700 group-hover:scale-110"
        />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <motion.span 
            initial={{ opacity: 0.7 }}
            whileHover={{ opacity: 1 }}
            className="text-elegant text-[10px] text-primary"
          >
            {brand} • {region}
          </motion.span>
          <span className="text-[10px] text-muted-foreground">{currency}</span>
        </div>
        <h3 className="text-elegant text-xs mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300">
          {name}
        </h3>
        <div className="space-y-1">
          <p className="text-elegant text-sm font-normal bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {currency}${price.toFixed(2)}
          </p>
          {region !== "USA" && region !== "Global" && region !== "Family" && (
            <p className="text-xs text-muted-foreground">
              {regionalCurrency} {regionalPrice}
            </p>
          )}
        </div>
        
        <Button 
          size="sm" 
          className="w-full mt-3 text-elegant"
          variant="outline"
          onClick={handleBuyNow}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Buy Now
        </Button>
      </div>
    </motion.div>
  );
};

// Main Component
const GiftCards = () => {
  const { filters, updateFilters, clearAllFilters } = useFilters();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const filteredCards = useFilteredCards(GIFT_CARDS, filters);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  return (
    <div className="min-h-screen bg-white no-horizontal-scroll overflow-x-hidden">
      <Header />

      <div className="container mx-auto px-6 py-12">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-elegant text-4xl mb-4"
        >
          Gift Cards
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground mb-8"
        >
          Premium digital gift cards for all your favorite platforms
        </motion.p>

        {/* Prominent Region Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg p-6 mb-8 border border-primary/20"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-elegant text-lg font-medium mb-2">🌍 Select Your Region</h2>
              <p className="text-sm text-muted-foreground">
                Choose your region to see available gift cards. This is required to ensure compatibility.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {REGIONS.map((region) => (
                 <Button
                   key={region}
                   variant={filters.regions.includes(region) ? "default" : "outline"}
                   size="sm"
                   onClick={() => {
                     const newRegions = filters.regions.includes(region)
                       ? filters.regions.filter(r => r !== region)
                       : [...filters.regions, region];
                     updateFilters({ regions: newRegions });
                   }}
                   className={`transition-all duration-200 ${
                     filters.regions.includes(region)
                       ? "bg-primary text-white shadow-lg scale-105"
                       : "hover:bg-primary/10"
                   }`}
                 >
                   {region === "Family" ? `${region} (Anghami only)` : region}
                 </Button>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          <FilterSidebar 
            filters={filters}
            onUpdateFilters={updateFilters}
            onClearFilters={clearAllFilters}
          />

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-3"
          >
            <Controls
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              sortBy={filters.sortBy}
              onSortChange={(sort) => updateFilters({ sortBy: sort })}
              totalCount={filteredCards.length}
            />

            {/* Gift Cards */}
            <div className={`grid gap-6 ${
              viewMode === "grid" 
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" 
                : "grid-cols-1"
            }`}>
              {filteredCards.map((card, index) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GiftCardComponent {...card} viewMode={viewMode} />
                </motion.div>
              ))}
            </div>

            {/* No Results */}
            {filteredCards.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Gift className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">
                  No gift cards found matching your filters.
                </p>
                <Button 
                  variant="outline" 
                  onClick={clearAllFilters}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              </motion.div>
            )}

            {/* Promotional Banner */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-12 bg-gradient-to-r from-primary to-accent text-white rounded-sm p-8 text-center"
            >
              <p className="text-elegant text-xl mb-2">🎁 Instant Delivery</p>
              <p className="text-sm font-light mb-4">Get your gift card codes instantly via email</p>
              <Button variant="outline" className="bg-white text-primary hover:bg-white/90 border-white">
                Learn More
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default GiftCards;
