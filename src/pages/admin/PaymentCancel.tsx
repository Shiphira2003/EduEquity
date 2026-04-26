import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { XCircle, RefreshCw } from 'lucide-react';

export default function PaymentCancel() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full text-center">
                <div className="p-8">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircle className="w-8 h-8 text-red-600" />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Payment Cancelled
                    </h1>

                    <p className="text-gray-600 mb-6">
                        The payment process was cancelled. No charges have been made to your account.
                        You can try again or return to the disbursements page.
                    </p>

                    <div className="space-y-3">
                        <Button
                            onClick={() => navigate('/admin/disbursements')}
                            className="w-full bg-primary text-white hover:bg-primary/90"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Try Again
                        </Button>

                        <Button
                            onClick={() => navigate('/admin/dashboard')}
                            variant="outline"
                            className="w-full"
                        >
                            Back to Dashboard
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}