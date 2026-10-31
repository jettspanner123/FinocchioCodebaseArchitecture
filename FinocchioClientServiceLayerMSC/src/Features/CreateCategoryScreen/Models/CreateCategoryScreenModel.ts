// Per CODING-RULES.md's Multi-Step Wizard rule: a strongly typed enum tracks
// wizard steps, never hardcoded numbers. Order matters -- it's also the
// forward/backward navigation order.
export enum CreateCategoryScreenStepEnum {
  NAME_AND_APPEARANCE,
  BUDGET,
  TYPE_AND_MEMBERS,
}
