import { useState } from 'react';
import html2canvas from 'html2canvas';

// Import the new composite bundle image
import bundleImage from '../assets/promo-bundle-bg.png';

export default function InstagramPromoIPadBundle() {
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        setDownloading(true);
        const element = document.getElementById('promo-content-ipad-bundle');
        if (element) {
            try {
                const canvas = await html2canvas(element, {
                    scale: 3, // High resolution
                    backgroundColor: '#ffffff',
                    useCORS: true,
                    logging: false,
                    windowWidth: 1080,
                });

                const link = document.createElement('a');
                link.download = `KHA_MOBILE_iPad_Bundle_Professional_${new Date().toISOString().split('T')[0]}.png`;
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
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 md:p-8 font-sans">

            {/* Control Panel */}
            <div className="fixed top-4 right-4 z-50 flex gap-2">
                <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="bg-black hover:bg-zinc-800 text-white font-bold py-3 px-6 rounded-full shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 flex items-center gap-2"
                >
                    {downloading ? "Generating..." : "Download High-Res Image"}
                </button>
            </div>

            <p className="text-gray-500 mb-8 font-medium">Preview Mode. Click "Download" to save.</p>

            {/* The Canvas Area - Exact 1080x1080 for Instagram */}
            <div
                id="promo-content-ipad-bundle"
                className="w-[1080px] h-[1080px] bg-white relative overflow-hidden flex flex-col shadow-2xl"
                style={{ width: '1080px', height: '1080px' }}
            >
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-gray-50 to-white z-0"></div>

                {/* Content Container - Adjusted padding for max width */}
                <div className="relative z-10 w-full h-full flex flex-col items-center justify-between py-12 px-8">

                    {/* Header */}
                    <div className="text-center w-full border-b border-gray-200 pb-6 shrink-0">
                        <img src="/LOGO.png" alt="Logo" className="h-14 mx-auto object-contain mb-4" />
                        <h2 className="text-5xl font-light text-gray-900 tracking-widest uppercase font-serif">Exclusive Offer</h2>
                    </div>

                    {/* Main Product Composition - Single Professional Image */}
                    {/* MAXIMIZED WIDTH: w-full and minimal padding to ensure it fits huge */}
                    <div className="flex-1 w-full flex items-center justify-center relative overflow-hidden">
                        <img
                            src={bundleImage}
                            alt="iPad Bundle Exclusive"
                            className="w-full h-full object-contain drop-shadow-2xl scale-110"
                        />
                    </div>

                    {/* Price & Footer */}
                    <div className="w-full flex justify-between items-end border-t border-gray-200 pt-8 pb-8 shrink-0">

                        <div className="text-left">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Bundle Price</p>
                            <div className="flex flex-col">
                                <span className="text-2xl text-gray-400 line-through font-light decoration-red-400/50 decoration-1">Was $450</span>
                                <div className="flex items-start -ml-1">
                                    <span className="text-4xl font-light text-gray-900 mt-2">$</span>
                                    <span className="text-8xl font-thin text-gray-900 leading-none tracking-tighter">385</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-right pb-2 space-y-3">
                            <div className="flex flex-col items-end gap-2">
                                <div className="flex items-center gap-3">
                                    <span className="h-[1px] w-8 bg-gray-300"></span>
                                    <span className="text-sm font-medium text-gray-500 uppercase tracking-widest">Limited Stock</span>
                                </div>
                                <div className="text-xs font-bold bg-black text-white px-5 py-2 rounded-full uppercase tracking-widest shadow-md">
                                    Full Bundle
                                </div>
                            </div>
                            <p className="text-lg font-bold text-gray-500 tracking-wide lowercase pt-1">khamobile.netlify.app</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
