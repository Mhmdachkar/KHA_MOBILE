import { useState } from 'react';
import html2canvas from 'html2canvas';

export default function InstagramPromoTech() {
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        setDownloading(true);
        const element = document.getElementById('promo-content-tech');
        if (element) {
            try {
                const canvas = await html2canvas(element, {
                    scale: 3, // High Res for ads
                    useCORS: true,
                    logging: false,
                    windowWidth: 1080,
                });

                const link = document.createElement('a');
                link.download = `KHA_MOBILE_Ad_Tech_${new Date().toISOString().split('T')[0]}.png`;
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
        <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center p-4 md:p-8 font-sans">

            {/* Controls */}
            <div className="fixed top-4 right-4 z-50 flex gap-2">
                <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 px-6 rounded-full shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {downloading ? "Rendering Future..." : "Download Ad High-Res"}
                </button>
            </div>

            <p className="text-gray-400 mb-6 text-center font-light uppercase tracking-widest">
                Instagram Feed / Story Ad Generator
            </p>

            {/* AD CANVAS */}
            <div
                id="promo-content-tech"
                className="relative width-[1080px] min-w-[1080px] max-w-[1080px] aspect-square shadow-2xl overflow-hidden text-white mx-auto flex flex-col"
                style={{
                    width: '1080px',
                    height: '1080px', // Square for Instagram Post
                    backgroundImage: 'url(/tech_bg.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                {/* Overlay Gradient for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>

                {/* Content Container */}
                <div className="relative z-10 flex-1 flex flex-col justify-between p-16">

                    {/* Top Branding */}
                    <div className="flex justify-between items-start">
                        {/* Logo Mark */}
                        <div className="bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                            <img
                                src="/LOGO.png"
                                alt="KHA_MOBILE"
                                className="h-20 w-auto object-contain brightness-0 invert"
                            />
                        </div>

                        {/* Tagline */}
                        <div className="text-right">
                            <h3 className="text-amber-400 font-bold text-xl tracking-[0.3em] uppercase mb-1">Authentic</h3>
                            <p className="text-gray-300 font-light tracking-wider">Authorized Reseller</p>
                        </div>
                    </div>

                    {/* Middle / Center - (Visual is here) */}

                    {/* Bottom Messaging */}
                    <div className="mt-auto space-y-6">

                        {/* Main Headline */}
                        <div>
                            <h2 className="text-2xl text-amber-500 font-medium tracking-widest uppercase mb-2">The Future is Here</h2>
                            <h1 className="text-8xl font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500 drop-shadow-2xl">
                                UPGRADE <br />
                                <span className="text-white">YOUR WORLD.</span>
                            </h1>
                        </div>

                        <div className="w-32 h-1 bg-amber-500 my-6"></div>

                        {/* Feature List (Horizontal) */}
                        <div className="flex gap-12 text-lg font-light tracking-wide text-gray-300">
                            <div className="flex items-center gap-3">
                                <span className="text-amber-500 text-2xl">✓</span> Best Market Prices
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-amber-500 text-2xl">✓</span> Premium Warranty
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-amber-500 text-2xl">✓</span> Same Day Delivery
                            </div>
                        </div>

                        {/* CTA Button Visual */}
                        <div className="pt-8 flex items-end justify-between">
                            <div>
                                <p className="text-gray-400 uppercase tracking-widest text-sm mb-2">Shop Online Now</p>
                                <p className="text-4xl font-bold text-amber-500 tracking-wide">khamobile.netlify.app</p>
                            </div>

                            {/* Visual Badge */}
                            <div className="bg-white text-black font-black text-xl py-4 px-8 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                                VISIT STORE ↗
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Story Version (Preview only, download logic handles specific ID) could be added here later */}
        </div>
    );
}
