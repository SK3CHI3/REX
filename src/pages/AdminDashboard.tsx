import React, { useState } from 'react';
import {
  Shield,
  Users,
  Eye,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Database,
  Globe,
  Play,
  Pause,
  RefreshCw,
  Settings,
  BarChart3,
  FileText,
  UserCheck,
  Activity,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import {
  usePendingSubmissions,
  useApproveSubmission,
  useRejectSubmission,
  useCases
} from '@/hooks/useCases';
import { useAuth } from '@/contexts/AuthContext';
import { useUserAnalytics, useRecentActivity } from '@/hooks/useUserAnalytics';
import {
  useScrapingStatus,
  useScrapingSources,
  usePendingScrapedCases,
  useStartManualScraping,
  useStartSourceScraping,
  useApproveScrapedCase,
  useRejectScrapedCase
} from '@/hooks/useScraping';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [selectedTab, setSelectedTab] = useState('overview');

  // Data hooks
  const { data: cases, isLoading: casesLoading } = useCases();
  const pendingSubmissions = usePendingSubmissions();
  const pendingScrapedCases = usePendingScrapedCases();
  const scrapingStatus = useScrapingStatus();
  const scrapingSources = useScrapingSources();

  // User analytics data
  const { data: userAnalytics, isLoading: analyticsLoading } = useUserAnalytics();
  const { data: recentActivity, isLoading: activityLoading } = useRecentActivity();

  // Action hooks
  const approveSubmission = useApproveSubmission();
  const rejectSubmission = useRejectSubmission();
  const approveScrapedCase = useApproveScrapedCase();
  const rejectScrapedCase = useRejectScrapedCase();
  const startManualScraping = useStartManualScraping();
  const startSourceScraping = useStartSourceScraping();

  // Calculate statistics
  const totalCases = cases?.length || 0;
  const totalPendingSubmissions = pendingSubmissions.data?.length || 0;
  const totalPendingScraped = pendingScrapedCases.data?.length || 0;
  const totalPending = totalPendingSubmissions + totalPendingScraped;

  const thisMonthCases = cases?.filter(c => {
    const caseDate = new Date(c.incidentDate);
    const now = new Date();
    return caseDate.getMonth() === now.getMonth() && caseDate.getFullYear() === now.getFullYear();
  }).length || 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'running': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'running': return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 text-white overflow-x-hidden">
      {/* Floating Navigation Header */}
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-black/40 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl max-w-7xl w-full">
        <div className="px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">REX Admin</h1>
                <p className="text-xs text-gray-300 hidden sm:block">Administrative Dashboard</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-300">System Online</span>
              </div>
              <div className="text-sm text-gray-300">
                Welcome, <span className="font-medium text-white">{user?.full_name || user?.username}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                onClick={() => navigate('/')}
                size="sm"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Back to Site
              </Button>
              <Button
                onClick={logout}
                size="sm"
                variant="outline"
                className="border-red-500/50 text-red-300 hover:bg-red-500/10"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Settings className="w-8 h-8 text-red-400" />
            <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-xl text-gray-300">
            Manage case submissions, monitor scraping, and oversee platform operations
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Cases */}
          <div className="bg-black/30 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl hover:bg-black/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              <Badge variant="secondary" className="bg-blue-900/50 text-blue-300 border-blue-500/30">
                Published
              </Badge>
            </div>
            <div className="text-3xl font-black bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-2">
              {casesLoading ? '...' : totalCases}
            </div>
            <p className="text-sm text-gray-400">Total Published Cases</p>
          </div>

          {/* Pending Reviews */}
          <div className="bg-black/30 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl hover:bg-black/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <Badge variant="secondary" className="bg-yellow-900/50 text-yellow-300 border-yellow-500/30">
                Pending
              </Badge>
            </div>
            <div className="text-3xl font-black bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent mb-2">
              {totalPending}
            </div>
            <p className="text-sm text-gray-400">Awaiting Review</p>
          </div>

          {/* This Month */}
          <div className="bg-black/30 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl hover:bg-black/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <Badge variant="secondary" className="bg-green-900/50 text-green-300 border-green-500/30">
                Recent
              </Badge>
            </div>
            <div className="text-3xl font-black bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent mb-2">
              {casesLoading ? '...' : thisMonthCases}
            </div>
            <p className="text-sm text-gray-400">Cases This Month</p>
          </div>

          {/* System Status */}
          <div className="bg-black/30 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl hover:bg-black/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <Badge variant="secondary" className="bg-green-900/50 text-green-300 border-green-500/30">
                Online
              </Badge>
            </div>
            <div className="text-3xl font-black bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent mb-2">
              99.9%
            </div>
            <p className="text-sm text-gray-400">System Uptime</p>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-black/30 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="bg-black/50 border border-white/10 rounded-xl p-1 mb-8">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-300"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="submissions" 
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-300"
              >
                <FileText className="w-4 h-4 mr-2" />
                Manual Submissions ({totalPendingSubmissions})
              </TabsTrigger>
              <TabsTrigger 
                value="scraped" 
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-300"
              >
                <Globe className="w-4 h-4 mr-2" />
                Scraped Cases ({totalPendingScraped})
              </TabsTrigger>
              <TabsTrigger
                value="scraping"
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-300"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Scraping Control
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-300"
              >
                <Users className="w-4 h-4 mr-2" />
                Site Users
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick Actions */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold mb-4 flex items-center">
                    <UserCheck className="w-5 h-5 mr-2 text-red-400" />
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <Button
                      onClick={() => setSelectedTab('submissions')}
                      className="w-full justify-start bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                      disabled={totalPendingSubmissions === 0}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Review {totalPendingSubmissions} Manual Submissions
                    </Button>
                    <Button
                      onClick={() => setSelectedTab('scraped')}
                      className="w-full justify-start bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                      disabled={totalPendingScraped === 0}
                    >
                      <Globe className="w-4 h-4 mr-2" />
                      Review {totalPendingScraped} Scraped Cases
                    </Button>
                    <Button
                      onClick={() => startManualScraping.mutate()}
                      className="w-full justify-start bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                      disabled={startManualScraping.isPending}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Manual Scraping
                    </Button>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold mb-4 flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-red-400" />
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    {pendingSubmissions.data?.slice(0, 3).map((submission) => (
                      <div key={submission.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                          <div>
                            <p className="text-sm font-medium">{submission.victim_name}</p>
                            <p className="text-xs text-gray-400">{submission.location}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-yellow-900/50 text-yellow-300 border-yellow-500/30">
                          Pending
                        </Badge>
                      </div>
                    ))}
                    {(!pendingSubmissions.data || pendingSubmissions.data.length === 0) && (
                      <p className="text-center text-gray-400 py-4">No recent submissions</p>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Manual Submissions Tab */}
            <TabsContent value="submissions" className="space-y-6">
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold mb-6 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-red-400" />
                  Manual Case Submissions
                </h3>
                <div className="space-y-4">
                  {pendingSubmissions.data?.map((submission) => (
                    <div key={submission.id} className="bg-black/30 rounded-xl p-6 border border-white/10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="space-y-2">
                          <h4 className="text-lg font-semibold text-white">{submission.victim_name}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {submission.location}, {submission.county}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(submission.incident_date).toLocaleDateString()}
                            </span>
                          </div>
                          <Badge variant="secondary" className="bg-red-900/50 text-red-300 border-red-500/30">
                            {submission.case_type.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <Badge variant="secondary" className="bg-yellow-900/50 text-yellow-300 border-yellow-500/30">
                          Pending Review
                        </Badge>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-300 mb-2"><strong>Description:</strong></p>
                        <p className="text-sm text-gray-400 bg-black/20 p-3 rounded-lg">
                          {submission.description}
                        </p>
                      </div>

                      <div className="mb-4 text-sm text-gray-400">
                        <p><strong>Reporter:</strong> {submission.reporter_name} ({submission.reporter_contact})</p>
                        <p><strong>Submitted:</strong> {new Date(submission.created_at).toLocaleString()}</p>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={() => approveSubmission.mutate(submission.id)}
                          disabled={approveSubmission.isPending}
                          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve & Publish
                        </Button>
                        <Button
                          onClick={() => rejectSubmission.mutate({ submissionId: submission.id })}
                          disabled={rejectSubmission.isPending}
                          variant="outline"
                          className="border-red-500/50 text-red-300 hover:bg-red-500/10"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                  {(!pendingSubmissions.data || pendingSubmissions.data.length === 0) && (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-xl text-gray-400 mb-2">No pending submissions</p>
                      <p className="text-gray-500">All manual submissions have been reviewed</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Scraped Cases Tab */}
            <TabsContent value="scraped" className="space-y-6">
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold mb-6 flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-red-400" />
                  Scraped Case Reviews
                </h3>
                <div className="space-y-4">
                  {pendingScrapedCases.data?.map((caseItem: any) => (
                    <div key={caseItem.id} className="bg-black/30 rounded-xl p-6 border border-white/10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="space-y-2">
                          <h4 className="text-lg font-semibold text-white">{caseItem.victim_name || 'Unknown Victim'}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span>{caseItem.location || 'Unknown location'}</span>
                            <span>{caseItem.case_type || 'Unknown type'}</span>
                          </div>
                          <Badge variant="secondary" className="bg-blue-900/50 text-blue-300 border-blue-500/30">
                            Scraped Data
                          </Badge>
                        </div>
                        <Badge variant="secondary" className="bg-yellow-900/50 text-yellow-300 border-yellow-500/30">
                          Pending Review
                        </Badge>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-400 bg-black/20 p-3 rounded-lg">
                          {caseItem.description || 'No description available'}
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={() => approveScrapedCase.mutate(caseItem.id)}
                          disabled={approveScrapedCase.isPending}
                          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => rejectScrapedCase.mutate({ submissionId: caseItem.id })}
                          disabled={rejectScrapedCase.isPending}
                          variant="outline"
                          className="border-red-500/50 text-red-300 hover:bg-red-500/10"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                  {(!pendingScrapedCases.data || pendingScrapedCases.data.length === 0) && (
                    <div className="text-center py-12">
                      <Globe className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-xl text-gray-400 mb-2">No pending scraped cases</p>
                      <p className="text-gray-500">All scraped cases have been reviewed</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Scraping Control Tab */}
            <TabsContent value="scraping" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Scraping Controls */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold mb-6 flex items-center">
                    <RefreshCw className="w-5 h-5 mr-2 text-red-400" />
                    Scraping Controls
                  </h3>
                  <div className="space-y-4">
                    <Button
                      onClick={() => startManualScraping.mutate()}
                      disabled={startManualScraping.isPending}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start All Sources
                    </Button>
                    <div className="text-sm text-gray-400">
                      <p>Last run: {scrapingStatus.data?.last_run ? new Date(scrapingStatus.data.last_run).toLocaleString() : 'Never'}</p>
                      <p>Status: {scrapingStatus.data?.status || 'Unknown'}</p>
                    </div>
                  </div>
                </div>

                {/* Sources Status */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold mb-6 flex items-center">
                    <Database className="w-5 h-5 mr-2 text-red-400" />
                    Sources Status
                  </h3>
                  <div className="space-y-3">
                    {scrapingSources.data?.map((source: any) => (
                      <div key={source.id} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{source.name}</p>
                          <p className="text-xs text-gray-400">{source.url}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant="secondary"
                            className={source.enabled ? "bg-green-900/50 text-green-300 border-green-500/30" : "bg-gray-900/50 text-gray-300 border-gray-500/30"}
                          >
                            {source.enabled ? "Enabled" : "Disabled"}
                          </Badge>
                          <Button
                            size="sm"
                            onClick={() => startSourceScraping.mutate(source.id)}
                            disabled={startSourceScraping.isPending}
                            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                          >
                            <Play className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {(!scrapingSources.data || scrapingSources.data.length === 0) && (
                      <p className="text-center text-gray-400 py-4">No sources configured</p>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Analytics */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold mb-6 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-red-400" />
                    User Analytics
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-white">Total Visitors</p>
                        <p className="text-xs text-gray-400">All time unique visitors</p>
                      </div>
                      <div className="text-2xl font-bold text-blue-400">
                        {analyticsLoading ? '...' : userAnalytics?.totalVisitors || 0}
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-white">Active Today</p>
                        <p className="text-xs text-gray-400">Visitors in last 24 hours</p>
                      </div>
                      <div className="text-2xl font-bold text-green-400">
                        {analyticsLoading ? '...' : userAnalytics?.activeToday || 0}
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-white">Avg. Session</p>
                        <p className="text-xs text-gray-400">Average time on site</p>
                      </div>
                      <div className="text-2xl font-bold text-purple-400">
                        {analyticsLoading ? '...' : `${userAnalytics?.averageSessionMinutes || 0}:00`}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Admin Users */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold mb-6 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-red-400" />
                    Admin Users
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-white">A</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{user?.full_name || 'Admin User'}</p>
                          <p className="text-xs text-gray-400">{user?.email}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-900/50 text-green-300 border-green-500/30">
                        {user?.role || 'Admin'}
                      </Badge>
                    </div>
                    <div className="text-center py-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/20 text-gray-300 hover:bg-white/10"
                      >
                        Manage Admin Users
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold mb-6 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-red-400" />
                  Recent User Activity
                </h3>
                <div className="space-y-3">
                  {activityLoading ? (
                    <div className="text-center py-4">
                      <div className="text-gray-400">Loading recent activity...</div>
                    </div>
                  ) : recentActivity && recentActivity.length > 0 ? (
                    recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <div>
                            <p className="text-sm font-medium text-white">{activity.description}</p>
                            <p className="text-xs text-gray-400">
                              {new Date(activity.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-blue-900/50 text-blue-300 border-blue-500/30">
                          {activity.type === 'visit' ? 'Visit' : activity.type === 'submission' ? 'Submission' : 'Interaction'}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <div className="text-gray-400">No recent activity</div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
