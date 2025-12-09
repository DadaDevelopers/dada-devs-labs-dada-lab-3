import { Card } from "../../components/ui/card";
import { User, FileText, Calendar, CheckCircle, Clock, AlertCircle, Lock, Unlock } from "lucide-react";
import { Button } from "../../components/ui/button";

interface InvoiceCardProps {
  id: string;
  beneficiaryName: string;
  description: string;
  invoiceAmount: number; // in local currency (₦)
  amountRaised: number;
  status: 'active' | 'locked' | 'completed' | 'pending_verification';
  dueDate: string;
  createdAt: string;
  requiresConfirmation: boolean;
  providerConfirmed: boolean;
  beneficiaryConfirmed: boolean;
  documentsCount?: number;
  currency?: string;
}

export const InvoiceCard = ({
  id,
  beneficiaryName,
  description,
  invoiceAmount,
  amountRaised,
  status,
  dueDate,
  createdAt,
  requiresConfirmation,
  providerConfirmed,
  beneficiaryConfirmed,
  documentsCount = 0,
  currency = "₦"
}: InvoiceCardProps) => {
  const progressPercentage = Math.min((amountRaised / invoiceAmount) * 100, 100);
  
  // Status configuration
  const statusConfig = {
    active: {
      color: 'bg-green-100 text-green-700',
      icon: <Clock className="w-4 h-4" />,
      label: 'Active'
    },
    locked: {
      color: 'bg-yellow-100 text-yellow-700',
      icon: <Lock className="w-4 h-4" />,
      label: 'Locked'
    },
    completed: {
      color: 'bg-blue-100 text-blue-700',
      icon: <CheckCircle className="w-4 h-4" />,
      label: 'Completed'
    },
    pending_verification: {
      color: 'bg-orange-100 text-orange-700',
      icon: <AlertCircle className="w-4 h-4" />,
      label: 'Pending Verification'
    }
  };

  // Date formatting
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get status config
  const currentStatus = statusConfig[status];

  return (
    <Card className="overflow-hidden rounded-lg shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 bg-card text-card-foreground border border-border">
      {/* Header with Status Badge */}
      <div className="p-4 sm:p-6 border-b border-border">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-1 line-clamp-1">{beneficiaryName}</h3>
              <p className="text-xs text-muted-foreground">Invoice: {id}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${currentStatus.color}`}>
            {currentStatus.icon}
            {currentStatus.label}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-foreground/80 line-clamp-2 mb-4">{description}</p>

        {/* Dates */}
        <div className="flex gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Created: {formatDate(createdAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Due: {formatDate(dueDate)}</span>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="p-4 sm:p-6 border-b border-border">
        <div className="mb-3">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-semibold">
              {currency}{amountRaised.toLocaleString()} raised
            </span>
            <span className="text-muted-foreground">
              of {currency}{invoiceAmount.toLocaleString()}
            </span>
          </div>
          <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                status === 'completed' ? 'bg-green-500' : 
                status === 'locked' ? 'bg-yellow-500' : 
                'bg-primary'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>{Math.round(progressPercentage)}% funded</span>
            <span>{documentsCount} documents</span>
          </div>
        </div>

        {/* Dual Confirmation Status */}
        {requiresConfirmation && (
          <div className="mt-4 p-3 bg-secondary/30 rounded-lg">
            <p className="text-xs font-medium mb-2 text-center">Confirmation Status</p>
            <div className="flex gap-3">
              <div className={`flex-1 text-center p-2 rounded-lg ${
                providerConfirmed ? 'bg-green-500/20 border border-green-500/30' : 'bg-yellow-500/20 border border-yellow-500/30'
              }`}>
                <div className="flex items-center justify-center gap-1 mb-1">
                  {providerConfirmed ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Clock className="w-4 h-4 text-yellow-600" />
                  )}
                  <span className="text-xs font-medium">Provider</span>
                </div>
                <span className={`text-xs ${providerConfirmed ? 'text-green-600' : 'text-yellow-600'}`}>
                  {providerConfirmed ? 'Confirmed' : 'Pending'}
                </span>
              </div>
              
              <div className={`flex-1 text-center p-2 rounded-lg ${
                beneficiaryConfirmed ? 'bg-green-500/20 border border-green-500/30' : 'bg-yellow-500/20 border border-yellow-500/30'
              }`}>
                <div className="flex items-center justify-center gap-1 mb-1">
                  {beneficiaryConfirmed ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <User className="w-4 h-4 text-yellow-600" />
                  )}
                  <span className="text-xs font-medium">Beneficiary</span>
                </div>
                <span className={`text-xs ${beneficiaryConfirmed ? 'text-green-600' : 'text-yellow-600'}`}>
                  {beneficiaryConfirmed ? 'Confirmed' : 'Pending'}
                </span>
              </div>
            </div>
            
            {/* Action hint */}
            {status === 'locked' && !providerConfirmed && (
              <p className="text-xs text-center mt-2 text-yellow-600">
                Confirm readiness to unlock funds
              </p>
            )}
            {status === 'locked' && providerConfirmed && !beneficiaryConfirmed && (
              <p className="text-xs text-center mt-2 text-blue-600">
                Waiting for beneficiary confirmation
              </p>
            )}
            {providerConfirmed && beneficiaryConfirmed && (
              <p className="text-xs text-center mt-2 text-green-600">
                ✓ Funds ready for withdrawal
              </p>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            className="flex-1 rounded-full gap-2"
            onClick={() => console.log(`View details for ${id}`)}
          >
            <FileText className="w-4 h-4" />
            View Details
          </Button>
          
          {/* Conditional Actions */}
          {status === 'locked' && !providerConfirmed && (
            <Button 
              className="flex-1 rounded-full gap-2 btn-cta"
              onClick={() => console.log(`Confirm readiness for ${id}`)}
            >
              <CheckCircle className="w-4 h-4" />
              Confirm Readiness
            </Button>
          )}
          
          {status === 'completed' && (
            <Button 
              variant="secondary"
              className="flex-1 rounded-full gap-2"
              onClick={() => console.log(`View receipt for ${id}`)}
            >
              <Unlock className="w-4 h-4" />
              View Receipt
            </Button>
          )}
        </div>
        
        {/* Additional info for completed invoices */}
        {status === 'completed' && (
          <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center gap-2 text-xs text-green-700 dark:text-green-400">
              <CheckCircle className="w-3 h-3" />
              <span>Funds withdrawn on {formatDate(dueDate)}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};