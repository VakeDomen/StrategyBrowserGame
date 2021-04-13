export interface ReportPacket {
    id: string;
    player_id: string;
    report_read: boolean;
    report_type: string;
    body: string;
}