import { ObjectId } from "mongodb";
export interface BaseDocumentSchema {
  _id: ObjectId;
  createdAt: Date;
  updatedAt: Date;
  deleted?: boolean;
}
