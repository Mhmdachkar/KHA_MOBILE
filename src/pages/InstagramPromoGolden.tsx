import { useState } from 'react';
import html2canvas from 'html2canvas';

export default function InstagramPromoGolden() {
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        setDownloading(true);
        const element = document.getElementById('promo-content-golden');
        if (element) {
            try {
                const canvas = await html2canvas(element, {
                    scale: 3, // High Res for ads
                    useCORS: true,
                    logging: false,
                    windowWidth: 1080,
                });

                const link = document.createElement('a');
                link.download = `KHA_MOBILE_Ad_Live_${new Date().toISOString().split('T')[0]}.png`;
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
        <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 md:p-8 font-serif">

            {/* Controls */}
            <div className="fixed top-4 right-4 z-50 flex gap-2">
                <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="bg-gradient-to-r from-amber-400 to-amber-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {downloading ? "Freezing Time..." : "Download Launch Ad"}
                </button>
            </div>

            <p className="text-gray-500 mb-6 text-center font-light uppercase tracking-widest font-sans">
                "Golden Snow" Campaign Generator
            </p>

            {/* AD CANVAS */}
            <div
                id="promo-content-golden"
                className="relative width-[1080px] min-w-[1080px] max-w-[1080px] aspect-square shadow-2xl overflow-hidden text-gray-900 mx-auto flex flex-col justify-center items-center"
                style={{
                    width: '1080px',
                    height: '1080px', // Square for Instagram Post
                    backgroundImage: 'url(/golden_snow_bg.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                {/* Google Font Injection */}
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
                `}} />

                {/* Soft White Overlay for Readability */}
                <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-white/20"></div>

                {/* MAIN CONTENT */}
                <div className="relative z-10 w-full h-full flex flex-col items-center justify-between py-20">

                    {/* TOP HEADER: "WE ARE LIVE" */}
                    <div className="text-center drop-shadow-2xl">
                        <p className="text-amber-600 font-bold tracking-[0.5em] uppercase text-xl mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
                            Official Launch
                        </p>
                        <h1 className="text-8xl text-transparent bg-clip-text bg-gradient-to-b from-amber-500 to-amber-700 font-black tracking-widest leading-none drop-shadow-sm" style={{ fontFamily: 'Cinzel, serif', textShadow: '0px 4px 10px rgba(255,255,255,0.8)' }}>
                            WE ARE <br />
                            <span className="text-9xl text-amber-600">LIVE</span>
                        </h1>
                    </div>

                    {/* CENTER: PHONE MOCKUP WITH WEBSITE */}
                    <div className="relative group perspective-1000">
                        {/* Shadow/Glow behind phone */}
                        <div className="absolute inset-0 bg-amber-400 blur-3xl opacity-20 rounded-full scale-125 group-hover:opacity-30 transition-opacity"></div>

                        {/* Phone Body */}
                        <div className="relative w-[380px] h-[780px] bg-gray-900 rounded-[50px] border-[8px] border-gray-300 shadow-2xl overflow-hidden transform rotate-[-5deg] hover:rotate-0 transition-all duration-700 ease-out border-t-[10px] border-b-[10px]">
                            {/* Inner Bezel */}
                            <div className="absolute inset-0 border-[4px] border-black rounded-[42px] pointer-events-none z-20"></div>

                            {/* Dynamic Island / Notch */}
                            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-black rounded-full z-30"></div>

                            {/* Screen Content (The "Website") */}
                            <div className="w-full h-full bg-white flex flex-col">
                                {/* Navbar Simulation */}
                                <div className="h-16 bg-black flex items-center justify-between px-6 pt-6">
                                    <div className="w-6 h-6 text-white text-xl">☰</div>
                                    <img src="/LOGO.png" className="h-6 w-auto brightness-0 invert" alt="Logo" />
                                    <div className="w-6 h-6 text-white text-xl">🛒</div>
                                </div>

                                {/* Hero Section Simulation */}
                                <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-200 relative overflow-hidden flex flex-col items-center justify-center p-6 text-center">
                                    <p className="text-amber-600 tracking-[0.3em] text-xs font-bold mb-4 uppercase">Premium Technology</p>
                                    <h2 className="text-4xl font-serif text-black mb-4 leading-tight">
                                        Elegance <br /> Meets <br /> Innovation
                                    </h2>
                                    <div className="w-24 h-1 bg-black mb-6"></div>
                                    <div className="px-6 py-3 bg-black text-white rounded-full text-sm font-bold uppercase tracking-wider">
                                        Shop Now
                                    </div>

                                    {/* Product Hint in BG */}
                                    {/* <div className="absolute bottom-[-50px] opacity-10 font-black text-9xl text-black select-none">KHA</div> */}
                                </div>

                                {/* Product Grid Simulation */}
                                <div className="h-48 bg-white grid grid-cols-2 gap-2 p-2">
                                    <div className="bg-gray-100 rounded-xl flex items-center justify-center"><span className="text-2xl">📱</span></div>
                                    <div className="bg-gray-100 rounded-xl flex items-center justify-center"><span className="text-2xl">⌚</span></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FOOTER: WEBSITE URL */}
                    <div className="mt-8 bg-white/80 backdrop-blur-md px-12 py-4 rounded-full shadow-lg border border-white/50">
                        <p className="text-2xl font-bold text-gray-800 tracking-widest uppercase" style={{ fontFamily: 'Cinzel, serif' }}>
                            KHAMOBILE.NETLIFY.APP
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}
