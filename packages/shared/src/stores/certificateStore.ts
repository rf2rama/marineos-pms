import { create } from 'zustand';
import { VesselCertificate, CertificateStatus } from '../types';
import { useNotificationStore } from './notificationStore';

interface CertificateState {
  certificates: VesselCertificate[];
  
  // Actions
  addCertificate: (cert: Omit<VesselCertificate, 'status'>) => void;
  updateCertificate: (id: string, updates: Partial<Omit<VesselCertificate, 'id' | 'status'>>) => void;
  deleteCertificate: (id: string) => void;
  
  // Logic
  checkExpirations: () => void;
}

// Helper to determine status based on date
const calculateStatus = (expiryDate: Date): CertificateStatus => {
  const now = new Date();
  const diffTime = expiryDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'Expired';
  if (diffDays <= 60) return 'Expiring Soon'; // 60 days warning threshold
  return 'Valid';
};

const INITIAL_CERTIFICATES: VesselCertificate[] = [
  {
    id: 'cert-1',
    vesselId: 'vessel-1',
    vesselName: 'MV Pacific Star',
    certificateName: 'Cargo Ship Safety Construction Certificate',
    certificateNumber: 'CSSC-2023-001',
    issuingAuthority: 'DNV',
    issueDate: new Date('2023-01-15'),
    expiryDate: new Date('2028-01-14'),
    status: 'Valid',
  },
  {
    id: 'cert-2',
    vesselId: 'vessel-1',
    vesselName: 'MV Pacific Star',
    certificateName: 'International Oil Pollution Prevention (IOPP)',
    certificateNumber: 'IOPP-2021-098',
    issuingAuthority: 'BKI',
    issueDate: new Date('2021-08-01'),
    expiryDate: new Date('2026-07-30'), // Expiring soon if today is July 2026
    status: 'Expiring Soon',
  }
];

// Ensure initial statuses are actually correct based on current date
const processedInitial = INITIAL_CERTIFICATES.map(c => ({
  ...c,
  status: calculateStatus(c.expiryDate)
}));

export const useCertificateStore = create<CertificateState>((set, get) => ({
  certificates: processedInitial,
  
  addCertificate: (certData) => {
    const newCert: VesselCertificate = {
      ...certData,
      status: calculateStatus(certData.expiryDate)
    };
    
    set((state) => ({
      certificates: [...state.certificates, newCert]
    }));
    
    get().checkExpirations();
  },
  
  updateCertificate: (id, updates) => {
    set((state) => {
      const updatedCerts = state.certificates.map(cert => {
        if (cert.id === id) {
          const newCert = { ...cert, ...updates };
          newCert.status = calculateStatus(newCert.expiryDate);
          return newCert;
        }
        return cert;
      });
      return { certificates: updatedCerts };
    });
    
    get().checkExpirations();
  },
  
  deleteCertificate: (id) => {
    set((state) => ({
      certificates: state.certificates.filter(c => c.id !== id)
    }));
  },
  
  checkExpirations: () => {
    const { addNotification } = useNotificationStore.getState();
    const currentCerts = get().certificates;
    
    let stateChanged = false;
    const updatedCerts = currentCerts.map(cert => {
      const newStatus = calculateStatus(cert.expiryDate);
      
      if (newStatus !== cert.status) {
        stateChanged = true;
        
        // If it transitioned to Expiring Soon or Expired, trigger notification
        if (newStatus === 'Expiring Soon') {
          addNotification({
            id: crypto.randomUUID(),
            title: `Certificate Expiring Soon`,
            message: `${cert.certificateName} for ${cert.vesselName || 'Vessel'} expires on ${cert.expiryDate.toISOString().split('T')[0]}.`,
            type: 'expiring',
            userId: 'system',
            isRead: false,
            createdAt: new Date().toISOString(),
          });
        } else if (newStatus === 'Expired') {
          addNotification({
            id: crypto.randomUUID(),
            title: `Certificate EXPIRED!`,
            message: `URGENT: ${cert.certificateName} for ${cert.vesselName || 'Vessel'} has expired as of ${cert.expiryDate.toISOString().split('T')[0]}.`,
            type: 'overdue',
            userId: 'system',
            isRead: false,
            createdAt: new Date().toISOString(),
          });
        }
        
        return { ...cert, status: newStatus };
      }
      return cert;
    });
    
    if (stateChanged) {
      set({ certificates: updatedCerts });
    }
  }
}));
