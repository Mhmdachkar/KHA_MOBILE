import { useState } from 'react';
import html2canvas from 'html2canvas';

export default function InstagramPromoLuxury() {
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        setDownloading(true);
        const element = document.getElementById('promo-content-luxury');
        if (element) {
            try {
                const canvas = await html2canvas(element, {
                    scale: 3, // High Res for ads
                    useCORS: true,
                    logging: false,
                    windowWidth: 1080,
                });

                const link = document.createElement('a');
                link.download = `KHA_MOBILE_Ad_Luxury_${new Date().toISOString().split('T')[0]}.png`;
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
        <div className="min-h-screen bg-red-950 flex flex-col justify-center items-center p-4 md:p-8 font-serif">

            {/* Controls */}
            <div className="fixed top-4 right-4 z-50 flex gap-2">
                <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="bg-white text-red-900 font-bold py-3 px-6 rounded-full shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border-2 border-gold-400"
                >
                    {downloading ? "Wrapping Gift..." : "Download Luxury Ad"}
                </button>
            </div>

            <p className="text-red-200 mb-6 text-center font-light uppercase tracking-widest font-sans">
                Holiday Campaign Generator
            </p>

            {/* AD CANVAS */}
            <div
                id="promo-content-luxury"
                className="relative width-[1080px] min-w-[1080px] max-w-[1080px] aspect-square shadow-2xl overflow-hidden text-white mx-auto flex flex-col"
                style={{
                    width: '1080px',
                    height: '1080px', // Square for Instagram Post
                    backgroundImage: 'url(/luxury_gift_bg.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                {/* Google Font Injection */}
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
                `}} />

                {/* Elegant Vignette */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 mix-blend-multiply"></div>

                {/* Content Container */}
                <div className="relative z-10 flex-1 flex flex-col justify-between p-16">

                    {/* TOP SECTION: Headline & Copy (Moved here to avoid products) */}
                    <div className="flex flex-col items-center text-center pt-8">
                        <div className="w-[1px] h-16 bg-gradient-to-b from-transparent to-yellow-400 mb-6"></div>

                        <h2 className="text-7xl text-white font-medium italic mb-4 drop-shadow-2xl leading-tight" style={{ fontFamily: '"Playfair Display", serif' }}>
                            Unwrap the <br />
                            <span className="text-yellow-400 not-italic" style={{ fontFamily: '"Cinzel", serif' }}>Exceptional</span>
                        </h2>

                        <p className="text-xl text-gray-200 font-light tracking-widest max-w-xl mx-auto border-t border-b border-white/20 py-4 mt-4 bg-black/30 backdrop-blur-sm">
                            THE ULTIMATE HOLIDAY GIFT COLLECTION
                        </p>
                    </div>

                    {/* BOTTOM SECTION: Branding & CTA (Anchors the page) */}
                    <div className="flex justify-between items-end pb-4">

                        {/* Left: Branding */}
                        <div className="flex flex-col items-start gap-4">
                            <img
                                src="/LOGO.png"
                                alt="KHA_MOBILE"
                                className="h-20 w-auto object-contain drop-shadow-lg"
                            />
                            <p className="text-white/80 font-bold tracking-[0.2em] text-sm uppercase pl-1 border-l-2 border-yellow-500">
                                Authorized Reseller
                            </p>
                        </div>

                        {/* Right: CTA Button */}
                        <div className="flex flex-col items-end gap-2">
                            <p className="text-yellow-400 font-serif italic text-lg mr-2">Available Now</p>
                            <div className="bg-white text-red-950 font-bold text-xl py-4 px-10 border border-white shadow-xl tracking-widest uppercase hover:bg-gray-100 transition-colors cursor-pointer">
                                Shop Gifts
                            </div>
                            <p className="text-xs text-gray-400 tracking-widest mt-2">KHAMOBILE.NETLIFY.APP</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
