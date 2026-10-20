export type User = { id: string; name: string; email: string };
export type Customer = {
  _id: string; name: string; company: string; email: string; phone: string;
  status: "active" | "inactive" | "lead"; notes: string;
};
export type Deal = {
  _id: string; customerId: Customer | string; title: string; value: number;
  stage: "Lead" | "Qualified" | "Proposal" | "Won" | "Lost"; expectedCloseDate: string;
};
export type Task = {
  _id: string; customerId?: Customer | string | null; dealId?: Deal | string | null;
  title: string; dueDate: string; priority: "Low" | "Medium" | "High"; done: boolean; overdue?: boolean;
};
