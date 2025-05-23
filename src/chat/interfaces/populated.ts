import { Types } from "mongoose";

export interface PopulatedUser {
  _id: Types.ObjectId;
  nik: string;
  email: string;
  image: string;
};


export interface PopulatedChat {
  _id: Types.ObjectId;
  participants: PopulatedUser[];
  messages: Types.ObjectId[];
  isGroup: boolean;
  lastMessage: {
    content: string;
    createdAt: Date;
    _id: Types.ObjectId;
  };
  unreadCount: number;
  interlocutor: PopulatedUser | null;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
};
