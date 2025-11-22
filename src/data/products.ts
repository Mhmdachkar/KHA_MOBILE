// Product images imports
import hocoQ37 from "@/assets/phone_accessories/Hoco Q37 IntelligentBalance 10000mAh Power Bank.png";
import dobePS4 from "@/assets/phone_accessories/Dobe Dual Charging Dock for PS4 Controllers (P-4).png";
import dobePS5 from "@/assets/phone_accessories/Dobe Charging Dock for PS5 Controllers (P-5).png";
import hocoJ132A from "@/assets/phone_accessories/Hoco J132A IntelligentBalance 20000mAh Power Bank.png";
import kakusigaStand from "@/assets/phone_accessories/Kakusiga Folding Rotatable Desktop Stand.png";
import usbCAdapter from "@/assets/phone_accessories/25W USB-C Power Adapter with USB-C to Lightning Cable.png";
// Audio product imports
import airpods3rd from "@/assets/audio/Apple AirPods (3rd Generation).png";
import galaxyBuds6White from "@/assets/audio/Galaxy Buds6 Pro (White).png";
import galaxyBuds6Black from "@/assets/audio/Galaxy Buds6 Pro (Black).png";
import jblTune903BT from "@/assets/audio/wireless headphone JBL Tune903BT V5.3.png";
import airpodsPro2 from "@/assets/audio/airpods pro generation 2.png";
import waterproofSpeakerBlack from "@/assets/audio/3INCH SPAKER WATER PROOF black.png";
import waterproofSpeakerBlue from "@/assets/audio/3INCH SPAKER WATER PROOF blue.png";
import waterproofSpeakerGrey from "@/assets/audio/3INCH SPAKER WATER PROOF grey.png";
import waterproofSpeakerRed from "@/assets/audio/3INCH SPAKER WATER PROOF red.png";
import yesidoHeadset from "@/assets/audio/YESIDO WIRED GAMING HEADSET EK05.webp";
import yesidoHeadset1 from "@/assets/audio/YESIDO WIRED GAMING HEADSET EK05 1.webp";
import yesidoHeadset2 from "@/assets/audio/YESIDO WIRED GAMING HEADSET EK05 2.webp";
import hoco22_5W from "@/assets/phone_accessories/powerbank hoco 22.5W-10000MAH.png";
import apple25WAdapter from "@/assets/phone_accessories/apple adapter USB-C 25W.gif";
import foneng25WAdapter from "@/assets/phone_accessories/adapter foneng 25W.png";
import fonengAuxCable from "@/assets/audio/aux cable foneng.jpg";
// Accessories imports
import rgbMj33Ring from "@/assets/accessories/RGB MJ33 RING 13INCH.avif";
import rgbMj33RingGif from "@/assets/accessories/RGB MJ33 RING 13INCH.gif";
import rl19LedSoft from "@/assets/accessories/RL-19 LED SOFT.jpg";
import rl19LedSoft1 from "@/assets/accessories/RL-19 LED SOFT1.jpg";
import fonengUsbCable from "@/assets/phone_accessories/USB to Type-C foneng.webp";
import borofoneUsbCable from "@/assets/phone_accessories/usb to type-C BOROFONE.jpg";
import fonengDesktopHolder from "@/assets/phone_accessories/foldable desktop holder foneng.webp";
import samsung25WAdapter from "@/assets/phone_accessories/Samsung 25W PD Adapter.png";
// Wearables imports
import s8UltraMax from "@/assets/wearables/s8 ultra max smart watch.png";
import smartWatchActivePro from "@/assets/wearables/smart watch active pro (green lion).webp";
import u9Ultra2 from "@/assets/wearables/u9 ultra 2.png";
import watchXSeries10 from "@/assets/wearables/watch x series 10.png";

export interface Product {
  id: number;
  name: string;
  title: string;
  price: number;
  image: string;
  rating: number;
  category: string;
  brand?: string;
  description: string;
  features: string[];
  specifications?: Array<{ label: string; value: string }>;
}

export const phoneAccessories: Product[] = [
  {
    id: 101,
    name: "Hoco Q37 IntelligentBalance 10000mAh Power Bank",
    title: "Hoco Q37 Fast Charging Power Bank (10000mAh)",
    price: 39.99,
    image: hocoQ37,
    rating: 4.8,
    category: "Charging",
    brand: "Hoco",
    description: "Stay powered up wherever you go with the Hoco Q37 IntelligentBalance Power Bank. This compact and powerful 10000mAh charger is your perfect travel companion, featuring built-in cables so you never have to worry about forgetting yours. With multiple fast-charging outputs, it can power up your devices quickly and efficiently.",
    features: [
      "10000mAh Capacity: Provides multiple charges for most smartphones.",
      "Fast Charging Support: Equipped with 22.5W, PD 20W, and QC3.0 for rapid charging.",
      "Built-in Cables: Includes attached Lightning and USB-C cables for ultimate convenience.",
      "Versatile Ports: Features 4 outputs and 2 inputs, allowing you to charge multiple devices at once and recharge the power bank easily.",
      "Clear Digital Display: An intelligent display shows the remaining battery percentage.",
      "18-Month Warranty: Comes with an 18-month warranty for peace of mind (as per packaging)."
    ],
    specifications: [
      { label: "Capacity", value: "10000mAh" },
      { label: "Fast Charging", value: "22.5W, PD 20W, QC3.0" },
      { label: "Outputs", value: "4 outputs" },
      { label: "Inputs", value: "2 inputs" },
      { label: "Built-in Cables", value: "Lightning, USB-C" },
      { label: "Display", value: "Digital Battery Percentage" },
      { label: "Warranty", value: "18 months" }
    ]
  },
  {
    id: 102,
    name: "Dobe Dual Charging Dock for PS4 Controllers",
    title: "Dobe Dual Charging Dock for PlayStation 4 Controllers",
    price: 24.99,
    image: dobePS4,
    rating: 4.7,
    category: "Gaming",
    brand: "Dobe",
    description: "Keep your gaming sessions uninterrupted with the Dobe Dual Charging Dock for PS4. This station is designed to charge two DUALSHOCK 4 controllers simultaneously. Its sleek, compact design fits perfectly with your gaming setup and ensures your controllers are always charged and ready for action.",
    features: [
      "Dual Controller Charging: Charges two PS4 controllers at the same time.",
      "Wide Compatibility: Fully compatible with all PS4, PS4 Slim, and PS4 Pro controllers.",
      "Stable Design: The dock provides a stable and secure base for your controllers while they charge.",
      "Easy to Use: Simply drop your controllers into the charging slots to power up.",
      "LED Indicators: Features clear indicators to show the charging status (e.g., red for charging, blue/green for fully charged)."
    ],
    specifications: [
      { label: "Compatibility", value: "PS4, PS4 Slim, PS4 Pro" },
      { label: "Charging Capacity", value: "2 controllers simultaneously" },
      { label: "Indicators", value: "LED charging status" },
      { label: "Design", value: "Sleek and compact" }
    ]
  },
  {
    id: 103,
    name: "Dobe Charging Dock for PS5 Controllers",
    title: "Dobe Charging Dock for PlayStation 5 DualSense Controllers",
    price: 29.99,
    image: dobePS5,
    rating: 4.8,
    category: "Gaming",
    brand: "Dobe",
    description: "Power up your next-gen gaming with the Dobe Charging Dock for PS5. Designed to perfectly match the aesthetic of the PlayStation 5, this dock securely holds and charges two DualSense wireless controllers. It's the essential accessory for any PS5 owner to keep the game going.",
    features: [
      "DualSense Charging: Charges two PS5 DualSense controllers simultaneously.",
      "Aesthetic Match: Features a futuristic white and black design that complements the PS5 console.",
      "Click-in Design: Easily dock your controllers for a secure connection and fast charging.",
      "Stable & Secure: Provides a safe and stylish home for your controllers when you're not playing.",
      "Overcharge Protection: Built-in protection helps prevent damage from overcharging."
    ],
    specifications: [
      { label: "Compatibility", value: "PlayStation 5 DualSense Controllers" },
      { label: "Charging Capacity", value: "2 controllers simultaneously" },
      { label: "Design", value: "PS5 aesthetic match" },
      { label: "Protection", value: "Overcharge protection" }
    ]
  },
  {
    id: 104,
    name: "Hoco J132A IntelligentBalance 20000mAh Power Bank",
    title: "Hoco J132A High-Capacity Power Bank (20000mAh)",
    price: 59.99,
    image: hocoJ132A,
    rating: 4.9,
    category: "Charging",
    brand: "Hoco",
    description: "The Hoco J132A is a high-capacity powerhouse, packing 20000mAh to keep all your devices running for days. With multiple built-in cables and support for 22.5W and PD 20W fast charging, this power bank is the ultimate solution for heavy users, travelers, and families. The clear LED display lets you know exactly how much power is left.",
    features: [
      "Massive 20000mAh Capacity: Ideal for long trips, charging tablets, or powering multiple devices.",
      "4-in-1 Built-in Cables: Comes with built-in USB-C, Lightning, and Micro-USB cables, plus a USB-A input cable.",
      "High-Speed Charging: Supports 22.5W Super Fast Charging and PD 20W to power up compatible devices in record time.",
      "LED Digital Display: A large, clear LED screen shows the precise remaining battery percentage.",
      "Multiple Outputs: Charge up to four devices at once with its multiple fast-charging ports."
    ],
    specifications: [
      { label: "Capacity", value: "20000mAh" },
      { label: "Fast Charging", value: "22.5W Super Fast, PD 20W" },
      { label: "Built-in Cables", value: "USB-C, Lightning, Micro-USB, USB-A" },
      { label: "Outputs", value: "Multiple (up to 4 devices)" },
      { label: "Display", value: "LED Digital Display" }
    ]
  },
  {
    id: 105,
    name: "Kakusiga Folding Rotatable Desktop Stand",
    title: "Kakusiga 360° Rotatable Folding Desktop Stand",
    price: 19.99,
    image: kakusigaStand,
    rating: 4.6,
    category: "Accessories",
    brand: "Kakusiga",
    description: "Find your perfect viewing angle with the Kakusiga Folding Rotatable Desktop Stand. This versatile stand is perfect for watching videos, video calls, or simply keeping your phone accessible on your desk. Its 360° rotating base and adjustable height make it incredibly ergonomic, while the foldable design allows you to take it anywhere.",
    features: [
      "360° Rotating Base: Easily spin the stand to share your screen or adjust your viewing angle.",
      "Fully Foldable: Collapses into a compact size, making it perfect for travel or storage.",
      "Adjustable Height & Angle: The telescopic neck and tilting head allow you to find the most comfortable position.",
      "Stable & Secure: A weighted base ensures stability, while non-slip silicone pads protect your device from scratches.",
      "Universal Compatibility: Designed to hold most smartphones and small tablets (supports devices from 4.7 to 7 inches)."
    ],
    specifications: [
      { label: "Rotation", value: "360° rotating base" },
      { label: "Design", value: "Fully foldable" },
      { label: "Adjustability", value: "Height and angle adjustable" },
      { label: "Compatibility", value: "4.7\" to 7\" devices" },
      { label: "Base", value: "Weighted, non-slip silicone pads" }
    ]
  },
  {
    id: 106,
    name: "Apple AirPods (3rd Generation)",
    title: "Apple AirPods (3rd Generation) with MagSafe Charging Case",
    price: 179.99,
    image: airpods3rd,
    rating: 4.9,
    category: "Audio",
    brand: "Apple",
    description: "Experience the magic of Apple's 3rd Generation AirPods. Featuring Spatial Audio with dynamic head tracking, these earbuds place sound all around you for an immersive, three-dimensional listening experience. The all-new contoured design provides a comfortable fit, while the force sensor gives you easy control over your music and calls.",
    features: [
      "Spatial Audio: With dynamic head tracking for a theater-like sound experience.",
      "Adaptive EQ: Automatically tunes music to the shape of your ear.",
      "Contoured Design: A new, comfortable fit with a shorter stem.",
      "Force Sensor: Lets you easily control music, answer or end calls, and more.",
      "Sweat & Water Resistant: Rated IPX4, making them resistant to sweat and water.",
      "MagSafe Charging Case: Provides over 30 hours of total listening time and is compatible with MagSafe and wireless chargers.",
      "Warranty: Includes a 12-Month Redington warranty sticker."
    ],
    specifications: [
      { label: "Audio", value: "Spatial Audio with dynamic head tracking" },
      { label: "EQ", value: "Adaptive EQ" },
      { label: "Design", value: "Contoured, shorter stem" },
      { label: "Controls", value: "Force sensor" },
      { label: "Resistance", value: "IPX4 (sweat & water resistant)" },
      { label: "Battery", value: "Over 30 hours total (with case)" },
      { label: "Charging", value: "MagSafe and wireless charging" },
      { label: "Warranty", value: "12-Month Redington warranty" }
    ]
  },
  {
    id: 107,
    name: "Galaxy Buds6 Pro (White)",
    title: "Galaxy Buds6 Pro Wireless Earbuds (White)",
    price: 149.99,
    image: galaxyBuds6White,
    rating: 4.7,
    category: "Audio",
    brand: "Samsung",
    description: "Immerse yourself in high-quality sound with the Galaxy Buds6 Pro. These sleek, ergonomic wireless earbuds are designed for all-day comfort and a secure fit. Enjoy the convenience of true wireless audio, perfect for music, calls, and workouts.",
    features: [
      "True Wireless Design: Enjoy complete freedom from wires with Bluetooth connectivity.",
      "Ergonomic Fit: Designed to sit comfortably and securely in your ear.",
      "Compact Charging Case: The included case protects your earbuds and provides extra charges on the go.",
      "Intuitive Controls: Likely features touch controls for managing music and calls.",
      "Built-in Microphone: Take hands-free calls with clarity."
    ],
    specifications: [
      { label: "Design", value: "True wireless" },
      { label: "Connectivity", value: "Bluetooth" },
      { label: "Fit", value: "Ergonomic, secure" },
      { label: "Controls", value: "Touch controls" },
      { label: "Microphone", value: "Built-in for calls" },
      { label: "Charging Case", value: "Compact, included" }
    ]
  },
  {
    id: 108,
    name: "Galaxy Buds6 Pro (Black)",
    title: "Galaxy Buds6 Pro Wireless Earbuds (Black)",
    price: 149.99,
    image: galaxyBuds6Black,
    rating: 4.7,
    category: "Audio",
    brand: "Samsung",
    description: "Immerse yourself in high-quality sound with the Galaxy Buds6 Pro. These sleek, ergonomic wireless earbuds are designed for all-day comfort and a secure fit. Enjoy the convenience of true wireless audio, perfect for music, calls, and workouts.",
    features: [
      "True Wireless Design: Enjoy complete freedom from wires with Bluetooth connectivity.",
      "Ergonomic Fit: Designed to sit comfortably and securely in your ear.",
      "Compact Charging Case: The included case protects your earbuds and provides extra charges on the go.",
      "Intuitive Controls: Likely features touch controls for managing music and calls.",
      "Built-in Microphone: Take hands-free calls with clarity."
    ],
    specifications: [
      { label: "Design", value: "True wireless" },
      { label: "Connectivity", value: "Bluetooth" },
      { label: "Fit", value: "Ergonomic, secure" },
      { label: "Controls", value: "Touch controls" },
      { label: "Microphone", value: "Built-in for calls" },
      { label: "Charging Case", value: "Compact, included" }
    ]
  },
  {
    id: 109,
    name: "25W USB-C Power Adapter with USB-C to Lightning Cable",
    title: "25W USB-C Fast Charger Set (Adapter & Cable)",
    price: 34.99,
    image: usbCAdapter,
    rating: 4.8,
    category: "Charging",
    brand: "Apple",
    description: "Get the fast charge your device deserves with this 25W USB-C Power Adapter and Cable Set. Designed to provide 25W of power, it's ideal for fast-charging iPhones, iPads, and other compatible devices. The set includes both the wall adapter and a durable USB-C to Lightning cable.",
    features: [
      "25W Fast Charging: Provides significantly faster charging speeds than standard adapters.",
      "Complete Set: Includes both the 25W USB-C power adapter and a USB-C to Lightning cable.",
      "Wide Compatibility: Ideal for iPhone 14, 13, 12, 11, Pro/Pro Max models, as well as iPads and other PD-enabled devices.",
      "Compact & Portable: The sleek, compact design makes it easy to take with you."
    ],
    specifications: [
      { label: "Power Output", value: "25W" },
      { label: "Includes", value: "Adapter + USB-C to Lightning Cable" },
      { label: "Compatibility", value: "iPhone 14/13/12/11, Pro/Pro Max, iPad, PD devices" },
      { label: "Design", value: "Compact and portable" }
    ]
  },
  {
    id: 110,
    name: "JBL Tune 903BT V5.3 Wireless Headphone",
    title: "JBL Tune 903BT V5.3 Wireless Over-Ear Headphone",
    price: 89.99,
    image: jblTune903BT,
    rating: 4.7,
    category: "Audio",
    brand: "JBL",
    description: "Experience premium sound quality with the JBL Tune 903BT wireless headphone. Featuring Bluetooth 5.3 technology for stable connectivity and enhanced audio performance, these over-ear headphones deliver powerful bass and crystal-clear sound. Perfect for music lovers, gamers, and professionals who demand superior audio quality on the go.",
    features: [
      "Bluetooth 5.3 Technology: Enjoy stable, low-latency wireless connectivity with extended range.",
      "JBL Pure Bass Sound: Experience deep, powerful bass and rich audio clarity for an immersive listening experience.",
      "Long Battery Life: Up to 40 hours of continuous playback on a single charge.",
      "Quick Charge: Get 4 hours of playback with just 10 minutes of charging.",
      "Comfortable Design: Lightweight, foldable design with plush ear cushions for extended listening comfort.",
      "Multi-Point Connection: Connect to two devices simultaneously for seamless switching.",
      "Built-in Microphone: Take crystal-clear calls with the integrated microphone."
    ],
    specifications: [
      { label: "Bluetooth", value: "5.3 with multi-point connection" },
      { label: "Battery Life", value: "Up to 40 hours playback" },
      { label: "Quick Charge", value: "10 minutes = 4 hours playback" },
      { label: "Design", value: "Over-ear, foldable" },
      { label: "Microphone", value: "Built-in for calls" },
      { label: "Weight", value: "Lightweight design" }
    ]
  },
  {
    id: 111,
    name: "Apple AirPods Pro (2nd Generation)",
    title: "Apple AirPods Pro (2nd Generation) with MagSafe Charging Case",
    price: 249.99,
    image: airpodsPro2,
    rating: 4.9,
    category: "Audio",
    brand: "Apple",
    description: "Take your audio experience to the next level with Apple AirPods Pro (2nd Generation). Featuring the revolutionary H2 chip, these earbuds deliver exceptional active noise cancellation, immersive Spatial Audio, and personalized sound. The adaptive transparency mode lets you hear your surroundings while the customizable fit ensures comfort for all-day wear.",
    features: [
      "H2 Chip: Advanced audio processing for breakthrough sound quality and noise cancellation.",
      "Active Noise Cancellation: Up to 2x more noise cancellation than the previous generation.",
      "Adaptive Transparency: Intelligently reduces loud environmental noise while preserving natural sounds.",
      "Spatial Audio: Immersive 3D sound experience with dynamic head tracking for a theater-like experience.",
      "Personalized Spatial Audio: Customizes sound based on your head geometry for a truly personalized experience.",
      "Sweat & Water Resistant: IPX4 rating for workouts and light rain.",
      "MagSafe Charging Case: Up to 30 hours of total listening time with wireless and MagSafe charging.",
      "Touch Controls: Easy-to-use stem controls for music, calls, and Siri."
    ],
    specifications: [
      { label: "Chip", value: "H2 chip" },
      { label: "Noise Cancellation", value: "Active noise cancellation" },
      { label: "Transparency Mode", value: "Adaptive transparency" },
      { label: "Audio", value: "Spatial Audio with dynamic head tracking" },
      { label: "Resistance", value: "IPX4 (sweat & water resistant)" },
      { label: "Battery", value: "Up to 30 hours total (with case)" },
      { label: "Charging", value: "Lightning, MagSafe, and wireless charging" },
      { label: "Controls", value: "Touch controls on stem" }
    ]
  },
  {
    id: 112,
    name: "Hoco 22.5W 10000mAh Power Bank",
    title: "Hoco 22.5W Super Fast Charging Power Bank (10000mAh)",
    price: 44.99,
    image: hoco22_5W,
    rating: 4.8,
    category: "Charging",
    brand: "Hoco",
    description: "Never run out of power with the Hoco 22.5W Super Fast Charging Power Bank. This high-capacity 10000mAh portable charger delivers blazing-fast charging speeds, capable of charging your smartphone from 0% to 50% in just 30 minutes. Perfect for travelers, students, and professionals who need reliable power on the go.",
    features: [
      "22.5W Super Fast Charging: Charges compatible devices significantly faster than standard power banks.",
      "10000mAh Capacity: Provides multiple full charges for most smartphones and tablets.",
      "Dual Output Ports: Charge two devices simultaneously at optimal speeds.",
      "USB-C PD Support: Fast charging for USB-C devices with Power Delivery technology.",
      "LED Battery Indicator: Real-time display of remaining battery capacity.",
      "Compact & Lightweight: Portable design that fits easily in your bag or pocket.",
      "Safety Protection: Built-in overcharge, overcurrent, and short-circuit protection."
    ],
    specifications: [
      { label: "Capacity", value: "10000mAh" },
      { label: "Fast Charging", value: "22.5W Super Fast Charging" },
      { label: "Outputs", value: "Dual USB ports (USB-C PD + USB-A)" },
      { label: "Input", value: "USB-C" },
      { label: "Display", value: "LED battery indicator" },
      { label: "Protection", value: "Overcharge, overcurrent, short-circuit protection" },
      { label: "Design", value: "Compact and lightweight" }
    ]
  },
  {
    id: 113,
    name: "Apple USB-C 25W Power Adapter",
    title: "Apple USB-C 25W Power Adapter (Official)",
    price: 29.99,
    image: apple25WAdapter,
    rating: 4.9,
    category: "Charging",
    brand: "Apple",
    description: "Charge your iPhone, iPad, and other USB-C devices at maximum speed with the official Apple USB-C 25W Power Adapter. This compact adapter is designed by Apple to deliver fast, efficient charging while maintaining safety standards. Perfect for iPhone 14 Pro Max and other compatible devices that support fast charging.",
    features: [
      "Official Apple Product: Designed and manufactured by Apple for optimal compatibility and safety.",
      "25W Fast Charging: Delivers up to 25W of power for rapid device charging.",
      "USB-C Connection: Modern USB-C port for fast charging of compatible devices.",
      "Compact Design: Small and lightweight, perfect for travel and daily use.",
      "Wide Compatibility: Works with iPhone 14 Pro Max, iPad Pro, and other USB-C devices.",
      "Safety Certified: Meets Apple's rigorous safety and quality standards.",
      "Energy Efficient: Optimized power delivery to reduce energy waste."
    ],
    specifications: [
      { label: "Power Output", value: "25W" },
      { label: "Connection", value: "USB-C" },
      { label: "Compatibility", value: "iPhone 14 Pro Max, iPad Pro, USB-C devices" },
      { label: "Design", value: "Compact and lightweight" },
      { label: "Certification", value: "Apple official, safety certified" },
      { label: "Efficiency", value: "Energy efficient design" }
    ]
  },
  {
    id: 114,
    name: "Foneng 25W USB-C Power Adapter",
    title: "Foneng 25W Fast Charging Power Adapter",
    price: 24.99,
    image: foneng25WAdapter,
    rating: 4.6,
    category: "Charging",
    brand: "Foneng",
    description: "Fast charge your devices with the Foneng 25W USB-C Power Adapter. This reliable wall charger delivers quick charging speeds for smartphones, tablets, and other USB-C compatible devices. Compact and portable, it's perfect for home, office, or travel use.",
    features: [
      "25W Fast Charging: Rapidly charges compatible devices up to 25W power output.",
      "USB-C Port: Modern USB-C connection for fast charging and data transfer.",
      "Compact Design: Small form factor that's easy to carry and store.",
      "Wide Compatibility: Works with iPhone, Samsung, Google Pixel, and other USB-C devices.",
      "Safety Features: Built-in protection against overcharging, overheating, and short circuits.",
      "Fast Charging Support: Compatible with Power Delivery (PD) and Quick Charge technologies.",
      "LED Indicator: Shows charging status with a convenient LED light."
    ],
    specifications: [
      { label: "Power Output", value: "25W" },
      { label: "Port", value: "USB-C" },
      { label: "Fast Charging", value: "PD and Quick Charge compatible" },
      { label: "Compatibility", value: "iPhone, Samsung, Google Pixel, USB-C devices" },
      { label: "Protection", value: "Overcharge, overheat, short-circuit protection" },
      { label: "Indicator", value: "LED charging status" }
    ]
  },
  {
    id: 115,
    name: "Foneng 3.5mm AUX Audio Cable",
    title: "Foneng 3.5mm AUX Audio Cable - High Quality",
    price: 12.99,
    image: fonengAuxCable,
    rating: 4.5,
    category: "Audio",
    brand: "Foneng",
    description: "Connect your devices with crystal-clear audio using the Foneng 3.5mm AUX Audio Cable. This high-quality cable ensures pristine audio transmission between your smartphone, tablet, car stereo, or any device with a 3.5mm audio jack. Perfect for music lovers who demand the best sound quality.",
    features: [
      "High-Quality Audio: Delivers clear, distortion-free audio transmission for premium sound quality.",
      "Durable Construction: Reinforced connectors and high-quality copper wiring ensure long-lasting reliability.",
      "Universal Compatibility: Works with all devices featuring 3.5mm audio jacks.",
      "Tangle-Free Design: Flexible cable design that resists tangling for easy storage.",
      "Gold-Plated Connectors: Corrosion-resistant gold-plated connectors for optimal signal transmission.",
      "Multiple Lengths: Available in various lengths to suit your needs.",
      "Wide Compatibility: Compatible with smartphones, tablets, car stereos, speakers, and headphones."
    ],
    specifications: [
      { label: "Connector", value: "3.5mm (TRS) on both ends" },
      { label: "Material", value: "High-quality copper wiring" },
      { label: "Connectors", value: "Gold-plated for better conductivity" },
      { label: "Compatibility", value: "All 3.5mm audio devices" },
      { label: "Design", value: "Tangle-free, flexible" },
      { label: "Quality", value: "High-quality audio transmission" }
    ]
  },
  {
    id: 120,
    name: "3 Inch Waterproof Bluetooth Speaker (Black)",
    title: "3 Inch Portable Waterproof Bluetooth Speaker - Black",
    price: 34.99,
    image: waterproofSpeakerBlack,
    rating: 4.6,
    category: "Audio",
    brand: "Generic",
    description: "Take your music anywhere with this compact 3-inch waterproof Bluetooth speaker. Perfect for outdoor adventures, pool parties, or beach trips, this speaker features IPX7 waterproof rating, making it resistant to water splashes and brief submersion. With impressive sound quality and long battery life, it's the perfect companion for your mobile lifestyle.",
    features: [
      "IPX7 Waterproof Rating: Fully waterproof design that can withstand water splashes and brief submersion.",
      "Bluetooth 5.0 Connectivity: Stable wireless connection with extended range for seamless music streaming.",
      "Compact 3-Inch Design: Portable size that fits easily in your bag or pocket without sacrificing sound quality.",
      "Long Battery Life: Extended playback time to keep the music going all day long.",
      "Rich Bass Sound: Powerful drivers deliver clear, balanced audio with impressive bass response.",
      "Built-in Microphone: Hands-free calling capability for convenient phone conversations.",
      "Multiple Color Options: Available in black, blue, grey, and red to match your style."
    ],
    specifications: [
      { label: "Size", value: "3 inches" },
      { label: "Waterproof", value: "IPX7 rating" },
      { label: "Bluetooth", value: "5.0 wireless connectivity" },
      { label: "Battery", value: "Extended playback time" },
      { label: "Microphone", value: "Built-in for hands-free calls" },
      { label: "Colors", value: "Black, Blue, Grey, Red" }
    ]
  },
  {
    id: 121,
    name: "3 Inch Waterproof Bluetooth Speaker (Blue)",
    title: "3 Inch Portable Waterproof Bluetooth Speaker - Blue",
    price: 34.99,
    image: waterproofSpeakerBlue,
    rating: 4.6,
    category: "Audio",
    brand: "Generic",
    description: "Take your music anywhere with this compact 3-inch waterproof Bluetooth speaker in vibrant blue. Perfect for outdoor adventures, pool parties, or beach trips, this speaker features IPX7 waterproof rating, making it resistant to water splashes and brief submersion. With impressive sound quality and long battery life, it's the perfect companion for your mobile lifestyle.",
    features: [
      "IPX7 Waterproof Rating: Fully waterproof design that can withstand water splashes and brief submersion.",
      "Bluetooth 5.0 Connectivity: Stable wireless connection with extended range for seamless music streaming.",
      "Compact 3-Inch Design: Portable size that fits easily in your bag or pocket without sacrificing sound quality.",
      "Long Battery Life: Extended playback time to keep the music going all day long.",
      "Rich Bass Sound: Powerful drivers deliver clear, balanced audio with impressive bass response.",
      "Built-in Microphone: Hands-free calling capability for convenient phone conversations.",
      "Vibrant Blue Color: Eye-catching blue design that stands out."
    ],
    specifications: [
      { label: "Size", value: "3 inches" },
      { label: "Waterproof", value: "IPX7 rating" },
      { label: "Bluetooth", value: "5.0 wireless connectivity" },
      { label: "Battery", value: "Extended playback time" },
      { label: "Microphone", value: "Built-in for hands-free calls" },
      { label: "Color", value: "Blue" }
    ]
  },
  {
    id: 122,
    name: "3 Inch Waterproof Bluetooth Speaker (Grey)",
    title: "3 Inch Portable Waterproof Bluetooth Speaker - Grey",
    price: 34.99,
    image: waterproofSpeakerGrey,
    rating: 4.6,
    category: "Audio",
    brand: "Generic",
    description: "Take your music anywhere with this compact 3-inch waterproof Bluetooth speaker in sleek grey. Perfect for outdoor adventures, pool parties, or beach trips, this speaker features IPX7 waterproof rating, making it resistant to water splashes and brief submersion. With impressive sound quality and long battery life, it's the perfect companion for your mobile lifestyle.",
    features: [
      "IPX7 Waterproof Rating: Fully waterproof design that can withstand water splashes and brief submersion.",
      "Bluetooth 5.0 Connectivity: Stable wireless connection with extended range for seamless music streaming.",
      "Compact 3-Inch Design: Portable size that fits easily in your bag or pocket without sacrificing sound quality.",
      "Long Battery Life: Extended playback time to keep the music going all day long.",
      "Rich Bass Sound: Powerful drivers deliver clear, balanced audio with impressive bass response.",
      "Built-in Microphone: Hands-free calling capability for convenient phone conversations.",
      "Sleek Grey Color: Modern grey finish for a sophisticated look."
    ],
    specifications: [
      { label: "Size", value: "3 inches" },
      { label: "Waterproof", value: "IPX7 rating" },
      { label: "Bluetooth", value: "5.0 wireless connectivity" },
      { label: "Battery", value: "Extended playback time" },
      { label: "Microphone", value: "Built-in for hands-free calls" },
      { label: "Color", value: "Grey" }
    ]
  },
  {
    id: 123,
    name: "3 Inch Waterproof Bluetooth Speaker (Red)",
    title: "3 Inch Portable Waterproof Bluetooth Speaker - Red",
    price: 34.99,
    image: waterproofSpeakerRed,
    rating: 4.6,
    category: "Audio",
    brand: "Generic",
    description: "Take your music anywhere with this compact 3-inch waterproof Bluetooth speaker in bold red. Perfect for outdoor adventures, pool parties, or beach trips, this speaker features IPX7 waterproof rating, making it resistant to water splashes and brief submersion. With impressive sound quality and long battery life, it's the perfect companion for your mobile lifestyle.",
    features: [
      "IPX7 Waterproof Rating: Fully waterproof design that can withstand water splashes and brief submersion.",
      "Bluetooth 5.0 Connectivity: Stable wireless connection with extended range for seamless music streaming.",
      "Compact 3-Inch Design: Portable size that fits easily in your bag or pocket without sacrificing sound quality.",
      "Long Battery Life: Extended playback time to keep the music going all day long.",
      "Rich Bass Sound: Powerful drivers deliver clear, balanced audio with impressive bass response.",
      "Built-in Microphone: Hands-free calling capability for convenient phone conversations.",
      "Bold Red Color: Vibrant red design for a striking appearance."
    ],
    specifications: [
      { label: "Size", value: "3 inches" },
      { label: "Waterproof", value: "IPX7 rating" },
      { label: "Bluetooth", value: "5.0 wireless connectivity" },
      { label: "Battery", value: "Extended playback time" },
      { label: "Microphone", value: "Built-in for hands-free calls" },
      { label: "Color", value: "Red" }
    ]
  },
  {
    id: 124,
    name: "YESIDO Wired Gaming Headset EK05",
    title: "YESIDO Wired Gaming Headset EK05 - Professional Gaming Audio",
    price: 39.99,
    image: yesidoHeadset,
    rating: 4.7,
    category: "Audio",
    brand: "YESIDO",
    description: "Immerse yourself in the game with the YESIDO Wired Gaming Headset EK05. Designed for serious gamers, this headset delivers crystal-clear audio with powerful bass and crisp highs. The comfortable over-ear design with plush ear cushions ensures hours of comfortable gaming sessions. With a flexible microphone and in-line controls, it's the perfect audio companion for competitive gaming.",
    features: [
      "High-Quality Audio Drivers: Premium drivers deliver clear, immersive sound with excellent bass response for gaming.",
      "Noise-Canceling Microphone: Flexible boom microphone with noise cancellation for clear voice communication.",
      "Comfortable Over-Ear Design: Plush ear cushions and adjustable headband for extended gaming comfort.",
      "Wired Connection: Reliable wired connection ensures zero latency and consistent audio quality.",
      "In-Line Controls: Easy-to-reach controls for volume adjustment and microphone mute.",
      "Wide Compatibility: Works with PC, PlayStation, Xbox, Nintendo Switch, and mobile devices.",
      "Durable Construction: Built to last with quality materials and reinforced cable design."
    ],
    specifications: [
      { label: "Connection", value: "Wired (3.5mm jack)" },
      { label: "Driver Size", value: "40mm or 50mm drivers" },
      { label: "Microphone", value: "Noise-canceling boom microphone" },
      { label: "Compatibility", value: "PC, PS4, PS5, Xbox, Switch, Mobile" },
      { label: "Controls", value: "In-line volume and mute controls" },
      { label: "Design", value: "Over-ear with plush cushions" },
      { label: "Cable", value: "Reinforced, durable cable" }
    ]
  },
  {
    id: 116,
    name: "Foneng USB to USB-C Cable",
    title: "Foneng USB-A to USB-C Fast Charging Cable",
    price: 15.99,
    image: fonengUsbCable,
    rating: 4.6,
    category: "Charging",
    brand: "Foneng",
    description: "Fast charge and sync your devices with the Foneng USB-A to USB-C Cable. This durable cable supports fast charging and high-speed data transfer, making it ideal for connecting your USB-C devices to computers, power banks, or wall chargers. Built to last with quality materials and reinforced connectors.",
    features: [
      "Fast Charging Support: Enables rapid charging for compatible devices with fast charge technology.",
      "High-Speed Data Transfer: Transfer files at high speeds between your devices and computers.",
      "Durable Design: Reinforced connectors and braided cable construction for enhanced durability.",
      "Wide Compatibility: Works with smartphones, tablets, laptops, and other USB-C devices.",
      "Long Length: Generous cable length for comfortable use in various scenarios.",
      "Safety Protection: Built-in safety features to protect your devices during charging.",
      "Tangle-Resistant: Quality construction that resists tangling for easy storage."
    ],
    specifications: [
      { label: "Connectors", value: "USB-A to USB-C" },
      { label: "Fast Charging", value: "Supported for compatible devices" },
      { label: "Data Transfer", value: "High-speed data transfer" },
      { label: "Construction", value: "Braided cable, reinforced connectors" },
      { label: "Compatibility", value: "USB-C devices (smartphones, tablets, laptops)" },
      { label: "Safety", value: "Built-in protection features" }
    ]
  },
  {
    id: 117,
    name: "BOROFONE USB to USB-C Cable",
    title: "BOROFONE USB-A to USB-C Fast Charging Cable",
    price: 16.99,
    image: borofoneUsbCable,
    rating: 4.7,
    category: "Charging",
    brand: "BOROFONE",
    description: "Experience reliable charging and data transfer with the BOROFONE USB-A to USB-C Cable. This premium cable is designed for durability and performance, featuring fast charging capabilities and high-speed data synchronization. Perfect for daily use with your smartphone, tablet, or other USB-C devices.",
    features: [
      "Fast Charging: Supports fast charging protocols for rapid device charging.",
      "Quick Data Sync: High-speed data transfer rates for efficient file synchronization.",
      "Premium Quality: High-grade materials and construction for long-lasting reliability.",
      "Reinforced Connectors: Durable connectors with stress relief design to prevent breakage.",
      "Universal Compatibility: Works with all USB-C devices including smartphones, tablets, and laptops.",
      "Tangle-Free: Flexible cable design that stays organized and tangle-free.",
      "Safety Certified: Meets safety standards to protect your devices during use."
    ],
    specifications: [
      { label: "Connectors", value: "USB-A to USB-C" },
      { label: "Charging", value: "Fast charging supported" },
      { label: "Data Transfer", value: "High-speed data sync" },
      { label: "Quality", value: "Premium materials and construction" },
      { label: "Connectors", value: "Reinforced with stress relief" },
      { label: "Compatibility", value: "All USB-C devices" },
      { label: "Safety", value: "Safety certified" }
    ]
  },
  {
    id: 118,
    name: "Foneng Foldable Desktop Phone Holder",
    title: "Foneng Foldable Adjustable Desktop Phone Stand",
    price: 18.99,
    image: fonengDesktopHolder,
    rating: 4.6,
    category: "Accessories",
    brand: "Foneng",
    description: "Keep your phone at the perfect angle with the Foneng Foldable Desktop Phone Holder. This versatile stand features adjustable height and viewing angles, making it perfect for video calls, watching content, or following recipes in the kitchen. The foldable design makes it easy to store and transport.",
    features: [
      "Adjustable Height: Multiple height settings to find your perfect viewing position.",
      "360° Rotation: Rotate your phone to portrait or landscape orientation effortlessly.",
      "Foldable Design: Compact, foldable design that's easy to store and carry.",
      "Stable Base: Weighted base ensures stability and prevents tipping.",
      "Universal Compatibility: Holds smartphones of all sizes, from 4.7\" to 7\" devices.",
      "Non-Slip Surface: Soft silicone padding protects your device from scratches.",
      "Versatile Use: Perfect for video calls, watching videos, reading, or hands-free use."
    ],
    specifications: [
      { label: "Adjustability", value: "Height and angle adjustable" },
      { label: "Rotation", value: "360° rotation" },
      { label: "Design", value: "Foldable and portable" },
      { label: "Base", value: "Weighted, stable base" },
      { label: "Compatibility", value: "4.7\" to 7\" smartphones" },
      { label: "Protection", value: "Non-slip silicone padding" },
      { label: "Use Case", value: "Video calls, watching, reading" }
    ]
  },
  {
    id: 119,
    name: "Samsung 25W PD Power Adapter",
    title: "Samsung 25W USB-C Power Delivery Adapter",
    price: 27.99,
    image: samsung25WAdapter,
    rating: 4.8,
    category: "Charging",
    brand: "Samsung",
    description: "Fast charge your Samsung Galaxy devices and other USB-C phones with the Samsung 25W USB-C Power Delivery Adapter. This official Samsung charger delivers optimized charging performance for Galaxy smartphones and tablets, ensuring your device charges quickly and safely.",
    features: [
      "Official Samsung Product: Designed specifically for Samsung Galaxy devices for optimal performance.",
      "25W Super Fast Charging: Rapidly charges compatible Samsung devices up to 25W.",
      "Power Delivery (PD): Supports USB-C Power Delivery for fast charging of compatible devices.",
      "Compact Design: Small, lightweight design that's easy to carry and store.",
      "Wide Compatibility: Works with Samsung Galaxy S series, Note series, and other USB-C devices.",
      "Safety Features: Built-in protection against overcharging, overheating, and voltage fluctuations.",
      "Fast Charging Indicator: Compatible with Samsung's fast charging notification system."
    ],
    specifications: [
      { label: "Power Output", value: "25W" },
      { label: "Technology", value: "USB-C Power Delivery (PD)" },
      { label: "Compatibility", value: "Samsung Galaxy S/Note series, USB-C devices" },
      { label: "Design", value: "Compact and lightweight" },
      { label: "Protection", value: "Overcharge, overheat, voltage protection" },
      { label: "Brand", value: "Official Samsung product" }
    ]
  },
  {
    id: 125,
    name: "RGB MJ33 Ring LED Light (13 Inch)",
    title: "RGB MJ33 Ring LED Light 13 Inch - Professional Lighting",
    price: 49.99,
    image: rgbMj33Ring,
    rating: 4.8,
    category: "Accessories",
    brand: "Generic",
    description: "Illuminate your workspace or content creation setup with the RGB MJ33 Ring LED Light. This 13-inch professional ring light features adjustable brightness and color temperature, making it perfect for video calls, streaming, photography, and content creation. The RGB color modes add a creative touch to your setup.",
    features: [
      "13-Inch Large Ring Light: Generous 13-inch diameter provides even, professional lighting coverage.",
      "RGB Color Modes: Multiple RGB color modes and effects to create the perfect ambiance.",
      "Adjustable Brightness: Multiple brightness levels from soft glow to bright studio lighting.",
      "Color Temperature Control: Adjustable color temperature (warm to cool) for natural-looking light.",
      "Flexible Mounting Options: Compatible with tripods, desk mounts, and other standard mounting solutions.",
      "USB Powered: Convenient USB power supply for easy connection to computers, power banks, or wall adapters.",
      "Professional Quality: High-quality LED panels ensure consistent, flicker-free illumination."
    ],
    specifications: [
      { label: "Size", value: "13 inches diameter" },
      { label: "Light Modes", value: "RGB color modes + white light" },
      { label: "Brightness", value: "Adjustable multiple levels" },
      { label: "Color Temperature", value: "Adjustable warm to cool" },
      { label: "Power", value: "USB powered" },
      { label: "Mounting", value: "Standard tripod/desk mount compatible" },
      { label: "LED Type", value: "High-quality LED panels" }
    ]
  },
  {
    id: 126,
    name: "RL-19 LED Soft Light Strip",
    title: "RL-19 RGB LED Soft Light Strip - Ambient Lighting",
    price: 24.99,
    image: rl19LedSoft,
    rating: 4.7,
    category: "Accessories",
    brand: "Generic",
    description: "Transform your space with the RL-19 LED Soft Light Strip. This flexible RGB LED strip features smooth color transitions, multiple lighting modes, and easy installation. Perfect for adding ambient lighting to your desk, room, or gaming setup. The soft, diffused light creates a relaxing and modern atmosphere.",
    features: [
      "RGB Color Changing: Full RGB color spectrum with smooth color transitions and effects.",
      "Soft Diffused Light: Soft, even light distribution without harsh spots or glare.",
      "Multiple Lighting Modes: Various modes including static colors, color cycling, breathing effects, and more.",
      "Remote Control: Wireless remote control for easy color and mode adjustments.",
      "Easy Installation: Self-adhesive backing for quick and easy installation on any clean surface.",
      "Flexible Design: Flexible strip design allows for curved installations and creative setups.",
      "Energy Efficient: Low power consumption LED technology for long-lasting, energy-efficient operation."
    ],
    specifications: [
      { label: "LED Type", value: "RGB LED soft light strip" },
      { label: "Control", value: "Wireless remote control included" },
      { label: "Installation", value: "Self-adhesive backing" },
      { label: "Modes", value: "Multiple lighting modes and effects" },
      { label: "Power", value: "USB or adapter powered" },
      { label: "Flexibility", value: "Flexible, cuttable design" },
      { label: "Length", value: "Standard length with extension options" }
    ]
  }
];

// Wearables products
export const wearablesProducts: Product[] = [
  {
    id: 201,
    name: "S8 Ultra Max Smart Watch",
    title: "S8 Ultra Max Smart Watch - Premium Fitness & Health Tracker",
    price: 199.99,
    image: s8UltraMax,
    rating: 4.7,
    category: "Wearables",
    brand: "Generic",
    description: "Experience the ultimate in smartwatch technology with the S8 Ultra Max. This premium smartwatch combines advanced health tracking, fitness monitoring, and smart connectivity in a sleek, durable design. Perfect for fitness enthusiasts, health-conscious individuals, and tech-savvy users who demand the best in wearable technology.",
    features: [
      "Large HD Display: Crystal-clear 1.9-inch AMOLED display with vibrant colors and excellent visibility in all lighting conditions.",
      "Advanced Health Monitoring: 24/7 heart rate monitoring, blood oxygen (SpO2) tracking, sleep analysis, and stress monitoring.",
      "Fitness Tracking: 100+ sports modes including running, cycling, swimming, hiking, and more with GPS tracking.",
      "Long Battery Life: Up to 7 days of battery life on a single charge with normal use.",
      "Water Resistance: IP68 rating for swimming and water activities up to 50 meters.",
      "Smart Notifications: Receive calls, messages, and app notifications directly on your wrist.",
      "Music Control: Control your music playback and store music directly on the watch.",
      "Customizable Watch Faces: Choose from hundreds of watch faces or create your own."
    ],
    specifications: [
      { label: "Display", value: "1.9-inch AMOLED HD display" },
      { label: "Battery Life", value: "Up to 7 days" },
      { label: "Water Resistance", value: "IP68 (50 meters)" },
      { label: "Health Features", value: "Heart rate, SpO2, sleep, stress monitoring" },
      { label: "Sports Modes", value: "100+ sports modes" },
      { label: "GPS", value: "Built-in GPS tracking" },
      { label: "Connectivity", value: "Bluetooth 5.0, Smart notifications" },
      { label: "Compatibility", value: "iOS and Android" }
    ]
  },
  {
    id: 202,
    name: "Smart Watch Active Pro (Green Lion)",
    title: "Smart Watch Active Pro - Green Lion Edition - Advanced Fitness Tracker",
    price: 179.99,
    image: smartWatchActivePro,
    rating: 4.6,
    category: "Wearables",
    brand: "Green Lion",
    description: "The Smart Watch Active Pro Green Lion Edition is a powerful fitness companion designed for active lifestyles. With its striking green design and comprehensive health tracking features, this smartwatch helps you stay on top of your fitness goals while keeping you connected throughout the day.",
    features: [
      "Vibrant Green Design: Eye-catching green colorway that stands out from the crowd.",
      "Comprehensive Health Tracking: Real-time heart rate monitoring, blood oxygen levels, sleep quality analysis, and menstrual cycle tracking.",
      "Fitness Modes: 90+ professional sports modes with detailed workout analytics and performance metrics.",
      "Extended Battery: Up to 10 days of battery life with typical usage, 30 days in power-saving mode.",
      "Swim-Proof Design: 5ATM water resistance for swimming and water sports.",
      "Smart Features: Call and message notifications, weather updates, alarm, timer, and stopwatch.",
      "Activity Reminders: Gentle reminders to move, drink water, and take breaks throughout the day.",
      "Health Insights: AI-powered health insights and personalized fitness recommendations."
    ],
    specifications: [
      { label: "Display", value: "1.4-inch color touchscreen" },
      { label: "Battery Life", value: "Up to 10 days (30 days power-saving)" },
      { label: "Water Resistance", value: "5ATM (50 meters)" },
      { label: "Health Tracking", value: "Heart rate, SpO2, sleep, menstrual cycle" },
      { label: "Sports Modes", value: "90+ professional modes" },
      { label: "Connectivity", value: "Bluetooth 5.1" },
      { label: "Compatibility", value: "iOS 10.0+ and Android 5.0+" },
      { label: "Special Feature", value: "Green Lion Edition design" }
    ]
  },
  {
    id: 203,
    name: "U9 Ultra 2 Smart Watch",
    title: "U9 Ultra 2 Smart Watch - Ultra-Premium Health & Fitness Tracker",
    price: 249.99,
    image: u9Ultra2,
    rating: 4.8,
    category: "Wearables",
    brand: "Generic",
    description: "The U9 Ultra 2 represents the pinnacle of smartwatch innovation, combining cutting-edge technology with elegant design. This ultra-premium smartwatch offers comprehensive health monitoring, advanced fitness tracking, and seamless smartphone integration, making it the perfect companion for your active lifestyle.",
    features: [
      "Premium Build Quality: High-grade materials with a sleek, modern design that exudes sophistication.",
      "Advanced Health Sensors: Multi-sensor health monitoring including heart rate, SpO2, body temperature, and blood pressure estimation.",
      "Comprehensive Fitness Tracking: 120+ sports modes with real-time coaching and performance analysis.",
      "Dual GPS System: Accurate GPS + GLONASS positioning for precise location tracking during workouts.",
      "Long-Lasting Battery: Up to 15 days of battery life with all features enabled, 45 days in basic mode.",
      "Premium Display: High-resolution color display with always-on option and excellent outdoor visibility.",
      "Smart Connectivity: Full smartphone integration with call handling, message replies, and app notifications.",
      "Music Storage: Built-in storage for music playback without your phone."
    ],
    specifications: [
      { label: "Display", value: "High-resolution color display with always-on" },
      { label: "Battery Life", value: "Up to 15 days (45 days basic mode)" },
      { label: "Health Sensors", value: "Heart rate, SpO2, temperature, blood pressure" },
      { label: "Sports Modes", value: "120+ professional modes" },
      { label: "GPS", value: "Dual GPS (GPS + GLONASS)" },
      { label: "Water Resistance", value: "IP68 (5ATM)" },
      { label: "Storage", value: "Built-in music storage" },
      { label: "Connectivity", value: "Bluetooth 5.2, Full smartphone integration" }
    ]
  },
  {
    id: 204,
    name: "Watch X Series 10",
    title: "Watch X Series 10 - Next-Generation Smart Watch",
    price: 229.99,
    image: watchXSeries10,
    rating: 4.9,
    category: "Wearables",
    brand: "Generic",
    description: "The Watch X Series 10 is the latest evolution in smartwatch technology, featuring state-of-the-art health monitoring, AI-powered fitness coaching, and seamless integration with your digital life. This next-generation smartwatch is designed for those who want the most advanced features in a stylish, comfortable package.",
    features: [
      "Next-Gen Display: Ultra-bright, high-resolution display with 60Hz refresh rate for smooth interactions.",
      "AI Fitness Coach: Personalized workout recommendations and real-time coaching based on your fitness level and goals.",
      "Advanced Health Suite: Comprehensive health monitoring including ECG, heart rate variability (HRV), stress levels, and recovery metrics.",
      "Premium Materials: Premium build with scratch-resistant glass and durable, lightweight materials.",
      "Extended Battery: Up to 12 days of typical use, fast charging capability (full charge in 1 hour).",
      "Advanced Sensors: Latest generation sensors for more accurate health and fitness data.",
      "Smart Features: Voice assistant support, contactless payments, and extensive app ecosystem.",
      "Professional Sports Tracking: Advanced metrics for running, cycling, swimming, and other professional sports."
    ],
    specifications: [
      { label: "Display", value: "High-resolution display, 60Hz refresh rate" },
      { label: "Battery Life", value: "Up to 12 days (fast charge: 1 hour)" },
      { label: "Health Features", value: "ECG, HRV, heart rate, SpO2, stress, recovery" },
      { label: "AI Features", value: "AI fitness coach, personalized recommendations" },
      { label: "Sports Tracking", value: "Professional-grade metrics and analysis" },
      { label: "Water Resistance", value: "IP68 (5ATM)" },
      { label: "Smart Features", value: "Voice assistant, contactless payments" },
      { label: "Connectivity", value: "Bluetooth 5.3, Wi-Fi, NFC" }
    ]
  }
];

// Helper function to get product by ID
export const getProductById = (id: number): Product | undefined => {
  const allProducts = [...phoneAccessories, ...wearablesProducts];
  return allProducts.find(product => product.id === id);
};

// Helper function to get products by category
export const getProductsByCategory = (category: string): Product[] => {
  const allProducts = [...phoneAccessories, ...wearablesProducts];
  return allProducts.filter(product => product.category === category);
};

