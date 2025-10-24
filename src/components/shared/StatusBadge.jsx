// fiberlux-tech/salesplantillafrontend/SalesPlantillaFrontend-64ed8b30ed6e79e4876344359d7698df855dbf56/src/components/shared/StatusBadge.jsx

import React from 'react';
import { Badge } from '@/components/ui/badge'; // Import centralized Badge component

function StatusBadge({ status }) {
    let variant = 'categoryUser'; // Default variant
    
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

    // Use the standardized Badge component with the derived variant
    return <Badge variant={variant}>{status}</Badge>;
}

export default StatusBadge;