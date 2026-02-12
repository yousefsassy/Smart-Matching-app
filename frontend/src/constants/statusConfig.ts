import React from 'react';
import { colors } from '../theme';
import { ClockIcon, CheckCircleIcon, XCircleIcon } from '../components/Icons';
import { ServiceRequestStatus } from '../types/serviceRequest';

export interface StatusConfigItem {
  color: string;
  bgColor: string;
  label: string;
  icon: (size: number) => React.ReactElement;
}

export const STATUS_CONFIG: Record<ServiceRequestStatus, StatusConfigItem> = {
  pending: {
    color: colors.accent.gold,
    bgColor: colors.accent.goldLight,
    label: 'Pending',
    icon: (size: number) => React.createElement(ClockIcon, { size, color: colors.accent.gold }),
  },
  accepted: {
    color: colors.accent.cyan,
    bgColor: colors.accent.cyanLight,
    label: 'Accepted',
    icon: (size: number) => React.createElement(CheckCircleIcon, { size, color: colors.accent.cyan }),
  },
  in_progress: {
    color: colors.primary[600],
    bgColor: colors.primary[50],
    label: 'In Progress',
    icon: (size: number) => React.createElement(ClockIcon, { size, color: colors.primary[600] }),
  },
  completed: {
    color: colors.success,
    bgColor: colors.successLight,
    label: 'Completed',
    icon: (size: number) => React.createElement(CheckCircleIcon, { size, color: colors.success }),
  },
  rejected: {
    color: colors.error,
    bgColor: colors.errorLight,
    label: 'Rejected',
    icon: (size: number) => React.createElement(XCircleIcon, { size, color: colors.error }),
  },
  cancelled: {
    color: colors.neutral[500],
    bgColor: colors.neutral[100],
    label: 'Cancelled',
    icon: (size: number) => React.createElement(XCircleIcon, { size, color: colors.neutral[500] }),
  },
};
