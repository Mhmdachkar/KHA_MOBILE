import { useState } from 'react';
import { smartphonesProducts, tabletProducts, audioProducts, wearablesProducts, gamingProducts } from '../data/allProducts';
import { iphoneCases } from '../data/products';
import html2canvas from 'html2canvas';

interface PromoItem {
    id: string | number;
    name: string;
    price: number;
    category: string;
}

export default function InstagramPromoChristmas() {
    const [downloading, setDownloading] = useState(false);

    // Filter products for the promo page (exact match to main promo)
    const phones = smartphonesProducts.slice(0, 8);
    const gaming = gamingProducts.slice(0, 5);

    // Tablets - Manual update
    const tablets: PromoItem[] = [
        { id: 't1', name: 'Apple iPad Air M3 Chip 13-inch', price: 749.99, category: 'Tablets' },
        { id: 't2', name: 'Apple iPad Air 6th Gen 13-inch (M2)', price: 699.99, category: 'Tablets' },
        { id: 't3', name: 'Apple iPad Air M3 Chip 11-inch', price: 550.00, category: 'Tablets' },
        { id: 't4', name: 'iPad 11-inch (A16 Chip)', price: 400.00, category: 'Tablets' },
        { id: 't5', name: 'Samsung Galaxy Tab A9+ 11"', price: 219.99, category: 'Tablets' },
    ];

    // Wearables - Manual update
    const wearables: PromoItem[] = [
        { id: 'w1', name: 'Apple Watch Series 11 42mm', price: 415.00, category: 'Wearables' },
        { id: 'w2', name: 'Apple Watch Series 10 46mm', price: 370.00, category: 'Wearables' },
        { id: 'w3', name: 'Apple Watch SE3 (2nd Gen) 40mm', price: 300.00, category: 'Wearables' },
        { id: 'w4', name: 'Apple Watch SE (2nd Gen) 44mm', price: 290.00, category: 'Wearables' },
        { id: 'w5', name: 'Green Lion Ultimate 10 46MM', price: 50.00, category: 'Wearables' },
    ];

    // Audio - Manual update
    const audio: PromoItem[] = [
        { id: 'a1', name: 'Apple AirPods Pro 3', price: 287.00, category: 'Audio' },
        { id: 'a2', name: 'Apple AirPods Pro (2nd Gen)', price: 215.00, category: 'Audio' },
        { id: 'a3', name: 'Apple AirPods 4 (Original)', price: 150.00, category: 'Audio' },
        { id: 'a4', name: 'Green Lion Jupiter Speaker', price: 59.99, category: 'Audio' },
        { id: 'a5', name: 'Galaxy Buds6 Pro', price: 15.00, category: 'Audio' },
    ];

    // Dynamically fetch iPhone 17 Case 
    const iphone17Case = iphoneCases.find(p => p.name.includes("iPhone 17 Pro Max Silicone Case with MagSafe")) || {
        id: 'acc1', name: 'iPhone 17 Pro Max Silicone Case with MagSafe', price: 70, category: 'Accessories'
    };

    const iphoneAccessories: PromoItem[] = [
        {
            id: iphone17Case.id,
            name: iphone17Case.name,
            price: iphone17Case.price,
            category: 'Accessories'
        },
        { id: 'acc2', name: 'Apple MagSafe Charger', price: 75.00, category: 'Accessories' },
    ];

    const services: PromoItem[] = [
        { id: 's1', name: 'Netflix Subscription (1 Month)', price: 5, category: 'Services' },
        { id: 's2', name: 'Netflix Subscription (1 Year)', price: 30, category: 'Services' },
        { id: 's3', name: 'Shahid VIP (1 Month)', price: 5, category: 'Services' },
        { id: 's4', name: 'IPTV Premium (1 Year)', price: 50, category: 'Services' },
    ];

    const handleDownload = async () => {
        setDownloading(true);
        const element = document.getElementById('promo-content-christmas');
        if (element) {
            try {
                const canvas = await html2canvas(element, {
                    scale: 3,
                    backgroundColor: '#ffffff', // White background
                    useCORS: true,
                    logging: false,
                    windowWidth: 1080,
                });

                const link = document.createElement('a');
                link.download = `KHA_MOBILE_Christmas_${new Date().toISOString().split('T')[0]}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            } catch (error) {
                console.error("Download failed:", error);
                alert("Failed to generate image. Please try again.");
            }
        }
        setDownloading(false);
    };

    // Helper to render a category section
    const renderCategory = (title: string, items: any[], accentColor: string) => {
        if (!items || items.length === 0) return null;
        return (
            <div className="mb-8 break-inside-avoid">
                <h2 className={`text-2xl font-bold mb-4 uppercase tracking-widest border-b-2 ${accentColor} pb-1 inline-block text-gray-800`}>
                    {title}
                </h2>
                <div className="space-y-4">
                    {items.map((item: any) => {
                        const isConsole = (
                            item.name.toLowerCase().includes('ps4') ||
                            item.name.toLowerCase().includes('ps5') ||
                            item.name.toLowerCase().includes('playstation')
                        ) && item.price === 0;
                        const priceDisplay = isConsole ? "PREORDER" : `$${item.price.toFixed(0)}`;

                        return (
                            <div key={item.id} className="flex flex-col">
                                <div className="flex justify-between items-end text-base md:text-lg py-2 leading-relaxed">
                                    <span className="font-medium text-gray-700 whitespace-normal pr-4">{item.name}</span>
                                    <span className={`font-bold text-xl md:text-2xl ${isConsole ? 'text-red-600' : 'text-red-700'} whitespace-nowrap`}>
                                        {priceDisplay}
                                    </span>
                                </div>
                                {/* explicit divider */}
                                <div className="w-full h-[1px] bg-gray-200"></div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4 md:p-8">

            {/* Download Control */}
            <div className="fixed top-4 right-4 z-50 flex gap-2">
                <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {downloading ? (
                        <>
                            <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                            Generating Festive Image...
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download Christmas Edition
                        </>
                    )}
                </button>
            </div>

            <p className="text-gray-600 mb-4 text-center">
                Christmas Preview. Click the button above to download.
            </p>

            {/* Main Promo Content Container */}
            <div
                id="promo-content-christmas"
                className="width-[1080px] min-w-[1080px] max-w-[1080px] bg-white text-gray-900 p-12 shadow-2xl relative overflow-hidden font-sans selection:bg-red-200 selection:text-black mx-auto"
                style={{
                    width: '1080px',
                    backgroundImage: 'url(/white_christmas_bg.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >

                {/* Header */}
                <div className="flex flex-col items-center justify-center text-center mb-16 relative z-10">

                    {/* Logo - Original Colors, No Background */}
                    <img
                        src="/LOGO.png"
                        alt="KHA_MOBILE Logo"
                        className="h-28 w-auto object-contain mb-6 drop-shadow-xl" // Removed brightness-0
                    />

                    <h1 className="text-6xl font-black uppercase tracking-tighter text-green-700 mb-4 drop-shadow-sm">
                        KHA_MOBILE
                        <span className="block text-xl text-green-700 font-medium tracking-widest mt-2">Christmas Edition</span>
                    </h1>

                    <div className="flex flex-col items-center gap-2">
                        <div className="w-64 h-[1px] bg-red-200"></div>
                        <p className="text-2xl text-green-800 tracking-[0.6em] uppercase font-light px-8">
                            Premium Price List
                        </p>
                        <div className="w-64 h-[1px] bg-red-200"></div>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 gap-x-16 gap-y-12 relative z-10">

                    {/* Column 1 */}
                    <div className="space-y-6">
                        {renderCategory("iPhone Accessories", iphoneAccessories, "border-red-500")}
                        {renderCategory("Smartphones", phones, "border-green-600")}
                        {renderCategory("Tablets", tablets, "border-red-500")}
                    </div>

                    {/* Column 2 */}
                    <div className="space-y-6">
                        {renderCategory("Gaming", gaming, "border-green-600")}
                        {renderCategory("Audio", audio, "border-red-500")}
                        {renderCategory("Wearables", wearables, "border-green-600")}
                        {renderCategory("Digital Services", services, "border-red-500")}
                    </div>

                </div>

                {/* Footer */}
                <div className="mt-16 text-center pt-8 relative z-10 pb-4">
                    <div className="w-32 h-[1px] bg-gray-300 mx-auto mb-6"></div>
                    {/* Made text bolder and stronger as requested */}
                    <p className="text-green-800 text-2xl font-black tracking-wider mb-6">
                        + 80 MORE PRODUCTS AVAILABLE ONLINE
                    </p>
                    <p className="text-gray-600 text-lg font-bold uppercase tracking-widest mb-3">
                        Happy Holidays • Visit us
                    </p>
                    <p className="text-red-700 font-black text-3xl tracking-wide">khamobile.netlify.app</p>
                </div>
            </div>
        </div>
    );
}
