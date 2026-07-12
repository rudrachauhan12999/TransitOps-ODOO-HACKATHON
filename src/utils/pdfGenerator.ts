import { Shipment, Vehicle, Driver, Trip } from '../types';

// Simple helper to compile a structured address into a clean printable string
function formatAddress(addr: any): string {
  if (!addr) return 'Not Provided';
  if (typeof addr === 'string') return addr;
  const parts = [
    addr.line1,
    addr.line2,
    addr.landmark ? `Near ${addr.landmark}` : '',
    addr.area,
    addr.city,
    addr.state,
    addr.pinCode,
    addr.country
  ];
  return parts.filter(p => p && p.trim() !== '').join(', ');
}

export function exportToPDF(type: 'invoice' | 'ticket' | 'receipt' | 'pod' | 'fleet' | 'drivers' | 'trips', data: any) {
  const printWindow = window.open('', '_blank', 'width=900,height=1000');
  if (!printWindow) {
    alert('Please allow popups to export documents.');
    return;
  }

  let title = 'CarryOn Document';
  let content = '';

  const timestamp = new Date().toLocaleString();

  switch (type) {
    case 'invoice': {
      const s = data as Shipment;
      title = `Invoice_${s.shipmentId}`;
      const baseCost = s.cargoWeight * 1.5;
      const tax = baseCost * 0.18;
      const total = baseCost + tax;
      content = `
        <div class="invoice-container">
          <div class="header">
            <div>
              <h1 class="brand">Carry<span class="red">On</span></h1>
              <p class="subtitle">ENTERPRISE LOGISTICS INVOICE</p>
            </div>
            <div class="meta-right">
              <h2>INVOICE</h2>
              <p><b>Invoice No:</b> ${s.invoiceId || `INV-${s.shipmentId}`}</p>
              <p><b>Date:</b> ${new Date(s.creationDate || Date.now()).toLocaleDateString()}</p>
              <p><b>Status:</b> PAID</p>
            </div>
          </div>

          <div class="divider"></div>

          <div class="address-grid">
            <div class="address-box">
              <h3>CONSIGNOR (BILL TO)</h3>
              <p><b>Client Name:</b> ${s.customerName}</p>
              <p><b>Contact Info:</b> client@carryon.in</p>
              <p><b>Carrier Node:</b> CARRYON IND-WEST NODE</p>
            </div>
            <div class="address-box">
              <h3>DELIVERY DETAILS</h3>
              <p><b>SLA Class:</b> ${s.priority.toUpperCase()} PRIORITY</p>
              <p><b>Vehicle Reg:</b> ${s.vehicleNumber || 'Pending Assignment'}</p>
              <p><b>Assigned Operator:</b> ${s.driverName || 'Pending Operator'}</p>
            </div>
          </div>

          <div class="address-grid mt-4">
            <div class="address-box">
              <h3>PICKUP LOCATION</h3>
              <p>${formatAddress(s.sourceAddress) || s.source}</p>
            </div>
            <div class="address-box">
              <h3>DESTINATION LOCATION</h3>
              <p>${formatAddress(s.destinationAddress) || s.destination}</p>
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>DESCRIPTION</th>
                <th class="right">WEIGHT (KG)</th>
                <th class="right">RATE / KG</th>
                <th class="right">AMOUNT (INR)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <b>Freight Carriage Charges</b><br>
                  <small>Interstate commercial shipment transport - Priority: ${s.priority}</small>
                </td>
                <td class="right">${s.cargoWeight.toLocaleString()} kg</td>
                <td class="right">₹1.50</td>
                <td class="right">₹${baseCost.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="3" class="right font-bold">Subtotal:</td>
                <td class="right">₹${baseCost.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="3" class="right font-bold">GST (18%):</td>
                <td class="right">₹${tax.toFixed(2)}</td>
              </tr>
              <tr class="grand-total">
                <td colspan="3" class="right font-bold">Grand Total (Inclusive of Taxes):</td>
                <td class="right">₹${total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            <p><b>Terms & Conditions:</b> Subject to Gujarat & Maharashtra logistics board rules. Payment terms strictly net-0. This is an electronically generated document and requires no physical signature.</p>
            <p class="brand-footer">CarryOn - Seamless Freight Logistics Operations platform</p>
          </div>
        </div>
      `;
      break;
    }
    case 'ticket': {
      const s = data as Shipment;
      title = `Ticket_${s.shipmentId}`;
      content = `
        <div class="ticket-container">
          <div class="header" style="border-bottom: 2px dashed #E74C3C; padding-bottom: 15px;">
            <div>
              <h1 class="brand">Carry<span class="red">On</span></h1>
              <p class="subtitle">CARGO BOARDING PASS & TICKET</p>
            </div>
            <div class="meta-right">
              <span class="badge ${s.priority.toLowerCase()}">${s.priority.toUpperCase()} PRIORITY</span>
              <p class="mt-2"><b>Pass ID:</b> ${s.shipmentId}</p>
            </div>
          </div>

          <div class="ticket-grid">
            <div class="ticket-col">
              <span class="label">CONSIGNOR CLIENT</span>
              <span class="value">${s.customerName}</span>

              <span class="label mt-3">PICKUP ORIGIN</span>
              <span class="value">${formatAddress(s.sourceAddress) || s.source}</span>

              <span class="label mt-3">CARGO WEIGHT</span>
              <span class="value font-bold">${s.cargoWeight.toLocaleString()} KG</span>
            </div>
            <div class="ticket-col">
              <span class="label">ASSIGNED TRANSPORTER</span>
              <span class="value">${s.vehicleNumber || 'Unassigned'}</span>

              <span class="label mt-3">DELIVERY TERMINAL</span>
              <span class="value">${formatAddress(s.destinationAddress) || s.destination}</span>

              <span class="label mt-3">EXPECTED ETA</span>
              <span class="value font-bold text-red">${s.eta}</span>
            </div>
          </div>

          <div class="barcode-box">
            <div class="barcode">||||||||||||||| ${s.shipmentId} |||||||||||||||</div>
            <p>Scan for instant terminal verification & gate pass control</p>
          </div>

          <div class="footer">
            <p>Generated via CarryOn Operations Cloud at ${timestamp}</p>
          </div>
        </div>
      `;
      break;
    }
    case 'receipt': {
      const s = data as Shipment;
      title = `LorryReceipt_${s.shipmentId}`;
      content = `
        <div class="receipt-container">
          <div class="header">
            <div>
              <h1 class="brand">Carry<span class="red">On</span></h1>
              <p class="subtitle">CONSIGNMENT NOTE (LORRY RECEIPT)</p>
            </div>
            <div class="meta-right">
              <h2 class="text-red">LORRY RECEIPT</h2>
              <p><b>LR Number:</b> ${s.lorryReceiptId || `LR-${s.shipmentId}`}</p>
              <p><b>Date:</b> ${new Date(s.creationDate || Date.now()).toLocaleDateString()}</p>
            </div>
          </div>

          <div class="divider"></div>

          <div class="address-grid">
            <div class="address-box">
              <h3>CONSIGNOR (SENDER)</h3>
              <p><b>Company:</b> ${s.customerName}</p>
              <p><b>Address:</b> ${formatAddress(s.sourceAddress) || s.source}</p>
            </div>
            <div class="address-box">
              <h3>CONSIGNEE (RECEIVER)</h3>
              <p><b>Company:</b> Central Consignee Warehouse</p>
              <p><b>Address:</b> ${formatAddress(s.destinationAddress) || s.destination}</p>
            </div>
          </div>

          <div class="address-grid mt-4">
            <div class="address-box">
              <h3>VEHICLE & DRIVER</h3>
              <p><b>Lorry Number:</b> ${s.vehicleNumber || 'Pending Dispatch'}</p>
              <p><b>Driver Partner:</b> ${s.driverName || 'Pending Assignment'}</p>
            </div>
            <div class="address-box">
              <h3>GOODS DESCRIPTION</h3>
              <p><b>Type of Goods:</b> Commercial Freight</p>
              <p><b>Chargeable Weight:</b> ${s.cargoWeight.toLocaleString()} kg</p>
            </div>
          </div>

          <div class="signatures-grid">
            <div class="sig-box">
              <div class="sig-line"></div>
              <p>Consignor Signature</p>
            </div>
            <div class="sig-box">
              <div class="sig-line"></div>
              <p>Lorry Driver Signature</p>
            </div>
            <div class="sig-box">
              <div class="sig-line"></div>
              <p>Authorized Dispatch Officer</p>
            </div>
          </div>

          <div class="footer">
            <p><b>Transporter Declaration:</b> The consignment mentioned above is received in good condition subject to conditions printed on the back. Safe delivery guaranteed within SLA boundaries.</p>
          </div>
        </div>
      `;
      break;
    }
    case 'pod': {
      const s = data as Shipment;
      title = `POD_${s.shipmentId}`;
      content = `
        <div class="pod-container">
          <div class="header">
            <div>
              <h1 class="brand">Carry<span class="red">On</span></h1>
              <p class="subtitle">PROOF OF DELIVERY (POD)</p>
            </div>
            <div class="meta-right">
              <h2>POD DOCUMENT</h2>
              <p><b>POD ID:</b> ${s.podId || `POD-${s.shipmentId}`}</p>
              <p><b>Delivered On:</b> ${s.eta}</p>
            </div>
          </div>

          <div class="divider"></div>

          <div class="ticket-grid">
            <div class="ticket-col">
              <h3>SHIPMENT DETAILS</h3>
              <p><b>Consignment ID:</b> ${s.shipmentId}</p>
              <p><b>Client Company:</b> ${s.customerName}</p>
              <p><b>Cargo Weight:</b> ${s.cargoWeight.toLocaleString()} kg</p>
              <p><b>Route Taken:</b> ${s.source.split(',')[0]} &rarr; ${s.destination.split(',')[0]}</p>
            </div>
            <div class="ticket-col">
              <h3>DELIVERY ATTRIBUTION</h3>
              <p><b>Vehicle Reg:</b> ${s.vehicleNumber || 'Unassigned'}</p>
              <p><b>Executing Driver:</b> ${s.driverName || 'Unassigned'}</p>
              <p><b>Status:</b> DELIVERED & CLOSED</p>
              <p><b>SLA Target:</b> MET (Excellent)</p>
            </div>
          </div>

          <div class="checklist-box">
            <h3>DELIVERY QUALITY CHECKLIST</h3>
            <div class="chk-row"><span>&#10003;</span> Cargo Seal intact and verified upon arrival</div>
            <div class="chk-row"><span>&#10003;</span> Structural cargo physical examination passed (no damages)</div>
            <div class="chk-row"><span>&#10003;</span> Weight verification match (chargeable vs actual weight)</div>
            <div class="chk-row"><span>&#10003;</span> Transit timestamps logged in operations center</div>
          </div>

          <div class="signatures-grid" style="margin-top: 50px;">
            <div class="sig-box">
              <div class="sig-line"></div>
              <p>Receiving Manager Signature</p>
            </div>
            <div class="sig-box">
              <div class="sig-line"></div>
              <p>Executing Driver Partner</p>
            </div>
          </div>

          <div class="footer">
            <p>Proof of Delivery certified electronically via CarryOn secure node network. Timestamp: ${timestamp}</p>
          </div>
        </div>
      `;
      break;
    }
    case 'fleet': {
      const vehicles = data as Vehicle[];
      title = `Fleet_Report`;
      content = `
        <div class="report-container">
          <div class="header">
            <div>
              <h1 class="brand">Carry<span class="red">On</span></h1>
              <p class="subtitle">SYSTEM OPERATIONS: FLEET UTILIZATION REPORT</p>
            </div>
            <div class="meta-right">
              <h2>FLEET SUMMARIES</h2>
              <p><b>Total Vehicles:</b> ${vehicles.length}</p>
              <p><b>Report Date:</b> ${timestamp}</p>
            </div>
          </div>

          <div class="divider"></div>

          <table class="report-table">
            <thead>
              <tr>
                <th>VEHICLE / REGISTRATION</th>
                <th>TYPE</th>
                <th>ODOMETER (KM)</th>
                <th>FUEL SYSTEM</th>
                <th>LOCATION</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              ${vehicles.map(v => `
                <tr>
                  <td><b>${v.name}</b><br><small class="font-mono">${v.registrationNumber}</small></td>
                  <td>${v.type}</td>
                  <td>${v.odometer.toLocaleString()} km</td>
                  <td>${v.fuelType} (${v.fuelEfficiency} km/L)</td>
                  <td>${v.location}</td>
                  <td><span class="status-pill ${v.status.toLowerCase()}">${v.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer" style="margin-top: 40px;">
            <p>CarryOn Automated Fleet Report &bull; Logistics Terminal Node Operations</p>
          </div>
        </div>
      `;
      break;
    }
    case 'drivers': {
      const drivers = data as Driver[];
      title = `Drivers_Report`;
      content = `
        <div class="report-container">
          <div class="header">
            <div>
              <h1 class="brand">Carry<span class="red">On</span></h1>
              <p class="subtitle">SYSTEM OPERATIONS: DRIVER PERFORMANCE REPORT</p>
            </div>
            <div class="meta-right">
              <h2>DRIVER PROFILE DATA</h2>
              <p><b>Total Drivers:</b> ${drivers.length}</p>
              <p><b>Report Date:</b> ${timestamp}</p>
            </div>
          </div>

          <div class="divider"></div>

          <table class="report-table">
            <thead>
              <tr>
                <th>OPERATOR NAME</th>
                <th>LICENSE NUMBER</th>
                <th>LICENSE CATEGORY</th>
                <th>LICENSE EXPIRY</th>
                <th>SAFETY SCORE</th>
                <th>DUTY STATUS</th>
              </tr>
            </thead>
            <tbody>
              ${drivers.map(d => `
                <tr>
                  <td><b>${d.name}</b><br><small>${d.contactNumber}</small></td>
                  <td class="font-mono">${d.licenseNumber}</td>
                  <td>${d.licenseCategory}</td>
                  <td>${d.licenseExpiryDate}</td>
                  <td class="font-bold text-red">${d.safetyScore} / 100</td>
                  <td><span class="status-pill ${d.status.toLowerCase().replace(' ', '')}">${d.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer" style="margin-top: 40px;">
            <p>CarryOn Secure Operator Logs &bull; Dispatch System Core</p>
          </div>
        </div>
      `;
      break;
    }
    case 'trips': {
      const trips = data as Trip[];
      title = `Trips_Report`;
      content = `
        <div class="report-container">
          <div class="header">
            <div>
              <h1 class="brand">Carry<span class="red">On</span></h1>
              <p class="subtitle">SYSTEM OPERATIONS: TRIP ANALYSIS REPORT</p>
            </div>
            <div class="meta-right">
              <h2>TRIP AUDITS</h2>
              <p><b>Total Trips Logged:</b> ${trips.length}</p>
              <p><b>Report Date:</b> ${timestamp}</p>
            </div>
          </div>

          <div class="divider"></div>

          <table class="report-table">
            <thead>
              <tr>
                <th>TRIP ID</th>
                <th>ROUTE SEGMENT</th>
                <th>CARGO WEIGHT</th>
                <th>PLANNED DIS.</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              ${trips.map(t => `
                <tr>
                  <td class="font-mono"><b>${t.tripId}</b></td>
                  <td>${t.source} &rarr; ${t.destination}</td>
                  <td>${t.cargoWeight.toLocaleString()} kg</td>
                  <td>${t.plannedDistance} km</td>
                  <td><span class="status-pill ${t.status.toLowerCase()}">${t.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer" style="margin-top: 40px;">
            <p>CarryOn Consolidated Trip Journal &bull; Indian Highway Logistics</p>
          </div>
        </div>
      `;
      break;
    }
  }

  // HTML layout and styling for highly professional PDF exports
  printWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
          
          body {
            font-family: 'Inter', sans-serif;
            color: #2C3E50;
            background-color: #FFFFFF;
            padding: 30px;
            margin: 0;
            font-size: 13px;
            line-height: 1.5;
          }

          .invoice-container, .ticket-container, .receipt-container, .pod-container, .report-container {
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #E2E8F0;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }

          .brand {
            font-size: 28px;
            font-weight: 800;
            color: #2D3748;
            margin: 0;
            letter-spacing: -1px;
          }

          .brand .red {
            color: #E74C3C;
          }

          .subtitle {
            font-size: 10px;
            font-family: 'JetBrains Mono', monospace;
            color: #718096;
            margin: 5px 0 0 0;
            letter-spacing: 2px;
            font-weight: 700;
          }

          .meta-right {
            text-align: right;
          }

          .meta-right h2 {
            font-size: 20px;
            margin: 0 0 8px 0;
            font-weight: 800;
            color: #1A202C;
          }

          .meta-right p {
            margin: 3px 0;
            color: #4A5568;
          }

          .divider {
            height: 2px;
            background-color: #F7FAFC;
            border-bottom: 1px solid #E2E8F0;
            margin: 25px 0;
          }

          .address-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }

          .address-box {
            background-color: #F8FAFC;
            border: 1px solid #EDF2F7;
            padding: 15px;
            border-radius: 8px;
          }

          .address-box h3 {
            font-size: 11px;
            font-weight: 800;
            color: #E74C3C;
            margin: 0 0 8px 0;
            letter-spacing: 1px;
            font-family: 'JetBrains Mono', monospace;
          }

          .address-box p {
            margin: 4px 0;
            color: #4A5568;
          }

          .items-table, .report-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 30px;
          }

          .items-table th, .report-table th {
            background-color: #F8FAFC;
            border-bottom: 2px solid #E2E8F0;
            text-align: left;
            padding: 12px;
            font-size: 11px;
            font-weight: 800;
            color: #4A5568;
            font-family: 'JetBrains Mono', monospace;
          }

          .items-table td, .report-table td {
            padding: 12px;
            border-bottom: 1px solid #EDF2F7;
            color: #4A5568;
          }

          .right {
            text-align: right;
          }

          .font-bold {
            font-weight: 700;
          }

          .grand-total {
            background-color: #FFF5F5;
            font-size: 15px;
            font-weight: 800;
          }

          .grand-total td {
            border-bottom: 2px solid #E74C3C;
            color: #E74C3C;
          }

          .ticket-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-top: 25px;
          }

          .ticket-col {
            display: flex;
            flex-direction: column;
          }

          .ticket-col h3 {
            font-size: 11px;
            font-weight: 800;
            color: #E74C3C;
            margin: 0 0 10px 0;
            font-family: 'JetBrains Mono', monospace;
            border-bottom: 1px solid #EDF2F7;
            padding-bottom: 5px;
          }

          .label {
            font-size: 9px;
            font-family: 'JetBrains Mono', monospace;
            color: #A0AEC0;
            font-weight: 700;
            letter-spacing: 1.5px;
            margin-top: 5px;
          }

          .value {
            font-size: 13px;
            font-weight: 600;
            color: #2D3748;
            margin-bottom: 12px;
          }

          .text-red {
            color: #E74C3C;
          }

          .badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 50px;
            font-size: 9px;
            font-weight: 800;
            font-family: 'JetBrains Mono', monospace;
          }

          .badge.high {
            background-color: #FFF5F5;
            color: #E74C3C;
            border: 1px solid #FED7D7;
          }

          .badge.medium {
            background-color: #FFFAF0;
            color: #DD6B20;
            border: 1px solid #FEEBC8;
          }

          .badge.low {
            background-color: #F0FFF4;
            color: #38A169;
            border: 1px solid #C6F6D5;
          }

          .barcode-box {
            margin-top: 35px;
            background-color: #F8FAFC;
            border: 1px dashed #E2E8F0;
            padding: 20px;
            text-align: center;
            border-radius: 8px;
          }

          .barcode {
            font-family: 'JetBrains Mono', monospace;
            font-size: 20px;
            font-weight: 500;
            letter-spacing: 5px;
            color: #1A202C;
          }

          .barcode-box p {
            font-size: 10px;
            color: #718096;
            margin: 5px 0 0 0;
            font-weight: 600;
          }

          .checklist-box {
            margin-top: 25px;
            background-color: #F7FAFC;
            border: 1px solid #EDF2F7;
            padding: 15px;
            border-radius: 8px;
          }

          .checklist-box h3 {
            font-size: 11px;
            font-weight: 800;
            color: #E74C3C;
            margin: 0 0 10px 0;
            font-family: 'JetBrains Mono', monospace;
          }

          .chk-row {
            margin: 6px 0;
            font-size: 12px;
            color: #4A5568;
            font-weight: 500;
          }

          .chk-row span {
            color: #38A169;
            font-weight: 800;
            margin-right: 8px;
          }

          .signatures-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 30px;
            margin-top: 40px;
          }

          .sig-box {
            text-align: center;
          }

          .sig-line {
            border-bottom: 1.5px solid #CBD5E0;
            height: 45px;
            margin-bottom: 8px;
          }

          .sig-box p {
            margin: 0;
            font-size: 10px;
            font-family: 'JetBrains Mono', monospace;
            color: #718096;
            font-weight: 700;
          }

          .status-pill {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 50px;
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            font-family: 'JetBrains Mono', monospace;
          }

          .status-pill.available { background-color: #E6FFFA; color: #319795; }
          .status-pill.ontrip { background-color: #EBF8FF; color: #3182CE; }
          .status-pill.inshop { background-color: #FFF5F5; color: #E53E3E; }
          .status-pill.retired { background-color: #EDF2F7; color: #4A5568; }
          
          .status-pill.completed { background-color: #E6FFFA; color: #319795; }
          .status-pill.dispatched { background-color: #EBF8FF; color: #3182CE; }
          .status-pill.draft { background-color: #FEFCBF; color: #B7791F; }

          .footer {
            margin-top: 35px;
            border-top: 1px solid #E2E8F0;
            padding-top: 15px;
            text-align: center;
          }

          .footer p {
            margin: 0;
            font-size: 10px;
            color: #A0AEC0;
          }

          .brand-footer {
            margin-top: 5px !important;
            font-weight: 700;
            color: #E74C3C !important;
            font-family: 'JetBrains Mono', monospace;
            letter-spacing: 1px;
            text-transform: uppercase;
          }

          .mt-3 { margin-top: 15px; }
          .mt-4 { margin-top: 20px; }

          @media print {
            body {
              padding: 0;
            }
            .invoice-container, .ticket-container, .receipt-container, .pod-container, .report-container {
              border: none;
              box-shadow: none;
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        ${content}
        <script>
          // Automatic trigger print on load
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
