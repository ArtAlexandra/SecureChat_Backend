import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { THEME } from './../Theme';
@Schema({
  timestamps: true,
})
export class User {
  @Prop()
  id: string;

  @Prop()
  name: string;

  @Prop()
  nik: string;

  @Prop()
  password: string;

  @Prop()
  theme: THEME;

  @Prop()
  lastVisit: Date;

  public get _id(): any {
    return this.id;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);
