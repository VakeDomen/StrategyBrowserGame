export interface PlayerPacket {
    id: string;
    user_id: string;
    game_id: string;
    color: number;
    defeated: boolean;
    defeated_at: Date;
}