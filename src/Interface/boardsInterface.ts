import { IssueTypeEnum } from "../enum";

export interface Column {
  id: string;
  label: string;
  issues?: Issue[];
}

export interface Issue {
  id: number;
  title: string;
  description: string | null;
  columnId: number | null;
  type: IssueTypeEnum;
}
