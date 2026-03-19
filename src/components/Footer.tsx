import React from 'react';

export const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-gray-200 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="md:flex md:items-center md:justify-between">
                    <div className="flex justify-center md:justify-start space-x-6">
                        <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
                            Privacy Policy
                        </a>
                        <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
                            Terms of Service
                        </a>
                        <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
                            Contact Support
                        </a>
                    </div>
                    <div className="mt-4 md:mt-0">
                        <p className="text-center text-sm text-gray-400">
                            &copy; {currentYear} Constituency Bursary System. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};
