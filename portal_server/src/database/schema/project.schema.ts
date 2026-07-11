import { ObjectId } from "mongodb";
import { BaseDocumentSchema } from "./document.schema";

interface User extends BaseDocumentSchema {
  projectId: ObjectId;
  userId: ObjectId;
  fullName: string;
  firstName: string;
  lastName: string;
  title: string;
  department: string;
  seniority: string;
  company: {
    name: string;
    location: string;
  };
  constact: {
    emails: Array<{
      value: string;
      verified: boolean;
      source: string;
    }>;
    phone: string[];
    websites: string[];
  };

  profiles: {
    linkedin: string;
    github: string;
    twitter: string;
    portfolio: string;
  };
  source: {
    provider: string;
    confidences: number;
    discoveredAt: Date;
  };
  ai: {
    summary: string;
    keyword: string[];
    recommended: boolean;
  };
  outreach: {
    status: "new" | "email-generated" | "contacted" | "replied" | "ignored";
    lastEmailId: ObjectId;
    lastContactAt: Date;
  };

  notes: string;
  tags: string[];
}
