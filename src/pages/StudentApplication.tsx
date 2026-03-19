import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createApplication } from "../api/applications.api";
import { useAuth } from "../context/AuthContext";

const StudentApplication = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [cycleYear, setCycleYear] = useState<number>(new Date().getFullYear() + 1);
    const [amountRequested, setAmountRequested] = useState<string>("");
    const [documents, setDocuments] = useState<FileList | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");

    if (!user || user.role !== "STUDENT") {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900">Access Denied</h2>
                    <p className="mt-2 text-gray-600">
                        This application page is restricted to registered <strong>Students</strong> only.
                    </p>
                    <div className="mt-6">
                        <button
                            onClick={() => navigate("/auth/login")}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Go to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setDocuments(e.target.files);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            if (!amountRequested || Number(amountRequested) <= 0) {
                throw new Error("Please enter a valid amount.");
            }
            if (!documents || documents.length === 0) {
                throw new Error("Please upload at least one document.");
            }

            const formData = new FormData();
            formData.append("cycle_year", cycleYear.toString());
            formData.append("amount_requested", amountRequested);

            Array.from(documents).forEach((file) => {
                formData.append("documents", file);
            });

            await createApplication(formData);
            await createApplication(formData);
            // alert("Application submitted successfully!"); // Removed alert
            navigate("/student/dashboard", {
                state: {
                    successMessage: "Application submitted successfully! Your application is now under review."
                }
            });
        } catch (err: any) {
            console.error("Submission error:", err);
            const msg = err.response?.data?.message || err.message || "Failed to submit application";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-3xl">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Apply for Funding
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Submit your application for the {cycleYear} cycle
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-3xl">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="rounded-md bg-red-50 p-4 border border-red-200">
                                <div className="flex">
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">
                                            Submission Failed
                                        </h3>
                                        <div className="mt-2 text-sm text-red-700">
                                            <p>{error}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <label htmlFor="cycle_year" className="block text-sm font-medium text-gray-700">
                                Cycle Year
                            </label>
                            <div className="mt-1">
                                <input
                                    id="cycle_year"
                                    name="cycle_year"
                                    type="number"
                                    required
                                    value={cycleYear}
                                    onChange={(e) => setCycleYear(Number(e.target.value))}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                                Amount Requested (KES)
                            </label>
                            <div className="mt-1">
                                <input
                                    id="amount"
                                    name="amount"
                                    type="number"
                                    required
                                    min="1"
                                    value={amountRequested}
                                    onChange={(e) => setAmountRequested(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Enter amount"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Required Documents
                            </label>
                            <div className="bg-blue-50 border border-blue-100 rounded-md p-3 mb-3">
                                <p className="text-xs text-blue-800 font-medium mb-1">Please ensure you upload:</p>
                                <ul className="text-xs text-blue-700 list-disc list-inside space-y-0.5">
                                    <li>National ID / Birth Certificate</li>
                                    <li>Student ID Card</li>
                                    <li>Current Fee Structure</li>
                                    <li>Admission Letter</li>
                                    <li>Transcript / Report Form</li>
                                </ul>
                            </div>

                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:bg-gray-50 transition-colors cursor-pointer text-center">
                                <div className="space-y-1 text-center w-full">
                                    <svg
                                        className="mx-auto h-12 w-12 text-gray-400"
                                        stroke="currentColor"
                                        fill="none"
                                        viewBox="0 0 48 48"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 005.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    <div className="flex text-sm text-gray-600 justify-center">
                                        <label
                                            htmlFor="file-upload"
                                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                                        >
                                            <span>Upload documents</span>
                                            <input
                                                id="file-upload"
                                                name="file-upload"
                                                type="file"
                                                className="sr-only"
                                                multiple
                                                onChange={handleFileChange}
                                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                            />
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-500">PDF, DOC, JPG up to 10MB</p>
                                    {documents && documents.length > 0 && (
                                        <div className="mt-2 text-left">
                                            <p className="text-xs font-semibold text-gray-700">Selected files:</p>
                                            <ul className="text-xs text-gray-500 list-disc list-inside">
                                                {Array.from(documents).map((file, idx) => (
                                                    <li key={idx}>{file.name}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? "opacity-75 cursor-not-allowed" : ""
                                    }`}
                            >
                                {loading ? "Submitting..." : "Submit Application"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default StudentApplication;
