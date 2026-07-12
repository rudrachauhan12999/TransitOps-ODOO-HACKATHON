import { Shipment } from './types';
import { exportToPDF } from './utils/pdfGenerator';

// Delegate to the new modular PDF generator with beautiful logistics layouts
export function printDocument(type: 'invoice' | 'lorry_receipt' | 'pod' | 'boarding_pass', shipment: Shipment) {
  let mappedType: 'invoice' | 'ticket' | 'receipt' | 'pod' = 'invoice';
  
  if (type === 'boarding_pass') {
    mappedType = 'ticket';
  } else if (type === 'lorry_receipt') {
    mappedType = 'receipt';
  } else if (type === 'pod') {
    mappedType = 'pod';
  } else {
    mappedType = 'invoice';
  }

  exportToPDF(mappedType, shipment);
}
