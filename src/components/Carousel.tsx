import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselSlide {
    id: number;
    studentName: string;
    studentId: string;
    amount: string;
    image: string;
    institution: string;
}

const slides: CarouselSlide[] = [
    {
        id: 1,
        studentName: 'Shiphira Wamaitha',
        studentId: '882910',
        amount: 'KES 50,000',
        image: '/images/image1.jpg',
        institution: 'University of Nairobi'
    },
    {
        id: 2,
        studentName: 'James Kipchoge',
        studentId: '882911',
        amount: 'KES 75,000',
        image: '/images/image2.jpg',
        institution: 'Kenyatta University'
    },
    {
        id: 3,
        studentName: 'Grace Mwangi',
        studentId: '882912',
        amount: 'KES 60,000',
        image: '/images/image3.jpg',
        institution: 'Mount Kenya University'
    },
    {
        id: 4,
        studentName: 'David Ochieng',
        studentId: '882913',
        amount: 'KES 55,000',
        image: '/images/image4.jpg',
        institution: 'Jomo Kenyatta University'
    },
    {
        id: 5,
        studentName: 'Sarah Njoroge',
        studentId: '882914',
        amount: 'KES 70,000',
        image: '/images/image5.jpg',
        institution: 'Strathmore University'
    },
    {
        id: 6,
        studentName: 'Michael Kariuki',
        studentId: '882915',
        amount: 'KES 65,000',
        image: '/images/image 6.jpg',
        institution: 'Nairobi City University'
    }
];

const Carousel: React.FC = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [autoPlay, setAutoPlay] = useState(true);

    useEffect(() => {
        if (!autoPlay) return;

        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [autoPlay]);

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
        setAutoPlay(false);
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setAutoPlay(false);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
        setAutoPlay(false);
    };

    const slide = slides[currentSlide];

    return (
        <div className="relative w-full h-full">
            {/* Carousel Container */}
            <div className="relative z-10 rounded-2xl shadow-2xl border border-gray-100 max-w-md mx-auto overflow-hidden group">
                <div className="relative w-full h-[500px] bg-gray-200">
                    {/* Image */}
                    <img
                        src={slide.image}
                        alt={slide.studentName}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="absolute -left-6 top-1/2 -translate-y-1/2 z-20">
                <button
                    onClick={prevSlide}
                    className="p-2 bg-white rounded-full shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all transform hover:scale-110 border border-gray-200"
                    aria-label="Previous slide"
                >
                    <ChevronLeft className="w-5 h-5 text-primary" />
                </button>
            </div>

            <div className="absolute -right-6 top-1/2 -translate-y-1/2 z-20">
                <button
                    onClick={nextSlide}
                    className="p-2 bg-white rounded-full shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all transform hover:scale-110 border border-gray-200"
                    aria-label="Next slide"
                >
                    <ChevronRight className="w-5 h-5 text-primary" />
                </button>
            </div>

            {/* Carousel Indicators */}
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`h-2.5 rounded-full transition-all duration-300 ${
                            index === currentSlide
                                ? 'bg-primary w-8'
                                : 'bg-gray-300 w-2.5 hover:bg-gray-400'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>

            {/* Slide Counter */}
            <div className="absolute -bottom-20 right-0 text-xs text-text-light font-medium">
                {currentSlide + 1} / {slides.length}
            </div>
        </div>
    );
};

export default Carousel;
