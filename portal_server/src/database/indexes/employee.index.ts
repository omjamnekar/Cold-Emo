import { IndexSpecification } from "mongodb";

export const EmployeIndex = {
  indexes: [
    { key: { userId: 1 } },
    { key: { "company.name": 1 } as IndexSpecification },
    { key: { "outreach.status": 1 } as IndexSpecification },
  ],
  validator: {
    $jsonSchema: {
      basonType: "object",
      required: ["userId", "company"],
      properties: {
        userId: { bsonType: "objectId" },
        "company.name": { bsonType: "string" },
        "outreach.status": {
          enum: ["new", "email-generated", "contactded", "replied", "ignored"],
        },
      },
    },
  },
};
