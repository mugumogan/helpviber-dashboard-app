import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { api } from '@/lib/api-client';
import { Ticket, Expert, TicketStatus } from '@shared/types';
import { MOCK_EXPERTS } from '@shared/mock-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Toaster, toast } from '@/components/ui/sonner';
import { ArrowLeft, Calendar, Clock, Tag, Smartphone, User, Star, CheckCircle, MessageSquare, FileText } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
const expertsMap = new Map(MOCK_EXPERTS.map(e => [e.id, e]));
const statusInfo: Record<TicketStatus, { color: string; icon: React.ReactNode }> = {
  [TicketStatus.Open]: { color: 'bg-blue-500/20 text-blue-500 border-blue-500/30', icon: <MessageSquare className="h-4 w-4" /> },
  [TicketStatus.InProgress]: { color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30', icon: <Clock className="h-4 w-4" /> },
  [TicketStatus.Resolved]: { color: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30', icon: <CheckCircle className="h-4 w-4" /> },
  [TicketStatus.Closed]: { color: 'bg-gray-500/20 text-gray-500 border-gray-500/30', icon: <FileText className="h-4 w-4" /> },
};
export function TicketDetailsPage() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [expert, setExpert] = useState<Expert | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (!ticketId) return;
    const fetchTicketDetails = async () => {
      setIsLoading(true);
      try {
        const ticketData = await api<Ticket>(`/api/tickets/${ticketId}`);
        setTicket(ticketData);
        const expertData = expertsMap.get(ticketData.expertId);
        setExpert(expertData || null);
      } catch (error) {
        console.error("Failed to fetch ticket details:", error);
        toast.error('Failed to load ticket details.');
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTicketDetails();
  }, [ticketId, navigate]);
  const DetailItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) => (
    <div className="flex items-start space-x-3">
      <div className="text-muted-foreground mt-1">{icon}</div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }
  if (!ticket) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold">Ticket not found</h2>
          <p className="text-muted-foreground mt-2">The ticket you are looking for does not exist.</p>
          <Button onClick={() => navigate('/')} className="mt-6">Back to Dashboard</Button>
        </div>
      </AppLayout>
    );
  }
  return (
    <AppLayout>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 -ml-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold font-display tracking-tight text-foreground">Ticket #{ticket.id}</h1>
              <p className="text-muted-foreground mt-1">
                Created {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
              </p>
            </div>
            <Badge variant="outline" className={cn("text-base px-3 py-1 border-2", statusInfo[ticket.status].color)}>
              {statusInfo[ticket.status].icon}
              <span className="ml-2">{ticket.status}</span>
            </Badge>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Viber's Query</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground leading-relaxed">
                  {ticket.viberQuery}
                </CardContent>
              </Card>
              {ticket.expertResponse && (
                <Card>
                  <CardHeader>
                    <CardTitle>Expert's Response</CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground leading-relaxed">
                    {ticket.expertResponse}
                  </CardContent>
                </Card>
              )}
              {ticket.resolutionNotes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Resolution Notes</CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground leading-relaxed">
                    {ticket.resolutionNotes}
                  </CardContent>
                </Card>
              )}
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ticket Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <DetailItem icon={<Calendar className="h-4 w-4" />} label="Created At" value={format(new Date(ticket.createdAt), 'PPpp')} />
                  {ticket.resolvedAt && <DetailItem icon={<CheckCircle className="h-4 w-4" />} label="Resolved At" value={format(new Date(ticket.resolvedAt), 'PPpp')} />}
                  <DetailItem icon={<Smartphone className="h-4 w-4" />} label="Platform" value={ticket.platform} />
                  <DetailItem icon={<Tag className="h-4 w-4" />} label="Issue Type" value={ticket.issueType} />
                  {ticket.satisfactionScore > 0 && (
                    <DetailItem
                      icon={<Star className="h-4 w-4" />}
                      label="Satisfaction"
                      value={
                        <div className="flex items-center">
                          {ticket.satisfactionScore} / 5
                          <Star className="h-4 w-4 ml-1 text-yellow-400 fill-yellow-400" />
                        </div>
                      }
                    />
                  )}
                </CardContent>
              </Card>
              {expert && (
                <Card>
                  <CardHeader>
                    <CardTitle>Assigned Expert</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={expert.avatarUrl} alt={expert.name} />
                      <AvatarFallback>{expert.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{expert.name}</p>
                      <p className="text-sm text-muted-foreground">Expert</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <Toaster richColors />
    </AppLayout>
  );
}