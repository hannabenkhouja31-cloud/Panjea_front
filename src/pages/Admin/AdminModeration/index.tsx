import { createSignal, Show, For, onMount, createEffect } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { CheckCircle } from "lucide-solid";
import type { Report, AdminStats } from "./types";
import { StatsCards } from "./StatsCards";
import { ReportsHeader } from "./ReportsHeader";
import { PendingAlert } from "./PendingAlert";
import { ReportCard } from "./ReportCard";
import { BanModal } from "./BanModal";
import { EditBanModal } from "./EditBanModal";
import { user } from "../../../stores/userStore";

export const AdminModeration = () => {
    const navigate = useNavigate();
    const [reports, setReports] = createSignal<Report[]>([]);
    const [isLoading, setIsLoading] = createSignal(true);
    const [filterStatus, setFilterStatus] = createSignal<'all' | 'pending' | 'resolved' | 'dismissed'>('pending');
    const [selectedReport, setSelectedReport] = createSignal<Report | null>(null);
    const [isBanModalOpen, setIsBanModalOpen] = createSignal(false);
    const [isEditBanModalOpen, setIsEditBanModalOpen] = createSignal(false);
    const [banReason, setBanReason] = createSignal("");
    const [isPermanentBan, setIsPermanentBan] = createSignal(false);
    const [banEndDate, setBanEndDate] = createSignal("");
    const [isProcessing, setIsProcessing] = createSignal(false);

    const [stats, setStats] = createSignal<AdminStats>({
        pendingCount: 0,
        resolvedCount: 0,
        bannedUsersCount: 0,
        totalReportsCount: 0,
    });

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const loadStats = async () => {
        try {
            const response = await fetch(`${backendUrl}/admin/stats`, {
                headers: {
                    'x-user-id': user.profile?.id || '',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error("Erreur chargement stats:", error);
        }
    };

    onMount(async () => {
        await loadStats();
        await loadReports();
    });

    const loadReports = async () => {
        setIsLoading(true);
        try {
            await loadStats();
            const response = await fetch(`${backendUrl}/admin/reports`, {
                headers: {
                    'x-user-id': user.profile?.id || '',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setReports(data);
            } else if (response.status === 403) {
                navigate("/voyage", { replace: true });
            }
        } catch (error) {
            console.error("Erreur chargement signalements:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const openBanModal = (report: Report) => {
        setSelectedReport(report);
        setBanReason("");
        setIsPermanentBan(false);
        setBanEndDate("");
        setIsBanModalOpen(true);
    };

    const openEditBanModal = (report: Report) => {
        setSelectedReport(report);
        setIsPermanentBan(!report.reportedUser.bannedUntil);
        setBanEndDate(report.reportedUser.bannedUntil || "");
        setIsEditBanModalOpen(true);
    };

    createEffect(() => {
        if (isPermanentBan()) {
            setBanEndDate("");
        }
    });

    const calculateDuration = () => {
        if (!banEndDate() || isPermanentBan()) return null;
        const end = new Date(banEndDate());
        const now = new Date();
        const diffTime = end.getTime() - now.getTime();
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return days > 0 ? days : null;
    };

    const handleBanUser = async () => {
        if (!banReason().trim() || !selectedReport()) return;
        if (!isPermanentBan() && !banEndDate()) return;

        setIsProcessing(true);
        try {
            const response = await fetch(`${backendUrl}/admin/ban-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user.profile?.id || '',
                },
                body: JSON.stringify({
                    userId: selectedReport()!.reportedUser.id,
                    reason: banReason().trim(),
                    duration: calculateDuration(),
                    bannedUntil: isPermanentBan() ? null : banEndDate(),
                }),
            });

            if (response.ok) {
                setIsBanModalOpen(false);
                await loadReports();
            }
        } catch (error) {
            console.error("Erreur bannissement:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUpdateBan = async () => {
        if (!selectedReport()) return;
        if (!isPermanentBan() && !banEndDate()) return;

        setIsProcessing(true);
        try {
            const response = await fetch(`${backendUrl}/admin/update-ban`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user.profile?.id || '',
                },
                body: JSON.stringify({
                    userId: selectedReport()!.reportedUser.id,
                    duration: calculateDuration(),
                    bannedUntil: isPermanentBan() ? null : banEndDate(),
                }),
            });

            if (response.ok) {
                setIsEditBanModalOpen(false);
                await loadReports();
            }
        } catch (error) {
            console.error("Erreur modification ban:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUnbanUser = async (userId: string) => {
        if (!confirm("Êtes-vous sûr de vouloir débannir cet utilisateur ?")) return;

        setIsProcessing(true);
        try {
            const response = await fetch(`${backendUrl}/admin/unban-user/${userId}`, {
                method: 'PATCH',
                headers: {
                    'x-user-id': user.profile?.id || '',
                },
            });

            if (response.ok) {
                await loadReports();
            }
        } catch (error) {
            console.error("Erreur débannissement:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDismissReport = async (reportId: string) => {
        if (!confirm("Êtes-vous sûr de vouloir rejeter ce signalement ?")) return;

        setIsProcessing(true);
        try {
            const response = await fetch(`${backendUrl}/admin/dismiss-report/${reportId}`, {
                method: 'PATCH',
                headers: {
                    'x-user-id': user.profile?.id || '',
                },
            });

            if (response.ok) {
                await loadReports();
            }
        } catch (error) {
            console.error("Erreur rejet signalement:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    const filteredReports = () => {
        if (filterStatus() === 'all') return reports();
        if (filterStatus() === 'pending') return reports().filter(r => r.status === 'PENDING');
        if (filterStatus() === 'resolved') return reports().filter(r => r.status === 'RESOLVED');
        if (filterStatus() === 'dismissed') return reports().filter(r => r.status === 'DISMISSED');
        return reports();
    };

    const pendingCount = () => reports().filter(r => r.status === 'PENDING').length;

    return (
        <>
            <StatsCards stats={stats()} />

            <ReportsHeader 
                filterStatus={filterStatus} 
                setFilterStatus={setFilterStatus} 
                pendingCount={pendingCount()} 
            />

            <PendingAlert 
                pendingCount={pendingCount()} 
                filterStatus={filterStatus()} 
            />

            <Show
                when={!isLoading()}
                fallback={
                    <div class="flex justify-center py-12">
                        <span class="loading loading-spinner loading-lg text-color-main"></span>
                    </div>
                }
            >
                <Show
                    when={filteredReports().length > 0}
                    fallback={
                        <div class="text-center py-12">
                            <CheckCircle size={48} class="text-gray-300 mx-auto mb-4" />
                            <p class="text-gray-500">Aucun signalement dans cette catégorie</p>
                        </div>
                    }
                >
                    <div class="space-y-4">
                        <For each={filteredReports()}>
                            {(report) => (
                                <ReportCard
                                    report={report}
                                    onBanUser={openBanModal}
                                    onEditBan={openEditBanModal}
                                    onUnbanUser={handleUnbanUser}
                                    onDismissReport={handleDismissReport}
                                    isProcessing={isProcessing()}
                                />
                            )}
                        </For>
                    </div>
                </Show>
            </Show>

            <BanModal
                isOpen={isBanModalOpen}
                onClose={() => setIsBanModalOpen(false)}
                selectedReport={selectedReport}
                banReason={banReason}
                setBanReason={setBanReason}
                isPermanentBan={isPermanentBan}
                setIsPermanentBan={setIsPermanentBan}
                banEndDate={banEndDate}
                setBanEndDate={setBanEndDate}
                onConfirm={handleBanUser}
                isProcessing={isProcessing}
                calculateDuration={calculateDuration}
            />

            <EditBanModal
                isOpen={isEditBanModalOpen}
                onClose={() => setIsEditBanModalOpen(false)}
                selectedReport={selectedReport}
                isPermanentBan={isPermanentBan}
                setIsPermanentBan={setIsPermanentBan}
                banEndDate={banEndDate}
                setBanEndDate={setBanEndDate}
                onConfirm={handleUpdateBan}
                isProcessing={isProcessing}
                calculateDuration={calculateDuration}
            />
        </>
    );
};