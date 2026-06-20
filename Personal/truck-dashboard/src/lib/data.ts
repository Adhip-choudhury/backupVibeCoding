export const navTabs = [
  { label: "Home", active: false },
  { label: "Transportations", active: true },
  { label: "Freight Units", active: false },
  { label: "Trucks", active: false },
  { label: "Load Planning", active: false },
  { label: "Load Distribution", active: false },
  { label: "Info & Rates", active: false },
  { label: "Settings", active: false },
];

export const cargoItems = [
  { id: "CRG-001", weight: "1,240kg", status: "loaded" },
  { id: "CRG-002", weight: "980kg", status: "loaded" },
  { id: "CRG-003", weight: "1,560kg", status: "pending" },
  { id: "CRG-004", weight: "720kg", status: "loaded" },
  { id: "CRG-005", weight: "2,100kg", status: "pending" },
  { id: "CRG-006", weight: "640kg", status: "empty" },
];

export const shipmentCards = [
  { id: "SHP-4281", truck: "VOLVO FH16", route: "Madrid → Berlin", weight: "7,340kg", pallets: 24, eta: "2d 4h", active: true },
  { id: "SHP-4282", truck: "SCANIA R500", route: "Paris → Warsaw", weight: "6,820kg", pallets: 20, eta: "3d 1h", active: false },
  { id: "SHP-4283", truck: "MAN TGX", route: "Milan → Oslo", weight: "8,150kg", pallets: 26, eta: "4d 7h", active: false },
  { id: "SHP-4284", truck: "DAF XF", route: "Berlin → Rome", weight: "5,900kg", pallets: 18, eta: "2d 22h", active: false },
  { id: "SHP-4285", truck: "IVECO S-WAY", route: "Amsterdam → Vienna", weight: "7,100kg", pallets: 22, eta: "1d 14h", active: false },
];

export const freightAssignments = [
  { item: "SHP-4281", vehicle: "VOLVO-17", sequence: "1/3", status: "planned" },
  { item: "SHP-4282", vehicle: "SCANIA-09", sequence: "2/3", status: "loading" },
  { item: "SHP-4283", vehicle: "MAN-22", sequence: "3/3", status: "pending" },
  { item: "SHP-4284", vehicle: "DAF-05", sequence: "1/2", status: "planned" },
  { item: "SHP-4285", vehicle: "IVECO-14", sequence: "2/2", status: "planned" },
];

export const timelineRoutes = [
  { id: "FGT-101", label: "SLO_MADRID", weight: "3,200kg", status: "in-transit", bars: [{ start: 2, end: 14, day: 1 }, { start: 0, end: 6, day: 2 }] },
  { id: "FGT-102", label: "SLO_BERLIN", weight: "2,800kg", status: "scheduled", bars: [{ start: 6, end: 20, day: 1 }] },
  { id: "FGT-103", label: "SLO_PARIS", weight: "4,100kg", status: "scheduled", bars: [{ start: 2, end: 18, day: 2 }] },
  { id: "FGT-104", label: "SLO_AMSTERDAM", weight: "1,900kg", status: "in-transit", bars: [{ start: 10, end: 22, day: 1 }] },
  { id: "FGT-105", label: "SLO_VIENNA", weight: "3,500kg", status: "completed", bars: [{ start: 0, end: 8, day: 1 }, { start: 12, end: 20, day: 1 }] },
  { id: "FGT-106", label: "SLO_OSLO", weight: "2,600kg", status: "delayed", bars: [{ start: 4, end: 16, day: 2 }] },
];

export const kpiStats = {
  weight: { value: "7,340kg", change: "+33%", positive: true },
  pallets: { value: "120", change: "+12%", positive: true },
  alerts: { value: "62", change: "14 critical", positive: false },
};

export const dispatcherOptions = [
  { name: "Alex Morgan", avatar: "AM" },
  { name: "Sarah Chen", avatar: "SC" },
  { name: "Marcus Lee", avatar: "ML" },
];
