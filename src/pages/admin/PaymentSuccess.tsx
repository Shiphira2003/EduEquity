import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

export default function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const sessionId = searchParams.get('session_id');
    const isBulk = searchParams.get('bulk') === 'true';

    useEffect(() => {
        if (sessionId) {
            const verifyPayment = async () => {
                try {
                    await api.get(`/payments/verify/${sessionId}`);
                    console.log('✅ Payment verified and reconciled');
                } catch (err) {
                    console.error('❌ Verification failed:', err);
                }
            };
            verifyPayment();
        }
    }, [sessionId]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full text-center">
                <div className="p-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {isBulk ? 'Bulk Payment Successful!' : 'Payment Successful!'}
                    </h1>

                    <p className="text-gray-600 mb-6">
                        {isBulk
                            ? 'All completed disbursements have been processed successfully. The funds will be disbursed to the respective student accounts shortly.'
                            : 'Your bursary payment has been processed successfully. The funds will be disbursed to the student\'s account shortly.'
                        }
                    </p>

                    {sessionId && (
                        <div className="bg-gray-50 p-3 rounded-lg mb-6">
                            <p className="text-sm text-gray-500">
                                Session ID: {sessionId}
                            </p>
                        </div>
                    )}

                    <div className="space-y-3">
                        <Button
                            onClick={() => navigate('/admin/disbursements')}
                            className="w-full bg-primary text-white hover:bg-primary/90"
                        >
                            View Disbursements
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