import { Button } from "./Button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (newPage: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 border-t border-gray-200">
            <div className="flex flex-1 justify-between sm:hidden">
                <Button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                    variant="outline"
                >
                    Previous
                </Button>
                <Button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages}
                    variant="outline"
                >
                    Next
                </Button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Showing page <span className="font-medium">{page}</span> of{" "}
                        <span className="font-medium">{totalPages}</span>
                    </p>
                </div>
                <div>
                    <nav
                        className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                        aria-label="Pagination"
                    >
                        <button
                            onClick={() => onPageChange(page - 1)}
                            disabled={page === 1}
                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                        >
                            <span className="sr-only">Previous</span>
                            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => onPageChange(i + 1)}
                                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0 ${
                                    page === i + 1
                                        ? "z-10 bg-primary text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                                        : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => onPageChange(page + 1)}
                            disabled={page === totalPages}
                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                        >
                            <span className="sr-only">Next</span>
                            <ChevronRight className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
}
