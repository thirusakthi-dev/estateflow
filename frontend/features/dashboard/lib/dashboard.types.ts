
export type DashboardSummary = {
  totalLeads: number;
  newLeads: number;
  bookedLeads: number;
  lostLeads: number;
  totalProjects: number;
  totalBuildings: number;
  confirmedBookings: number;
};

export type DashboardLead = {
  id: string;
  name: string;
  phone: string;
  stage: string;
  updatedAt: string;
  assignedTo: {
    id: string;
    name: string;
  } | null;
};

export type DashboardBooking = {
  id: string;
  status: string;
  bookedAt: string;
  lead: {
    id: string;
    name: string;
  };
  building: {
    id: string;
    name: string;
    project: {
      id: string;
      name: string;
    };
  };
};

export type MonthlyLeadData = {
  month: string;
  count: number;
};

export type LeadPipelineData = {
  stage: string;
  count: number;
};

export type BookingStatusData = {
  status: string;
  count: number;
};

export type TeamPerformanceData = {
  employeeId: string;
  employeeName: string;
  leadsAssigned: number;
  bookingsCreated: number;
};

export type DashboardCharts = {
  monthlyLeads: MonthlyLeadData[];
  leadPipeline: LeadPipelineData[];
  bookingStatuses: BookingStatusData[];
  teamPerformance: TeamPerformanceData[];
};

export type DashboardData = {
  summary: DashboardSummary;
  charts: DashboardCharts;
  recentLeads: DashboardLead[];
  recentBookings: DashboardBooking[];
};
