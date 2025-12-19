import { useState } from 'react';
import html2canvas from 'html2canvas';

export default function InstagramPromoLive() {
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        setDownloading(true);
        const element = document.getElementById('promo-content-live');
        if (element) {
            try {
                const canvas = await html2canvas(element, {
                    scale: 4, // Ultra High Res (4x) for maximum clarity
                    useCORS: true,
                    allowTaint: true,
                    logging: false,
                    windowWidth: 1080,
                    imageTimeout: 0, // Wait for images to load
                });

                const link = document.createElement('a');
                link.download = `KHA_MOBILE_Ad_Launch_${new Date().toISOString().split('T')[0]}.png`;
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
            <div className="fixed top-4 right-4 z-50 flex gap-2">
                <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="bg-black text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {downloading ? "Generating..." : "Download Launch Ad"}
                </button>
            </div>

            <p className="text-gray-500 mb-6 text-center font-light uppercase tracking-widest font-sans">
                "We're Live" Layout Generator
            </p>

            {/* AD CANVAS */}
            <div
                id="promo-content-live"
                className="relative width-[1080px] min-w-[1080px] max-w-[1080px] aspect-square shadow-2xl overflow-hidden bg-white mx-auto flex flex-col items-center"
                style={{
                    width: '1080px',
                    height: '1080px', // Square for Instagram Post
                }}
            >
                {/* Background: Geometric Lines (Subtle Gold) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" xmlns="http://www.w3.org/2000/svg">
                    <line x1="0" y1="1080" x2="1080" y2="0" stroke="#F59E0B" strokeWidth="2" />
                    <line x1="200" y1="1080" x2="1080" y2="200" stroke="#F59E0B" strokeWidth="1" />
                    <line x1="0" y1="800" x2="800" y2="0" stroke="#F59E0B" strokeWidth="1" />
                    <circle cx="900" cy="200" r="100" stroke="#F59E0B" strokeWidth="1" fill="none" />
                    <circle cx="100" cy="900" r="150" stroke="#F59E0B" strokeWidth="2" fill="none" />
                </svg>

                {/* Google Fonts - UPDATED: Outfit + Cinzel */}
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400&family=Cinzel:wght@400;700&family=Inter:wght@300;400;700&display=swap');
                `}} />

                {/* TOP BRANDING */}
                <div className="pt-16 flex items-center gap-4 z-10">
                    <img src="/LOGO.png" alt="Logo" className="h-16 w-auto" />
                    <div className="text-left leading-none">
                        <h3 className="font-bold text-2xl uppercase tracking-wider text-black">KHA_MOBILE</h3>
                        <p className="text-amber-500 text-sm font-bold tracking-[0.2em] uppercase">Premium Tech</p>
                    </div>
                </div>

                {/* HEADLINE - LIGHTER FONT (OUTFIT) */}
                <h1 className="text-[140px] leading-none font-extralight text-black mt-8 z-10 uppercase tracking-wide" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    WE'RE LIVE!
                </h1>

                {/* MOCKUP CONTAINER */}
                <div className="relative w-full flex-1 flex justify-center items-center mt-[-40px]">

                    {/* LAPTOP MOCKUP - Lowered and Left-Aligned slightly */}
                    <div className="relative z-10 transform scale-90 translate-y-8 translate-x-[-40px]">
                        {/* Screen Frame */}
                        <div className="w-[700px] h-[450px] bg-black rounded-t-[24px] p-2 border-[4px] border-gray-800 shadow-2xl relative">
                            {/* Camera */}
                            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-700 rounded-full z-20"></div>

                            {/* Screen Display - FULL SCREEN USER IMAGE */}
                            <div className="w-full h-full bg-slate-100 rounded-t-[16px] overflow-hidden flex flex-col relative group">
                                <img
                                    src="/desktop_hero_v3.png"
                                    alt="Website Preview"
                                    className="w-full h-full object-fill"
                                />
                                {/* Glossy Reflection */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/10 pointer-events-none"></div>
                            </div>
                        </div>
                        {/* Keyboard Base */}
                        <div className="w-[840px] h-[30px] bg-gray-300 rounded-b-[30px] ml-[-70px] shadow-[0_20px_40px_rgba(0,0,0,0.3)] relative">
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[120px] h-[8px] bg-gray-400 rounded-b-lg"></div>
                        </div>
                    </div>

                    {/* PHONE MOCKUP - SPECIFIC USER IMAGE (mobile_hero_v2) */}
                    <div className="absolute z-20 right-[180px] bottom-[20px] transform scale-[0.6] hover:scale-[0.65] transition-transform origin-bottom-right drop-shadow-2xl">
                        <div className="w-[300px] h-[600px] bg-black rounded-[40px] border-[8px] border-gray-800 shadow-2xl overflow-hidden relative flex flex-col items-center justify-center">
                            {/* Notch */}
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-black rounded-b-xl z-30"></div>

                            {/* Screen - USER IMAGE */}
                            <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
                                <img
                                    src="/mobile_hero_v2.png"
                                    alt="Mobile Hero"
                                    className="w-full h-full object-fill"
                                />

                                {/* Glossy Reflection */}
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/5 pointer-events-none"></div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* BOTTOM CTA SECTION */}
                <div className="pb-16 text-center z-10 w-full flex flex-col items-center gap-6 mt-[-20px]">
                    <p className="text-gray-600 font-medium tracking-wide">
                        Explore the future of mobile technology. <br />
                        Designed for modern professionals.
                    </p>

                    <div className="bg-amber-500 text-black font-black text-2xl py-4 px-8 shadow-[4px_4px_0px_#000000] border-2 border-black transform -skew-x-6 uppercase tracking-wider">
                        Website In Bio
                    </div>

                    {/* FAKE INSTAGRAM STICKER */}
                    <div className="mt-4 bg-white text-blue-600 font-semibold text-xl py-3 px-8 rounded-full shadow-lg border border-gray-100 flex items-center gap-3 transform hover:scale-105 transition-transform cursor-pointer">
                        <span className="transform rotate-45 text-2xl">🔗</span>
                        Learn more
                    </div>
                </div>

                {/* WHATSAPP & WHISH CONTACT */}
                <div className="absolute bottom-6 right-8 z-30 font-semibold tracking-wider text-xl text-gray-800 text-right leading-relaxed" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    <p>Contact via whatsapp on: 76 982 454</p>
                    <p>Whish money: 81861811</p>
                </div>

            </div>
        </div>
    );
}

