import React from 'react';
import {
  Car,
  Fuel,
  Shield,
  Wrench,
  ParkingMeter,
  AlertCircle,
  Info,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';

interface VehicleOwnershipCardProps {
  carPrice: number;
  downPayment: number;
  loanAmount: number;
  monthlyEMI: number;
  monthlyInsurance: number;
  monthlyFuel: number;
  monthlyMaintenance: number;
  monthlyParkingTolls: number;
  onUpdateCarPrice: (val: number) => void;
  onUpdateDownPayment: (val: number) => void;
  onUpdateInsurance: (val: number) => void;
  onUpdateFuel: (val: number) => void;
  onUpdateMaintenance: (val: number) => void;
  onUpdateParkingTolls: (val: number) => void;
}

const inr = (n: number) =>
  `₹${Math.round(n).toLocaleString('en-IN')}`;

export const VehicleOwnershipCard: React.FC<VehicleOwnershipCardProps> = ({
  carPrice,
  downPayment,
  loanAmount,
  monthlyEMI,
  monthlyInsurance,
  monthlyFuel,
  monthlyMaintenance,
  monthlyParkingTolls,
  onUpdateCarPrice,
  onUpdateDownPayment,
  onUpdateInsurance,
  onUpdateFuel,
  onUpdateMaintenance,
  onUpdateParkingTolls,
}) => {
  const totalOperatingCosts = monthlyInsurance + monthlyFuel + monthlyMaintenance + monthlyParkingTolls;
  const totalMonthlyCostOfOwnership = monthlyEMI + totalOperatingCosts;

  return (
    <Card
      style={{
        padding: '1.75rem',
        background: '#FFFFFF',
        border: '1px solid var(--border-subtle)',
        boxShadow: '0 2px 10px rgba(20,35,28,0.05)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Car size={16} color="var(--color-primary)" />
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-primary)' }}>
              Vehicle Mode
            </span>
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
            ESTIMATED MONTHLY COST OF OWNERSHIP
          </h3>
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: 'var(--bg-surface-secondary)', border: '1px solid var(--border-subtle)', padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          <Info size={12} />
          <span>User-provided estimates</span>
        </div>
      </div>

      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
        A vehicle's true monthly commitment includes operating and maintenance costs in addition to your loan EMI.
      </p>

      {/* Vehicle Price & Down Payment Inputs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.25rem' }}>
            On-Road Car Price
          </label>
          <input
            type="number"
            value={carPrice}
            onChange={(e) => onUpdateCarPrice(Number(e.target.value))}
            className="input-text"
            placeholder="e.g. 10,00,000"
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', marginTop: '0.25rem', display: 'block', fontWeight: 500 }}>
            {inr(carPrice)}
          </span>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.25rem' }}>
            Down Payment (Upfront)
          </label>
          <input
            type="number"
            value={downPayment}
            onChange={(e) => onUpdateDownPayment(Number(e.target.value))}
            className="input-text"
            placeholder="e.g. 2,00,000"
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', display: 'block' }}>
            {carPrice > 0 ? `${((downPayment / carPrice) * 100).toFixed(0)}% of car price` : ''}
          </span>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.25rem' }}>
            Loan Amount (Principal)
          </label>
          <div style={{ padding: '0.625rem 0.875rem', background: 'var(--bg-surface-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>
            {inr(loanAmount)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', display: 'block' }}>
            Car Price - Down Payment
          </span>
        </div>
      </div>

      {/* Monthly Operating Expense Inputs */}
      <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
        Recurring Monthly Operating Costs (Estimates)
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#FFFFFF', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.375rem' }}>
            <Shield size={13} color="var(--color-primary)" />
            <span>Insurance / mo</span>
          </div>
          <input
            type="number"
            value={monthlyInsurance}
            onChange={(e) => onUpdateInsurance(Number(e.target.value))}
            className="input-text"
            style={{ fontSize: '0.875rem', padding: '0.4rem 0.6rem' }}
          />
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.375rem' }}>
            <Fuel size={13} color="var(--color-secondary)" />
            <span>Fuel / Energy</span>
          </div>
          <input
            type="number"
            value={monthlyFuel}
            onChange={(e) => onUpdateFuel(Number(e.target.value))}
            className="input-text"
            style={{ fontSize: '0.875rem', padding: '0.4rem 0.6rem' }}
          />
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.375rem' }}>
            <Wrench size={13} color="var(--color-tertiary)" />
            <span>Maintenance</span>
          </div>
          <input
            type="number"
            value={monthlyMaintenance}
            onChange={(e) => onUpdateMaintenance(Number(e.target.value))}
            className="input-text"
            style={{ fontSize: '0.875rem', padding: '0.4rem 0.6rem' }}
          />
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.375rem' }}>
            <ParkingMeter size={13} color="var(--color-text-muted)" />
            <span>Parking &amp; Tolls</span>
          </div>
          <input
            type="number"
            value={monthlyParkingTolls}
            onChange={(e) => onUpdateParkingTolls(Number(e.target.value))}
            className="input-text"
            style={{ fontSize: '0.875rem', padding: '0.4rem 0.6rem' }}
          />
        </div>
      </div>

      {/* Total Ownership Banner */}
      <div
        style={{
          background: 'var(--primary-subtle)',
          border: '1px solid var(--primary-border)',
          borderRadius: '12px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-primary)' }}>
            Total Estimated Monthly Cost of Ownership
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
            Vehicle Loan EMI ({inr(monthlyEMI)}) + Operating Costs ({inr(totalOperatingCosts)})
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>
            {inr(totalMonthlyCostOfOwnership)}
          </span>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}> / month</span>
        </div>
      </div>
    </Card>
  );
};
