import React from 'react';
import { Shield, AlertTriangle, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { ReferralUrgency } from '../types';

interface SeverityBadgeProps {
  grade: number;
  gradeName?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ grade, gradeName, size = 'md' }) => {
  const configs: Record<number, { bg: string; text: string; border: string; label: string; icon: any }> = {
    0: {
      bg: 'bg-emerald-500/15',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      label: 'Grade 0: No DR',
      icon: CheckCircle2,
    },
    1: {
      bg: 'bg-lime-500/15',
      text: 'text-lime-400',
      border: 'border-lime-500/30',
      label: 'Grade 1: Mild NPDR',
      icon: Shield,
    },
    2: {
      bg: 'bg-amber-500/15',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      label: 'Grade 2: Moderate NPDR',
      icon: AlertTriangle,
    },
    3: {
      bg: 'bg-orange-500/15',
      text: 'text-orange-400',
      border: 'border-orange-500/30',
      label: 'Grade 3: Severe NPDR',
      icon: AlertOctagon,
    },
    4: {
      bg: 'bg-rose-500/15',
      text: 'text-rose-400',
      border: 'border-rose-500/30',
      label: 'Grade 4: Proliferative DR',
      icon: AlertOctagon,
    },
  };

  const current = configs[grade] || configs[0];
  const Icon = current.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs space-x-1',
    md: 'px-2.5 py-1 text-xs sm:text-sm space-x-1.5',
    lg: 'px-4 py-2 text-base space-x-2 font-bold',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-lg border ${current.bg} ${current.text} ${current.border} ${sizeClasses}`}
    >
      <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'} />
      <span>{gradeName || current.label}</span>
    </span>
  );
};

export const UrgencyBadge: React.FC<{ urgency: ReferralUrgency }> = ({ urgency }) => {
  const configs: Record<ReferralUrgency, { bg: string; text: string; border: string; label: string }> = {
    ROUTINE: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/20',
      label: 'Routine Screening',
    },
    NON_URGENT: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/20',
      label: 'Referral (4-6 Wks)',
    },
    URGENT: {
      bg: 'bg-orange-500/10',
      text: 'text-orange-400',
      border: 'border-orange-500/20',
      label: 'Urgent Referral (1-2 Wks)',
    },
    CRITICAL: {
      bg: 'bg-rose-500/15',
      text: 'text-rose-400',
      border: 'border-rose-500/30',
      label: 'Emergency Referral (<72h)',
    },
    RETAKE: {
      bg: 'bg-slate-500/15',
      text: 'text-slate-400',
      border: 'border-slate-500/30',
      label: 'Retake Photo Required',
    },
  };

  const current = configs[urgency] || configs.ROUTINE;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded border ${current.bg} ${current.text} ${current.border}`}
    >
      {current.label}
    </span>
  );
};

