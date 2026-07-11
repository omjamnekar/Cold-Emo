import { Collections, CollectionKeys } from "../collections.db";
import { EmployeIndex } from "./employee.index";

export const DatabaseConfiguration = {
  [Collections.EMPLOYEE]: EmployeIndex,
  [Collections.EMAILS]: undefined,
  [Collections.JOBS]: undefined,
  [Collections.PROJECTS]: undefined,
  [Collections.SEARCHLOGS]: undefined,
  [Collections.USER]: undefined,
};
