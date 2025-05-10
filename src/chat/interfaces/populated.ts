import { Types } from "mongoose";

export interface PopulatedUser {
    _id: Types.ObjectId;
    nik: string;
    email: string;
};


export interface PopulatedChat {
    _id: Types.ObjectId;
    participants: PopulatedUser[];
    isGroup: boolean;
    groupName?: string;
    messages: Types.ObjectId[];
    lastMessage?: {
        content: string;
        createdAt: Date;
    };
    createdAt: Date;
    updatedAt: Date;
    __v?: number;
    interlocutor: PopulatedUser;
};
