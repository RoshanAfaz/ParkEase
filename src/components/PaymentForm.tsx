import { useState } from 'react';
import Button from './Button';
import { Loader, CheckCircle, CreditCard, Smartphone } from 'lucide-react';
import { api } from '../lib/api';
import { formatIndianCurrency } from '../utils/indianFormat';

interface PaymentFormProps {
    amount: number;
    onSuccess: (paymentId: string) => void;
    onError: (error: string) => void;
}

export default function PaymentForm({ amount, onSuccess, onError }: PaymentFormProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<string>('upi');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsProcessing(true);

        try {
            const response = await api.processDummyPayment(amount, selectedMethod);
            if (response.success) {
                onSuccess(response.transaction_id);
            } else {
                onError(response.message || 'Payment failed');
            }
        } catch (error: any) {
            onError(error.message || 'Payment failed');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="text-sm text-slate-500 mb-1">Total Payable Amount</p>
                <p className="text-3xl font-bold text-slate-900">
                    {formatIndianCurrency(amount)}
                </p>
            </div>

            <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700">Select Payment Method</label>

                <div
                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${selectedMethod === 'upi' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
                    onClick={() => setSelectedMethod('upi')}
                >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center mr-3 ${selectedMethod === 'upi' ? 'border-blue-600' : 'border-slate-400'}`}>
                        {selectedMethod === 'upi' && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                    </div>
                    <Smartphone className="h-5 w-5 text-slate-600 mr-3" />
                    <div>
                        <p className="font-medium text-slate-900">UPI</p>
                        <p className="text-xs text-slate-500">Google Pay, PhonePe, Paytm</p>
                    </div>
                </div>

                <div
                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${selectedMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
                    onClick={() => setSelectedMethod('card')}
                >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center mr-3 ${selectedMethod === 'card' ? 'border-blue-600' : 'border-slate-400'}`}>
                        {selectedMethod === 'card' && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                    </div>
                    <CreditCard className="h-5 w-5 text-slate-600 mr-3" />
                    <div>
                        <p className="font-medium text-slate-900">Credit / Debit Card</p>
                        <p className="text-xs text-slate-500">Visa, Mastercard, RuPay</p>
                    </div>
                </div>
            </div>

            <Button
                type="submit"
                disabled={isProcessing}
                className="w-full"
                size="lg"
            >
                {isProcessing ? (
                    <>
                        <Loader className="animate-spin h-4 w-4 mr-2" />
                        Processing Payment...
                    </>
                ) : (
                    `Pay ${formatIndianCurrency(amount)}`
                )}
            </Button>

            <p className="text-xs text-center text-slate-500 flex items-center justify-center">
                <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                Secure Payment (Mock)
            </p>
        </form>
    );
}
