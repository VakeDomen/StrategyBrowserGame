export interface ReportPacket {
    player_id: string;
    report_read: boolean;
    report_type: string;
    body: string;
}