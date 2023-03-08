interface UserPlan extends BaseUserPlan {
    id: string;
  };
  interface BaseUserPlan {
    title: string;
    type: "generic" | "holiday";
    description?: string;
    startDate: string;
    endDate: string;
    startDateendDate?: string;
  }

export type { UserPlan,BaseUserPlan}