export type UserRole = 'ADMIN' | 'WORKORDER' | 'USER';

export interface User {
  userCode: string;
  username: string;
  password: string;
  role: UserRole;
  location: string;
  zone?: string;
  restrictions: string[]; // List of disabled submodule IDs
}

export interface Workorder {
  id: string;
  zone: 'KERALA' | 'TIRUPUR' | 'BANGLORE';
  workorderNumber: string;
  style: string;
  sizeRange: string;
  quantity: number;
  colour: string;
  createdAt: string;
}

export interface MaterialInspection {
  id: string;
  grn: string;
  billDate: string;
  checkingDate: string;
  items: {
    slNo: number;
    itemName: string;
    totalQty: number;
    pass: number;
    fail: number;
  }[];
  remarks: string;
  userCode: string;
}

export interface CuttingInspection {
  id: string;
  zone: string;
  workorderId: string;
  checkedQty: number;
  pass: number;
  fail: number;
  remarks: string;
}

export interface InlineInspection {
  id: string;
  zone: string;
  workorderId: string;
  unit: string;
  defect: string;
  worker: string;
  machine: string;
  operation: string;
  size: string;
  cupSize: string;
}

export interface EndlineInspection {
  id: string;
  zone: string;
  unit: string;
  workorderId: string;
  size: string;
  cupSize: string;
  lineNo: string;
  checked: number;
  pass: number;
  fail: number;
  rework: number;
  reworkItems: {
    defect: string;
    worker: string;
    operation: string;
    machine: string;
  }[];
}

export interface AQLInspection {
  id: string;
  zone: string;
  unit: string;
  workorderId: string;
  pcsToCheck: number;
  passQty: number;
  failedPcs: number;
  remarks: string;
  status: 'PASS' | 'FAIL';
}

export interface FinalAudit {
  id: string;
  zone: string;
  unit: string;
  workorderId: string;
  totalPcsAudited: number;
  pass: number;
  rejected: number;
  remarks: string;
}
