// src/components/shared/StatusBadge.tsx
import React from 'react';
import { Badge, badgeVariants } from '@/components/ui/badge';
import type { VariantProps } from 'class-variance-authority'; // 1. Import VariantProps

// 2. Define the component props
interface StatusBadgeProps {
    status: "PENDING" | "APPROVED" | "REJECTED" | string; // Allow other strings
}

function StatusBadge({ status }: StatusBadgeProps) {
    // 3. Strongly type the 'variant' variable
    let variant: VariantProps<typeof badgeVariants>['variant'] = 'categoryUser';
    
    switch (status) {
        case 'PENDING':
            variant = 'statusPending';
            break;
        case 'APPROVED':
            variant = 'statusApproved';
            break;
        case 'REJECTED':
            variant = 'statusRejected';
            break;
        default:
            variant = 'categoryUser';
    }

    return <Badge variant={variant}>{status}</Badge>;
}

export default StatusBadge;