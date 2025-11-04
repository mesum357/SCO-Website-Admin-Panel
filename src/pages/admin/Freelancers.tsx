import { useState, useEffect } from "react";
import { Search, Filter, MoreVertical, Edit, Trash2, Eye, Star, MapPin, Briefcase, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { apiHelpers } from "@/lib/api";

// Interface for freelancer data
interface Freelancer {
  id: string;
  name: string;
  email: string;
  skills: string[];
  location: string;
  rating: number;
  completedJobs: number;
  hourlyRate: number;
  verified: boolean;
  joinedAt: string;
  status: string;
}

// Chart data for freelancer growth - will be fetched from API

const chartConfig = {
  freelancers: {
    label: "Total Freelancers",
    color: "hsl(var(--primary))",
  },
  newFreelancers: {
    label: "New Freelancers",
    color: "hsl(var(--accent))",
  },
};

const statusColors = {
  Available: "bg-success/10 text-success",
  Busy: "bg-warning/10 text-warning",
  Offline: "bg-muted/10 text-muted",
};

export default function Freelancers() {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [skillFilter, setSkillFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFreelancers, setTotalFreelancers] = useState(0);
  const [stats, setStats] = useState({
    totalFreelancers: 0,
    verifiedFreelancers: 0,
    availableFreelancers: 0,
    averageRating: 0
  });
  const [freelancerGrowthData, setFreelancerGrowthData] = useState([]);

  useEffect(() => {
    fetchFreelancers();
    fetchFreelancerStats();
    fetchFreelancerGrowth();
  }, [currentPage, searchTerm, statusFilter, skillFilter]);

  const fetchFreelancers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiHelpers.getFreelancers({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter,
        skill: skillFilter
      });

      if (response.success) {
        setFreelancers(response.freelancers);
        setTotalPages(response.pagination.pages);
        setTotalFreelancers(response.pagination.total);
      } else {
        setError('Failed to fetch freelancers');
      }
    } catch (error: any) {
      console.error('Error fetching freelancers:', error);
      if (error.code === 'ERR_NETWORK' || error.message?.includes('ERR_CONNECTION_REFUSED')) {
        setError('Cannot connect to backend server. Please ensure the backend is running and accessible.');
      } else {
        setError('Failed to fetch freelancers');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchFreelancerStats = async () => {
    try {
      const response = await apiHelpers.getFreelancerStats();
      if (response.success) {
        setStats(response.stats);
      }
    } catch (error) {
      console.error('Error fetching freelancer stats:', error);
    }
  };

  const fetchFreelancerGrowth = async () => {
    try {
      const response = await apiHelpers.getFreelancerGrowth();
      if (response.success) {
        setFreelancerGrowthData(response.data);
      }
    } catch (error) {
      console.error('Error fetching freelancer growth data:', error);
    }
  };

  const filteredFreelancers = freelancers;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Freelancers Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage and monitor all platform freelancers
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Freelancers</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFreelancers}</div>
            <p className="text-xs text-muted-foreground">
              Registered freelancers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verifiedFreelancers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalFreelancers > 0 ? ((stats.verifiedFreelancers / stats.totalFreelancers) * 100).toFixed(1) : 0}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.availableFreelancers}</div>
            <p className="text-xs text-muted-foreground">
              Ready for new projects
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Out of 5.0 stars
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Freelancer Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Freelancer Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={freelancerGrowthData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
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
                  dataKey="freelancers" 
                  stroke="var(--color-freelancers)" 
                  strokeWidth={2}
                  dot={{ fill: "var(--color-freelancers)", r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="newFreelancers" 
                  stroke="var(--color-newFreelancers)" 
                  strokeWidth={2}
                  dot={{ fill: "var(--color-newFreelancers)", r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="busy">Busy</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
            </SelectContent>
          </Select>
          <Select value={skillFilter} onValueChange={setSkillFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by skill" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Skills</SelectItem>
              <SelectItem value="react">React</SelectItem>
              <SelectItem value="node.js">Node.js</SelectItem>
              <SelectItem value="ui/ux design">UI/UX Design</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="digital marketing">Digital Marketing</SelectItem>
              <SelectItem value="content writing">Content Writing</SelectItem>
              <SelectItem value="mobile development">Mobile Development</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Freelancers Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Freelancer</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Jobs</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <span className="ml-2">Loading freelancers...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <p className="text-destructive">{error}</p>
                    <Button 
                      onClick={fetchFreelancers}
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                    >
                      Retry
                    </Button>
                  </TableCell>
                </TableRow>
              ) : filteredFreelancers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <p className="text-muted-foreground">No freelancers found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredFreelancers.map((freelancer) => (
                  <TableRow key={freelancer.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {freelancer.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{freelancer.name}</p>
                          <p className="text-sm text-muted-foreground">{freelancer.email}</p>
                          {freelancer.verified && (
                            <Badge className="bg-success/10 text-success hover:bg-success/20 text-xs mt-1">
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {freelancer.skills.slice(0, 2).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {freelancer.skills.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{freelancer.skills.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {freelancer.location}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[freelancer.status as keyof typeof statusColors]}>
                        {freelancer.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{freelancer.rating.toFixed(1)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">${freelancer.hourlyRate}/hr</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{freelancer.completedJobs}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Freelancer
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove Freelancer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalFreelancers)} of {totalFreelancers} freelancers
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                {totalPages > 5 && (
                  <>
                    <span className="text-muted-foreground">...</span>
                    <Button
                      variant={currentPage === totalPages ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      className="w-8 h-8 p-0"
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Results info */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredFreelancers.length} of {totalFreelancers} freelancers
      </div>
    </div>
  );
}
