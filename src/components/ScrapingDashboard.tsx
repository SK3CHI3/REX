import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Pause, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Database,
  Globe
} from 'lucide-react';
import {
  useScrapingStatus,
  useScrapingSources,
  usePendingScrapedCases,
  useStartManualScraping,
  useStartSourceScraping,
  useApproveScrapedCase,
  useRejectScrapedCase
} from '@/hooks/useScraping';
import {
  usePendingSubmissions,
  useApproveSubmission,
  useRejectSubmission
} from '@/hooks/useCases';
import { testScrapingSetup } from '@/lib/scraping-api';

const ScrapingDashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [testResult, setTestResult] = useState<any>(null);

  const scrapingStatus = useScrapingStatus();
  const scrapingSources = useScrapingSources();
  const pendingCases = usePendingScrapedCases();
  const pendingSubmissions = usePendingSubmissions();

  const startManualScraping = useStartManualScraping();
  const startSourceScraping = useStartSourceScraping();
  const approveCase = useApproveScrapedCase();
  const rejectCase = useRejectScrapedCase();
  const approveSubmission = useApproveSubmission();
  const rejectSubmission = useRejectSubmission();

  const handleTestSetup = async () => {
    const result = await testScrapingSetup();
    setTestResult(result);
  };

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
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Scraping Dashboard</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => startManualScraping.mutate()}
            disabled={startManualScraping.isPending}
            className="flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Start All Scraping
          </Button>
          <Button
            variant="outline"
            onClick={handleTestSetup}
            className="flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4" />
            Test Setup
          </Button>
          <Button
            variant="outline"
            onClick={() => scrapingStatus.refetch()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scrapingStatus.activeJobs.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {scrapingStatus.stats?.total_articles_scraped || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Articles scraped
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incidents Found</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {scrapingStatus.stats?.total_incidents_extracted || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Incidents extracted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(pendingCases.data?.length || 0) + (pendingSubmissions.data?.length || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Cases awaiting approval ({pendingSubmissions.data?.length || 0} manual, {pendingCases.data?.length || 0} scraped)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Test Results */}
      {testResult && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {testResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              Setup Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Status:</strong> {testResult.success ? 'Success' : 'Failed'}</p>
              {testResult.data && (
                <>
                  <p><strong>Sources:</strong> {testResult.data.sources_count}</p>
                  <p><strong>Recent Jobs:</strong> {testResult.data.recent_jobs_count}</p>
                  <p><strong>Firecrawl Configured:</strong> {testResult.data.firecrawl_configured ? 'Yes' : 'No'}</p>
                </>
              )}
              {testResult.error && (
                <p className="text-red-500"><strong>Error:</strong> {testResult.error}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="jobs">Recent Jobs</TabsTrigger>
          <TabsTrigger value="pending">Scraped Cases</TabsTrigger>
          <TabsTrigger value="submissions">Manual Submissions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Recent Jobs */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {scrapingStatus.recentJobs.map((job: any) => (
                    <div key={job.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(job.status)}
                        <span className="text-sm font-medium">Job {job.id.slice(0, 8)}</span>
                      </div>
                      <Badge className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Scheduler Status */}
            <Card>
              <CardHeader>
                <CardTitle>Scheduler Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {scrapingStatus.scheduler?.jobs.map((job: any) => (
                    <div key={job.name} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm font-medium">{job.name}</span>
                      <Badge variant={job.running ? "default" : "secondary"}>
                        {job.running ? "Running" : "Stopped"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scraping Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scrapingSources.data?.map((source: any) => (
                  <div key={source.id} className="flex items-center justify-between p-4 border rounded">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5" />
                      <div>
                        <h3 className="font-medium">{source.name}</h3>
                        <p className="text-sm text-muted-foreground">{source.base_url}</p>
                        <p className="text-xs text-muted-foreground">
                          Last scraped: {source.last_scraped ? new Date(source.last_scraped).toLocaleString() : 'Never'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={source.enabled ? "default" : "secondary"}>
                        {source.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                      <Button
                        size="sm"
                        onClick={() => startSourceScraping.mutate(source.id)}
                        disabled={startSourceScraping.isPending}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Scraping Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {scrapingStatus.recentJobs.map((job: any) => (
                  <div key={job.id} className="p-4 border rounded space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(job.status)}
                        <span className="font-medium">Job {job.id.slice(0, 8)}</span>
                      </div>
                      <Badge className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Started: {new Date(job.started_at).toLocaleString()}</p>
                      {job.completed_at && (
                        <p>Completed: {new Date(job.completed_at).toLocaleString()}</p>
                      )}
                      <p>Articles: {job.articles_found || 0} | Incidents: {job.incidents_extracted || 0}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Scraped Case Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingCases.data?.map((caseItem: any) => (
                  <div key={caseItem.id} className="p-4 border rounded space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-medium">{caseItem.victim_name || 'Unknown Victim'}</h3>
                        <p className="text-sm text-muted-foreground">
                          {caseItem.case_type} • {caseItem.location} • {caseItem.incident_date}
                        </p>
                        <p className="text-sm">{caseItem.description}</p>
                        {caseItem.confidence_score && (
                          <Badge variant="outline">
                            Confidence: {caseItem.confidence_score}%
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => approveCase.mutate(caseItem.id)}
                        disabled={approveCase.isPending}
                        className="flex items-center gap-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => rejectCase.mutate({ submissionId: caseItem.id })}
                        disabled={rejectCase.isPending}
                        className="flex items-center gap-1"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
                {pendingCases.data?.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No pending cases to review
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manual Case Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingSubmissions.data?.map((submission) => (
                  <div key={submission.id} className="p-4 border rounded space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-medium">{submission.victim_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {submission.case_type.replace('_', ' ')} • {submission.location}, {submission.county}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Incident Date: {new Date(submission.incident_date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Submitted: {new Date(submission.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Reporter: {submission.reporter_name} ({submission.reporter_contact})
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm"><strong>Description:</strong></p>
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {submission.description}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => approveSubmission.mutate(submission.id)}
                        disabled={approveSubmission.isPending}
                        className="flex items-center gap-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve & Publish
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => rejectSubmission.mutate({ submissionId: submission.id })}
                        disabled={rejectSubmission.isPending}
                        className="flex items-center gap-1"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
                {pendingSubmissions.data?.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No pending manual submissions to review
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScrapingDashboard;
