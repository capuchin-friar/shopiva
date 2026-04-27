
export interface Room{
    id: String,
    order_id: String,
    initiator: String,
    participants?: RoomParticipant[],
    last_mssg: String,
    created_at: Date,
    updatedAt: Date
}

export interface Message{
    id: String,
    sender: String,
    room_id: String,
    type: 'text' | 'image' | 'file' | 'system',
    content?: String,
    media: MessageAttachment[],
    read_by: MessageRead,
    createdAt?: Date,
    updatedAt?: Date
}

export interface RoomParticipant {
    id: string;
    room_id: string;
    user_id: string;
    role: 'buyer' | 'seller' | 'admin';
    joined_at: Date;
}

export interface MessageAttachment {
    id: string;
    message_id: string;
    url: string;
    file_type: string;
    size?: number;
    created_at: Date;
}

export interface MessageRead {
    id: string;
    message_id: string;
    user_id: string;
    read_at: Date;
  }