import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({required: true})
  email: string;

  @Prop({required: true})
  password: string;

  @Prop()
  fullname: string;

  @Prop()
  refreshToken: string;
    
  @Prop()
  createdAt: Date;
    
  @Prop()
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);