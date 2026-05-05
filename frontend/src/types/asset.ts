export interface NetworkFields {
    deviceType: 'switch' | 'router' | 'ap' | 'firewall' | 'modem' | 'nvr' | 'other';
    hostname?: string;
    mgmtIp?: string;
    mac?: string;
    firmwareVersion?: string;
    snmpEnabled?: boolean;
    snmpVersion?: 'v2c' | 'v3';
    uplinkDeviceAssetId?: string | { _id: string; assetId: string, description: string, network?: { mgmtIp?: string } };
    uplinkPort?: string;
    vlans?: string[];
    notes?: string;
}

export interface Asset {
    _id: string;
    assetId: string;
    description: string;
    type: string;
    brand?: string;
    model?: string;
    serialNumber?: string;
    location?: string;
    acquisitionDate?: string;
    purchaseDate?: string;
    purchaseValue?: number;
    warrantyExpiration?: string;
    status: 'ativo' | 'em_manutencao' | 'disponivel' | 'descartado' | 'perdido';
    responsible?: {
        _id: string;
        name: string;
        email: string;
    };
    assignedTo?: {
        _id: string;
        name: string;
        email: string;
    };
    department?: string;
    lastMaintenanceDate?: string;
    nextMaintenanceDate?: string;
    maintenanceInterval?: number;
    notes?: string;
    customFields?: any;

    // New fields
    category: 'hardware' | 'software' | 'network';
    network?: NetworkFields;
    isActive: boolean;

    createdAt: string;
    updatedAt: string;
}
