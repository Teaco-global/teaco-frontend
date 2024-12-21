import { IssueTypeEnum, PriorityEnum } from "../enum";

export interface Column {
  id: string;
  label: string;
  issues?: Issue[];
}

export interface Issue {
  id: number;
  title: string;
  issueCount: number;
  description: string | null;
  columnId: number | null;
  type: IssueTypeEnum;
  priority: PriorityEnum;
  estimatedPoints: number;
}
