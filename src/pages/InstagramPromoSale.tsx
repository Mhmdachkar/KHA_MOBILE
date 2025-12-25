import { useState } from 'react';
import html2canvas from 'html2canvas';

export default function InstagramPromoSale() {
    const [downloading, setDownloading] = useState(false);

    // Editable State
    const [price, setPrice] = useState('255$');
    const [promoText, setPromoText] = useState('Free accessory');
    const [productName, setProductName] = useState('SAMSUNG GALAXY TAB A9');
    const [specs, setSpecs] = useState('X110 - EXPAND YOUR HORIZONS');

    const handleDownload = async () => {
        setDownloading(true);
        const element = document.getElementById('promo-sale-content');
        if (element) {
            try {
                const canvas = await html2canvas(element, {
                    scale: 3,
                    useCORS: true,
                    logging: false,
                    windowWidth: 1080,
                });

                const link = document.createElement('a');
                link.download = `KHA_MOBILE_Sale_${new Date().toISOString().split('T')[0]}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            } catch (error) {
                console.error("Download failed:", error);
                alert("Failed to generate image. Please try again.");
            }
        }
        setDownloading(false);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4 md:p-8 font-sans">

            {/* Controls */}
            <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 bg-white p-4 rounded-xl shadow-xl">
                <input
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="border p-2 rounded" placeholder="Price"
                />
                <input
                    value={promoText}
                    onChange={(e) => setPromoText(e.target.value)}
                    className="border p-2 rounded" placeholder="Promo Text"
                />
                <input
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="border p-2 rounded" placeholder="Product Name"
                />
                <input
                    value={specs}
                    onChange={(e) => setSpecs(e.target.value)}
                    className="border p-2 rounded" placeholder="Specs"
                />
                <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-700 transition"
                >
                    {downloading ? "Generating..." : "Download Sale Ad"}
                </button>
            </div>

            {/* AD CANVAS */}
            <div
                id="promo-sale-content"
                className="relative width-[1080px] min-w-[1080px] max-w-[1080px] aspect-square shadow-2xl overflow-hidden mx-auto flex flex-col"
                style={{
                    width: '1080px',
                    height: '1080px',
                }}
            >
                {/* Background Image: Golden Snow (Festive & Luxury) */}
                <div className="absolute inset-0 bg-[url('/golden_snow_bg.png')] bg-cover bg-center" />

                {/* Dark Overlay for Text Pop */}
                <div className="absolute inset-0 bg-black/40" />

                {/* Fonts */}
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;600;800&family=Outfit:wght@300;700&display=swap');
                `}} />

                {/* 1. Header (Logo) */}
                <div className="pt-12 flex justify-center items-center gap-3 relative z-10">
                    <img src="/LOGO.png" alt="Logo" className="h-16 w-auto drop-shadow-lg" />
                    <div className="flex flex-col">
                        <h2 className="text-3xl font-bold tracking-widest text-white uppercase drop-shadow-md" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            KHA_MOBILE
                        </h2>
                        <p className="text-xs tracking-[0.4em] text-amber-400 uppercase font-bold text-center drop-shadow-md">
                            Premium Tech
                        </p>
                    </div>
                </div>

                {/* 2. Main Content Area */}
                <div className="flex-1 flex items-center relative mt-[-50px] z-10 w-full px-16">

                    {/* Left: Price & Offer */}
                    <div className="flex flex-col items-start z-10 w-1/2">
                        <h1 className="text-[180px] leading-none text-white tracking-tighter drop-shadow-2xl" style={{ fontFamily: 'Anton, sans-serif' }}>
                            {price}
                        </h1>
                        <div className="bg-red-600 text-white text-3xl font-bold py-3 px-8 transform -skew-x-12 inline-block shadow-[8px_8px_0_rgba(0,0,0,0.5)] mt-4">
                            <span className="block transform skew-x-12 tracking-wide uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                                {promoText}
                            </span>
                        </div>
                    </div>

                    {/* Right: CSS Tablet Mockup (Replaces Image) */}
                    <div className="absolute right-[-40px] top-1/2 transform -translate-y-1/2 z-20 pointer-events-none">
                        <div className="relative transform -rotate-6 transition-transform duration-700 hover:rotate-0">
                            {/* Golden Glow Behind */}
                            <div className="absolute inset-0 bg-amber-500/30 blur-[60px] rounded-full scale-90"></div>

                            {/* Tablet Frame */}
                            <div className="relative w-[700px] h-[450px] bg-gray-900 rounded-[24px] border-[4px] border-gray-700 shadow-[0_40px_60px_rgba(0,0,0,0.7)] p-2">
                                {/* Camera */}
                                <div className="absolute top-1/2 right-2 transform -translate-y-1/2 w-2 h-2 bg-gray-600 rounded-full z-30"></div>

                                {/* Screen (Dark/Premium) */}
                                <div className="w-full h-full bg-slate-900 rounded-[16px] overflow-hidden relative flex items-center justify-center border border-gray-800">
                                    {/* Wallpaper / Content */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-black opacity-90"></div>
                                    <h3 className="relative z-10 text-white/10 font-bold text-6xl tracking-widest uppercase" style={{ fontFamily: 'Outfit' }}>Samsung</h3>

                                    {/* Glossy Reflection */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent skew-x-12 opacity-50 pointer-events-none"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Bottom Specs */}
                <div className="pb-24 text-center z-10 relative">
                    <h3 className="text-5xl font-black text-white uppercase tracking-tight mb-2 drop-shadow-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {productName}
                    </h3>
                    <p className="text-2xl text-gray-200 font-medium tracking-widest uppercase drop-shadow-md">
                        {specs}
                    </p>
                </div>

                {/* 4. Footer Bar */}
                <div className="absolute bottom-10 left-0 w-full px-16 flex justify-between items-center text-white z-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/20 shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold tracking-wide drop-shadow-md">@KHA_MOBILE</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/20 shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold tracking-wide drop-shadow-md">76 982 454</span>
                    </div>
                </div>

            </div>
        </div>
    );
}
