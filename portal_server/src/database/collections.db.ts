export const Collections = {
  USER: "users",
  PROJECTS: "projects",
  EMPLOYEE: "employees",
  JOBS: "jobs",
  EMAILS: "emails",
  //   dev stuff
  SEARCHLOGS: "searchLogs",
} as const;

export type CollectionKeys = (typeof Collections)[keyof typeof Collections];
