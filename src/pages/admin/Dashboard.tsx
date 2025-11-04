import { useState, useEffect } from "react";
import { Users, UserCheck, Briefcase, TrendingUp } from "lucide-react";
import { KPICard } from "@/components/admin/KPICard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { apiHelpers } from "@/lib/api";

// Interface for dashboard stats
interface DashboardStats {
  totalUsers: number;
  totalFreelancers: number;
  activeJobs: number;
  newUsers: number;
  verifiedFreelancers: number;
  availableFreelancers: number;
  averageRating: number;
}

// Interface for recent users
interface RecentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  joinedAt: string;
}

// Interface for recent jobs
interface RecentJob {
  id: string;
  title: string;
  client: string;
  status: string;
  postedAt: string;
}

const statusColors = {
  open: "bg-primary/10 text-primary",
  "in-progress": "bg-warning/10 text-warning",
  completed: "bg-success/10 text-success",
  closed: "bg-destructive/10 text-destructive",
  // Fallback for any other status
  default: "bg-muted/10 text-muted-foreground",
};

// Chart data - Updated to show realistic growth patterns
const userGrowthData = [
  { date: "Jan 15", users: 1820, freelancers: 980 },
  { date: "Feb 15", users: 2100, freelancers: 1150 },
  { date: "Mar 15", users: 2350, freelancers: 1280 },
  { date: "Apr 15", users: 2580, freelancers: 1410 },
  { date: "May 15", users: 2847, freelancers: 1523 },
  { date: "Jun 15", users: 3120, freelancers: 1680 },
  { date: "Jul 15", users: 3450, freelancers: 1850 },
  { date: "Aug 15", users: 3780, freelancers: 2020 },
  { date: "Sep 15", users: 4120, freelancers: 2180 },
  { date: "Oct 15", users: 4450, freelancers: 2350 },
  { date: "Nov 15", users: 4780, freelancers: 2520 },
  { date: "Dec 15", users: 5120, freelancers: 2680 },
];


const chartConfig = {
  users: {
    label: "Total Users",
    color: "hsl(var(--primary))",
  },
  freelancers: {
    label: "Freelancers",
    color: "hsl(var(--accent))",
  },
  open: {
    label: "Open",
    color: "hsl(var(--primary))",
  },
  inProgress: {
    label: "In Progress",
    color: "hsl(var(--warning))",
  },
  completed: {
    label: "Completed",
    color: "hsl(var(--success))",
  },
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [jobTrendsData, setJobTrendsData] = useState([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all dashboard data in parallel
      const [statsResponse, growthResponse, jobTrendsResponse, recentUsersResponse, recentJobsResponse] = await Promise.all([
        apiHelpers.getDashboardStats(),
        apiHelpers.getUserGrowthData(),
        apiHelpers.getJobTrends(),
        apiHelpers.getRecentUsers(),
        apiHelpers.getRecentJobs()
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.stats);
      }

      if (growthResponse.success) {
        setUserGrowthData(growthResponse.data);
      }

      if (jobTrendsResponse.success) {
        setJobTrendsData(jobTrendsResponse.data);
      }

      if (recentUsersResponse.success) {
        setRecentUsers(recentUsersResponse.users);
      }

      if (recentJobsResponse.success) {
        setRecentJobs(recentJobsResponse.jobs);
      }
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      if (error.code === 'ERR_NETWORK' || error.message?.includes('ERR_CONNECTION_REFUSED')) {
        setError('Cannot connect to backend server. Please ensure the backend is running and accessible.');
      } else {
        setError('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  // Create KPI data from real stats
  const kpiData = stats ? [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      change: `+${stats.newUsers} new this week`,
      changeType: "positive" as const,
      icon: Users,
    },
    {
      title: "Freelancers",
      value: stats.totalFreelancers.toLocaleString(),
      change: `${stats.verifiedFreelancers} verified`,
      changeType: "positive" as const,
      icon: UserCheck,
    },
    {
      title: "Active Jobs",
      value: stats.activeJobs.toLocaleString(),
      change: "Currently active",
      changeType: "positive" as const,
      icon: Briefcase,
    },
    {
      title: "New Users (7d)",
      value: stats.newUsers.toLocaleString(),
      change: "This week",
      changeType: "positive" as const,
      icon: TrendingUp,
    },
  ] : [];

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Loading dashboard data...
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            {error}
          </p>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <button 
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's an overview of your platform.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi) => (
          <KPICard key={kpi.title} {...kpi} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <LineChart data={userGrowthData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  height={30}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  domain={[0, (dataMax) => Math.ceil(dataMax * 1.1)]}
                  allowDataOverflow={false}
                  tickCount={5}
                  width={40}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="var(--color-users)" 
                  strokeWidth={2}
                  dot={{ fill: "var(--color-users)", r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="freelancers" 
                  stroke="var(--color-freelancers)" 
                  strokeWidth={2}
                  dot={{ fill: "var(--color-freelancers)", r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Job Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Job Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <LineChart data={jobTrendsData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  height={30}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  domain={[0, (dataMax) => Math.ceil(dataMax * 1.1)]}
                  allowDataOverflow={false}
                  tickCount={5}
                  width={40}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="open" 
                  stroke="var(--color-open)" 
                  strokeWidth={2}
                  dot={{ fill: "var(--color-open)", r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="inProgress" 
                  stroke="var(--color-inProgress)" 
                  strokeWidth={2}
                  dot={{ fill: "var(--color-inProgress)", r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="var(--color-completed)" 
                  strokeWidth={2}
                  dot={{ fill: "var(--color-completed)", r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="mb-1">{user.role}</Badge>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">{user.joinedAt}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Jobs */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Job Postings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentJobs.map((job) => (
                <div key={job.id} className="p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm font-medium line-clamp-1">{job.title}</p>
                    <Badge className={statusColors[job.status as keyof typeof statusColors] || statusColors.default}>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1).replace('-', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{job.client}</span>
                    <span>{job.postedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
