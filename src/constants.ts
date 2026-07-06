export const ZONES: string[] = [];
export const UNITS: string[] = [];
export const ROLES = ['ADMIN', 'USER', 'WORKORDER'];
export const SUPPLIERS = ['SUPPLIER A', 'SUPPLIER B', 'SUPPLIER C', 'SUPPLIER D'];
export const ITEMS = ['T-SHIRT', 'POLO', 'HOODIE', 'JACKET', 'PANTS'];
export const COLORS = ['WHITE', 'BLACK', 'NAVY', 'RED', 'GREEN', 'GREY'];
export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
export const DEFECTS = ['STAIN', 'HOLE', 'BROKEN STITCH', 'SHADE VARIATION', 'MEASUREMENT', 'OTHER'];
export const OPERATIONS = ['FRONT ATTACH', 'BACK ATTACH', 'SLEEVE ATTACH', 'HEMMING', 'NECK ATTACH', 'OTHER'];
export const MACHINES = ['SNLS', 'DNLS', 'O/L', 'F/L', 'K/S', 'OTHER'];
export const WORKERS = ['WORKER 1', 'WORKER 2', 'WORKER 3', 'WORKER 4', 'WORKER 5'];
export const CUPSIZES = ['A', 'B', 'C', 'D', 'E'];

export const MAIN_MODULES = [
  { id: 'A', name: 'Data Entry', icon: 'edit-3' },
  { id: 'B', name: 'Data Center', icon: 'database' },
  { id: 'C', name: 'MIS Modules', icon: 'bar-chart-2' }
];

export const SUBMODULES = [
  { id: 'A1', module: 'A', name: 'Material Inspection' },
  { id: 'A2', module: 'A', name: 'Cutting Quality' },
  { id: 'A3', module: 'A', name: 'Inline Quality' },
  { id: 'A4', module: 'A', name: 'Endline Quality' },
  { id: 'A5', module: 'A', name: 'AQL Inspection' },
  { id: 'A6', module: 'A', name: 'Final Audit' },
  { id: 'A7', module: 'A', name: 'Reports & SOPs' },
  { id: 'B1', module: 'B', name: 'Material Report' },
  { id: 'B2', module: 'B', name: 'Cutting Report' },
  { id: 'B3', module: 'B', name: 'Inline Report' },
  { id: 'B4', module: 'B', name: 'Endline Report' },
  { id: 'B5', module: 'B', name: 'AQL Report' },
  { id: 'B6', module: 'B', name: 'Final Audit Report' },
  { id: 'B7', module: 'B', name: 'User Management' },
  { id: 'B8', module: 'B', name: 'Workorder Data' },
  { id: 'B9', module: 'B', name: 'SOP & Audit Documents' },
  { id: 'C1', module: 'C', name: 'Daily Report' },
  { id: 'C3', module: 'C', name: 'Quality Analysis' },
  { id: 'C4', module: 'C', name: 'Defect Report' },
  { id: 'C5', module: 'C', name: 'Factory Performance' },
  { id: 'C7', module: 'C', name: 'Worker Analysis' },
  { id: 'C9', module: 'C', name: 'Blossom AI Analysis' }
];
