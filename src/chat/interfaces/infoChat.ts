import { Types } from "mongoose";
import { User } from "src/user/schemas/user.schemas";

export interface IInfoChat {
    _id: Types.ObjectId;
    title?: string;
    logo?: string;
    participants: User[];
};

export interface IChangeInfoChat {
    title?: string;
    participantIds: string[];
}