import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageLightboxProps {
    images: string[];
    initialIndex: number;
    productName: string;
    isOpen: boolean;
    onClose: () => void;
}

const ImageLightbox = ({ images, initialIndex, productName, isOpen, onClose }: ImageLightboxProps) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    const handlePrevious = () => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowLeft') handlePrevious();
        if (e.key === 'ArrowRight') handleNext();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    onKeyDown={handleKeyDown}
                    tabIndex={0}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
                    style={{ touchAction: 'none' }}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-50 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-md border border-white/20"
                        aria-label="Close lightbox"
                        style={{ touchAction: 'manipulation' }}
                    >
                        <X className="h-6 w-6 text-white" />
                    </button>

                    {/* Image Counter */}
                    {images.length > 1 && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                            <span className="text-white text-sm font-medium">
                                {currentIndex + 1} / {images.length}
                            </span>
                        </div>
                    )}

                    {/* Main Image Container */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative max-w-7xl max-h-[90vh] w-full mx-4 flex items-center justify-center"
                    >
                        <img
                            src={images[currentIndex]}
                            alt={`${productName} - Image ${currentIndex + 1}`}
                            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                            style={{ touchAction: 'pan-y pinch-zoom' }}
                        />

                        {/* Zoom Indicator */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center gap-2">
                            <ZoomIn className="h-4 w-4 text-white" />
                            <span className="text-white text-xs">Pinch to zoom</span>
                        </div>
                    </motion.div>

                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handlePrevious();
                                }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-4 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-md border border-white/20"
                                aria-label="Previous image"
                                style={{ touchAction: 'manipulation' }}
                            >
                                <ChevronLeft className="h-6 w-6 text-white" />
                            </button>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleNext();
                                }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-4 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-md border border-white/20"
                                aria-label="Next image"
                                style={{ touchAction: 'manipulation' }}
                            >
                                <ChevronRight className="h-6 w-6 text-white" />
                            </button>
                        </>
                    )}

                    {/* Thumbnail Strip */}
                    {images.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex gap-2 px-4 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 max-w-[90vw] overflow-x-auto scrollbar-hide">
                            {images.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentIndex(index);
                                    }}
                                    className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${currentIndex === index
                                            ? 'border-white scale-110'
                                            : 'border-white/30 hover:border-white/60'
                                        }`}
                                    style={{ touchAction: 'manipulation' }}
                                >
                                    <img
                                        src={image}
                                        alt={`Thumbnail ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ImageLightbox;
