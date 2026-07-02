import React from 'react';
import { colors } from '../theme';
import { ClockIcon, CheckCircleIcon, XCircleIcon } from '../components/Icons';
import { ServiceRequestStatus } from '../types/serviceRequest';

export interface StatusConfigItem {
  color: string;
  bgColor: string;
  label: string;
  icon: (size: number) => React.ReactElement;
  borderColor?: string;
  /** Hidden statuses are not shown in UI lists or filter chips */
  hidden?: boolean;
}

export const STATUS_CONFIG: Record<ServiceRequestStatus, StatusConfigItem> = {
  pending: {
    color: colors.accent.gold,
    bgColor: colors.accent.goldLight,
    borderColor: colors.accent.gold,
    label: 'Pending',
    icon: (size: number) => React.createElement(ClockIcon, { size, color: colors.accent.gold }),
  },
  accepted: {
    color: colors.accent.cyan,
    bgColor: colors.accent.cyanLight,
    borderColor: colors.accent.cyan,
    label: 'Accepted',
    icon: (size: number) => React.createElement(CheckCircleIcon, { size, color: colors.accent.cyan }),
  },
  in_progress: {
    color: colors.primary[600],
    bgColor: colors.primary[50],
    borderColor: colors.primary[500],
    label: 'In Progress',
    icon: (size: number) => React.createElement(ClockIcon, { size, color: colors.primary[600] }),
    hidden: true,
  },
  completed: {
    color: colors.success,
    bgColor: colors.successLight,
    borderColor: colors.success,
    label: 'Completed',
    icon: (size: number) => React.createElement(CheckCircleIcon, { size, color: colors.success }),
  },
  rejected: {
    color: colors.error,
    bgColor: colors.errorLight,
    borderColor: colors.error,
    label: 'Rejected',
    icon: (size: number) => React.createElement(XCircleIcon, { size, color: colors.error }),
    hidden: true,
  },
  cancelled: {
    color: colors.neutral[500],
    bgColor: colors.neutral[100],
    borderColor: colors.neutral[400],
    label: 'Cancelled',
    icon: (size: number) => React.createElement(XCircleIcon, { size, color: colors.neutral[500] }),
    hidden: true,
  },
};

export function getStatusBorderColor(status: ServiceRequestStatus) {
  return STATUS_CONFIG[status].borderColor || STATUS_CONFIG[status].color;
}
