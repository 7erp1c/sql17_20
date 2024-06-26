import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type BlogDocument = HydratedDocument<Blog>;
@Schema()
export class Blog {
  @Prop()
  name: string;
  @Prop()
  description: string;
  @Prop()
  websiteUrl: string;
  @Prop()
  createdAt: string;
  @Prop()
  isMembership: boolean;
}
export const BlogSchema = SchemaFactory.createForClass(Blog);
