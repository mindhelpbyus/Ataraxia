import { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TherapistVerificationModal } from '@/components/workflow/TherapistVerificationModal';
import { verificationService } from '@/services/verificationService';
import { Therapist, VerificationStage, VerificationStatus } from '@/types/therapist';
import { toast } from 'sonner';

const TherapistVerificationView = () => {
    const [therapists, setTherapists] = useState<Therapist[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const fetchTherapists = async () => {
        setIsLoading(true);
        try {
            const data = await verificationService.getAllTherapists();
            const sortedData = data.sort((a: Therapist, b: Therapist) => {
                const scoreA = getPriorityScore(a);
                const scoreB = getPriorityScore(b);
                return scoreB - scoreA;
            });
            setTherapists(sortedData);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load therapist applications');
        } finally {
            setIsLoading(false);
        }
    };

    const getPriorityScore = (t: Therapist) => {
        if (['registration_submitted', 'pending_verification', 'documents_review'].includes(t.account_status)) return 3;
        if (t.account_status === 'onboarding_pending') return 2;
        if (t.account_status === 'active') return 0;
        return 1;
    };

    useEffect(() => {
        fetchTherapists();
    }, []);

    const handleUpdateTherapist = async (
        therapistId: string,
        stage: VerificationStage,
        status: VerificationStatus,
        notes?: string
    ) => {
        try {
            let apiStage: 'documents' | 'background_check' | 'final' = 'documents';
            if (stage === 'background_check') apiStage = 'background_check';
            if (stage === 'final') apiStage = 'final';

            await verificationService.updateVerificationStage(therapistId, {
                stage: apiStage,
                status: status === 'approved' ? 'approved' : 'rejected',
                notes
            });

            toast.success('Status updated successfully');
            fetchTherapists();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update status');
        }
    };

    useEffect(() => {
        if (selectedTherapist) {
            const fresh = therapists.find(t => t.id === selectedTherapist.id);
            if (fresh) setSelectedTherapist(fresh);
        }
    }, [therapists]);

    const filteredTherapists = therapists.filter((t) => {
        const matchesSearch =
            `${t.first_name || ''} ${t.last_name || ''} ${t.email || ''}`.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'pending' && ['pending_verification', 'onboarding_pending', 'incomplete_registration', 'registration_submitted'].includes(t.account_status)) ||
            t.account_status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: therapists.length,
        pending: therapists.filter((t) =>
            ['pending_verification', 'onboarding_pending', 'incomplete_registration', 'registration_submitted'].includes(t.account_status)
        ).length,
        active: therapists.filter((t) => t.account_status === 'active').length,
        rejected: therapists.filter((t) => t.account_status === 'rejected').length,
    };

    const getStatusBadge = (status: string) => {
        if (['active'].includes(status)) {
            return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium">Active</Badge>;
        }
        if (['rejected', 'suspended'].includes(status)) {
            return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 font-medium">Rejected</Badge>;
        }
        return <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200 font-medium">Pending</Badge>;
    };

    const getStageBadge = (stage: string) => {
        const stageMap: Record<string, string> = {
            'account_created': 'Registration',
            'documents': 'License Review',
            'background_check': 'Background Check',
            'final_review': 'Final Review',
            'completed': 'Completed'
        };
        const label = stageMap[stage] || 'Registration';
        return <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 font-medium">{label}</Badge>;
    };

    const getProgressPercentage = (therapist: Therapist) => {
        let progress = 25;
        if (therapist.license_verified) progress = 50;
        if (therapist.background_check_status === 'completed') progress = 75;
        if (therapist.account_status === 'active') progress = 100;
        return progress;
    };

    return (
        <div className="w-full min-h-screen bg-white">
            {/* Header */}
            <div className="border-b border-gray-200 bg-white px-8 py-6">
                <div className="max-w-[1400px] mx-auto">
                    <h1 className="text-2xl font-semibold text-gray-900">Therapist Verification</h1>
                    <p className="text-sm text-gray-500 mt-1">Review and manage therapist applications</p>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    <Card className="border border-gray-200 shadow-sm">
                        <CardContent className="p-6">
                            <div className="text-sm text-gray-500 mb-1">Total Applications</div>
                            <div className="text-3xl font-semibold text-gray-900">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card className="border border-gray-200 shadow-sm">
                        <CardContent className="p-6">
                            <div className="text-sm text-gray-500 mb-1">Pending Review</div>
                            <div className="text-3xl font-semibold text-gray-900">{stats.pending}</div>
                        </CardContent>
                    </Card>
                    <Card className="border border-gray-200 shadow-sm">
                        <CardContent className="p-6">
                            <div className="text-sm text-gray-500 mb-1">Active Therapists</div>
                            <div className="text-3xl font-semibold text-gray-900">{stats.active}</div>
                        </CardContent>
                    </Card>
                    <Card className="border border-gray-200 shadow-sm">
                        <CardContent className="p-6">
                            <div className="text-sm text-gray-500 mb-1">Rejected</div>
                            <div className="text-3xl font-semibold text-gray-900">{stats.rejected}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Filter Bar */}
                <div className="flex items-center gap-3 mb-6 bg-white border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 flex-1">
                        <Search className="h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="border-0 shadow-none focus-visible:ring-0 h-8 px-0"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-400" />
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="border-0 shadow-none focus:ring-0 h-8 w-[180px]">
                                <SelectValue placeholder="All Applications" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Applications</SelectItem>
                                <SelectItem value="pending">Pending Review</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Table */}
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-white hover:bg-white border-b border-gray-200">
                                <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Therapist</TableHead>
                                <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">License Info</TableHead>
                                <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Progress</TableHead>
                                <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Status</TableHead>
                                <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Stage</TableHead>
                                <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : filteredTherapists.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                                        No applications found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredTherapists.map((therapist) => {
                                    const progress = getProgressPercentage(therapist);
                                    return (
                                        <TableRow
                                            key={therapist.id}
                                            className="hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                                            onClick={() => {
                                                setSelectedTherapist(therapist);
                                                setIsModalOpen(true);
                                            }}
                                        >
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage src={therapist.profile_image_url} />
                                                        <AvatarFallback className="bg-gray-900 text-white text-sm font-medium">
                                                            {therapist.first_name?.[0]}{therapist.last_name?.[0]}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium text-gray-900">
                                                            {therapist.first_name} {therapist.last_name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">{therapist.email}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-0.5">
                                                    <div className="font-medium text-gray-900">{therapist.license_number || 'N/A'}</div>
                                                    <div className="text-sm text-gray-500">{therapist.license_state || 'N/A'}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm font-medium text-gray-900">{progress}%</div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(therapist.account_status)}</TableCell>
                                            <TableCell>{getStageBadge(therapist.verification_stage || 'account_created')}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => {
                                                            setSelectedTherapist(therapist);
                                                            setIsModalOpen(true);
                                                        }}>
                                                            View Details
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <TherapistVerificationModal
                therapist={selectedTherapist}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onUpdate={handleUpdateTherapist}
            />
        </div>
    );
};

export default TherapistVerificationView;
