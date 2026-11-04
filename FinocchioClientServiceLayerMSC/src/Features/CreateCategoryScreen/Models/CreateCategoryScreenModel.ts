// Per CODING-RULES.md's Multi-Step Wizard rule: a strongly typed enum tracks
// wizard steps, never hardcoded numbers. Order matters -- it's also the
// forward/backward navigation order.
export enum CreateCategoryScreenStepEnum {
  NAME_AND_APPEARANCE,
  BUDGET,
  TYPE_AND_MEMBERS,
  REVIEW,
}

// Budget reset period -- explicit enum, not an arbitrary interval. Order
// matters: it's also the pill display order on the Budget step.
export enum CreateCategoryScreenBudgetPeriodEnum {
  DAY,
  WEEK,
  MONTH,
  YEAR,
}

// Order matters: it's also the pill display order on the Type step.
export enum CreateCategoryScreenTypeEnum {
  PERSONAL,
  SHARED,
}
