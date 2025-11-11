import { Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { Calendar, AlertTriangle, Ban, User, Edit, CheckCircle, XCircle } from "lucide-solid";
import type { Report } from "./types";
import { getReasonLabel, formatBanDuration } from "./utils";

interface ReportCardProps {
    report: Report;
    onBanUser: (report: Report) => void;
    onEditBan: (report: Report) => void;
    onUnbanUser: (userId: string) => void;
    onDismissReport: (reportId: string) => void;
    isProcessing: boolean;
}

export const ReportCard = (props: ReportCardProps) => {
    const navigate = useNavigate();

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <span class="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">En attente</span>;
            case 'RESOLVED':
                return <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Résolu</span>;
            case 'DISMISSED':
                return <span class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">Rejeté</span>;
            default:
                return null;
        }
    };

    return (
        <div class="border-2 border-gray-200 rounded-xl p-6 hover:border-color-main transition-all">
            <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-4">
                    <div 
                        class="w-12 h-12 rounded-full bg-color-main flex items-center justify-center cursor-pointer hover:bg-color-secondary transition-all"
                        onClick={() => navigate(`/user/${props.report.reportedUser.id}`)}
                    >
                        <User size={24} class="text-white" />
                    </div>
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <h3 
                                class="font-bold text-lg text-color-dark cursor-pointer hover:text-color-main transition-all"
                                onClick={() => navigate(`/user/${props.report.reportedUser.id}`)}
                            >
                                {props.report.reportedUser.username} ({props.report.reportedUser.uniqueReportersCount})
                            </h3>
                            <Show when={props.report.reportedUser.isBanned}>
                                <span class="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">BANNI</span>
                            </Show>
                        </div>
                        <p class="text-xs text-gray-400 mt-1">
                            {props.report.reportedUser.reportedCount} signalement(s)
                        </p>
                    </div>
                </div>
                {getStatusBadge(props.report.status)}
            </div>

            <div class="bg-gray-50 rounded-xl p-4 mb-4">
                <div class="flex items-center gap-2 mb-2">
                    <AlertTriangle size={16} class="text-orange-500" />
                    <span class="font-semibold text-sm text-gray-700">{getReasonLabel(props.report.reason)}</span>
                </div>
                <p class="text-sm text-gray-700">{props.report.description}</p>
                <div class="flex items-center gap-2 mt-3 text-xs text-gray-500">
                    <Calendar size={14} />
                    <span>{new Date(props.report.createdAt).toLocaleDateString('fr-FR')}</span>
                    <span class="mx-2">•</span>
                    <span>Signalé par {props.report.reporterUser.username}</span>
                </div>
            </div>

            <Show when={props.report.reportedUser.isBanned}>
                <div class="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                    <div class="flex items-start gap-3">
                        <Ban size={20} class="text-red-600 mt-0.5" />
                        <div class="flex-1">
                            <p class="text-sm text-red-700 font-semibold mb-1">
                                Ban {formatBanDuration(props.report.reportedUser.bannedAt, props.report.reportedUser.bannedUntil)}
                            </p>
                            <Show when={props.report.reportedUser.bannedReason}>
                                <p class="text-sm text-red-700">
                                    <span class="font-semibold">Raison :</span> {props.report.reportedUser.bannedReason}
                                </p>
                            </Show>
                            <Show when={props.report.reportedUser.bannedUntil}>
                                <p class="text-xs text-red-600 mt-1">
                                    Jusqu'au {new Date(props.report.reportedUser.bannedUntil!).toLocaleDateString('fr-FR')}
                                </p>
                            </Show>
                        </div>
                    </div>
                </div>
            </Show>

            <Show when={props.report.status === 'PENDING'}>
                <div class="flex gap-3">
                    <Show when={!props.report.reportedUser.isBanned}>
                        <button
                            onClick={() => props.onBanUser(props.report)}
                            disabled={props.isProcessing}
                            class="flex-1 bg-red-600 text-white py-2 px-4 rounded-xl font-semibold hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Ban size={18} />
                            Bannir
                        </button>
                    </Show>
                    <Show when={props.report.reportedUser.isBanned}>
                        <button
                            onClick={() => props.onEditBan(props.report)}
                            disabled={props.isProcessing}
                            class="flex-1 bg-orange-600 text-white py-2 px-4 rounded-xl font-semibold hover:bg-orange-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Edit size={18} />
                            Modifier le ban
                        </button>
                        <button
                            onClick={() => props.onUnbanUser(props.report.reportedUser.id)}
                            disabled={props.isProcessing}
                            class="flex-1 bg-green-600 text-white py-2 px-4 rounded-xl font-semibold hover:bg-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <CheckCircle size={18} />
                            Débannir
                        </button>
                    </Show>
                    <button
                        onClick={() => props.onDismissReport(props.report.id)}
                        disabled={props.isProcessing}
                        class="flex-1 border-2 border-gray-300 text-gray-700 py-2 px-4 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <XCircle size={18} />
                        Rejeter
                    </button>
                </div>
            </Show>
        </div>
    );
};