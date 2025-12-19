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

export default function InstagramPromo() {
    const [downloading, setDownloading] = useState(false);

    // Filter products for the promo page
    // We want to be selective to ensure it fits nicely in the 1080px layout
    // Smartphones and Gaming kept as is (or dynamic if preferred, but user didn't provide updates for them)
    // We will stick to the existing data for these, but maybe slice slightly differently if the user implies "Samsung" header meant phones?
    // actually user text started "Samsung ... Tablets", so looks like no phone updates.
    const phones = smartphonesProducts.slice(0, 8);
    const gaming = gamingProducts.slice(0, 5);

    // Tablets - Manual update from user list
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
            name: iphone17Case.name, // Keep full name as verified before
            price: iphone17Case.price, // $70 from DB
            category: 'Accessories'
        },
        { id: 'acc2', name: 'Apple MagSafe Charger', price: 75.00, category: 'Accessories' }, // Updated to $75
    ];

    const services: PromoItem[] = [
        { id: 's1', name: 'Netflix Subscription (1 Month)', price: 5, category: 'Services' },
        { id: 's2', name: 'Netflix Subscription (1 Year)', price: 30, category: 'Services' }, // Updated to $30
        { id: 's3', name: 'Shahid VIP (1 Month)', price: 5, category: 'Services' }, // Updated to $5
        { id: 's4', name: 'IPTV Premium (1 Year)', price: 50, category: 'Services' }, // Updated to $50
    ];

    const handleDownload = async () => {
        setDownloading(true);
        const element = document.getElementById('promo-content');
        if (element) {
            try {
                const canvas = await html2canvas(element, {
                    scale: 3, // High resolution scale (3x 1080px width)
                    backgroundColor: '#000000', // Ensure black background
                    useCORS: true, // Handle cross-origin images if any
                    logging: false,
                    windowWidth: 1080, // Force width logic
                });

                const link = document.createElement('a');
                link.download = `KHA_MOBILE_Promo_${new Date().toISOString().split('T')[0]}.png`;
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
    const renderCategory = (title: string, items: any[], colorClass: string) => {
        if (!items || items.length === 0) return null;
        return (
            <div className="mb-8 break-inside-avoid">
                <h2 className={`text-2xl font-bold mb-4 uppercase tracking-widest border-b-2 ${colorClass} pb-1 inline-block`}>
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
                                <div className="flex justify-between items-end text-sm md:text-base py-2 leading-relaxed">
                                    <span className="font-medium text-gray-200 whitespace-normal pr-4">{item.name}</span>
                                    <span className={`font-bold ${isConsole ? 'text-gold-500' : colorClass.replace('border-', 'text-')} whitespace-nowrap`}>
                                        {priceDisplay}
                                    </span>
                                </div>
                                {/* Explicit Separator Line - safer for canvas than border-b */}
                                <div className="w-full h-[1px] bg-gray-800"></div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center p-4 md:p-8">

            {/* Download Control */}
            <div className="fixed top-4 right-4 z-50 flex gap-2">
                <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="bg-gold-500 hover:bg-gold-600 text-black font-bold py-3 px-6 rounded-full shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {downloading ? (
                        <>
                            <span className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full"></span>
                            Generating HQ Image...
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download High-Res
                        </>
                    )}
                </button>
            </div>

            <p className="text-gray-400 mb-4 text-center">
                Preview Mode. Click the button above to download the high-quality version.
            </p>

            {/* Main Promo Content Container */}
            <div
                id="promo-content"
                className="width-[1080px] min-w-[1080px] max-w-[1080px] bg-black text-white p-12 shadow-2xl relative overflow-hidden font-sans selection:bg-gold-500 selection:text-black mx-auto"
                style={{ width: '1080px' }} // Inline style to strictly force width for html2canvas
            >

                {/* Decorative background gradients */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-900/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                {/* Header */}
                <div className="flex flex-col items-center justify-center text-center mb-16 relative z-10">
                    <img
                        src="/LOGO.png"
                        alt="KHA_MOBILE Logo"
                        className="h-28 w-auto object-contain mb-6 drop-shadow-2xl"
                    />
                    {/* html2canvas struggles with bg-clip-text, so we use standard text color for robust rendering */}
                    <h1 className="text-6xl font-black uppercase tracking-tighter text-white mb-4 drop-shadow-lg">
                        KHA_MOBILE
                    </h1>

                    {/* Explicit separators for the subtitle to avoid canvas border conflicts */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-64 h-[1px] bg-gold-500/50"></div>
                        <p className="text-2xl text-gold-500 tracking-[0.6em] uppercase font-light px-8">
                            Premium Price List
                        </p>
                        <div className="w-64 h-[1px] bg-gold-500/50"></div>
                    </div>
                </div>

                {/* Masonry-style Grid */}
                <div className="grid grid-cols-2 gap-x-16 gap-y-12 relative z-10">

                    {/* Column 1 */}
                    <div className="space-y-6">
                        {renderCategory("iPhone Accessories", iphoneAccessories, "border-orange-500")}
                        {renderCategory("Smartphones", phones, "border-blue-500")}
                        {renderCategory("Tablets", tablets, "border-green-500")}
                    </div>

                    {/* Column 2 */}
                    <div className="space-y-6">
                        {renderCategory("Gaming", gaming, "border-purple-500")}
                        {renderCategory("Audio", audio, "border-yellow-500")}
                        {renderCategory("Wearables", wearables, "border-red-500")}
                        {renderCategory("Digital Services", services, "border-pink-500")}
                    </div>

                </div>

                {/* Footer */}
                <div className="mt-16 text-center pt-8 relative z-10 pb-4">
                    {/* Explicit footer separator */}
                    <div className="w-32 h-[1px] bg-gray-800 mx-auto mb-6"></div>
                    <p className="text-gray-300 text-lg font-light tracking-wider mb-6">
                        + 80 more products available online
                    </p>
                    <p className="text-gray-400 text-sm uppercase tracking-widest mb-3">Visit us today</p>
                    <p className="text-gold-500 font-bold text-2xl tracking-wide">khamobile.netlify.app</p>
                </div>
            </div>
        </div>
    );
}
