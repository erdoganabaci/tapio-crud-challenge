interface UserPlan extends BaseUserPlan {
    id: string;
  };
  interface BaseUserPlan {
    user: string;
    title: string;
    description?: string;

  }

export type { UserPlan,BaseUserPlan}