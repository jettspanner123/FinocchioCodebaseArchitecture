import React from "react";
import { View } from "react-native";

import CreateCategoryScreenCardPreviewStaticComponent from "@/Features/CreateCategoryScreen/Components/static/CreateCategoryScreenCardPreviewStaticComponent";
import {
  CreateCategoryScreenBudgetPeriodEnum,
  CreateCategoryScreenTypeEnum,
} from "@/Features/CreateCategoryScreen/Models/CreateCategoryScreenModel";
import type { DashboardCategoryMemberModel } from "@/Features/DashboardScreen/Models/DashboardScreenModel";

interface CreateCategoryScreenReviewStepStaticComponentProps {
  name: string;
  backgroundColor: string;
  amount: string;
  period: CreateCategoryScreenBudgetPeriodEnum;
  type: CreateCategoryScreenTypeEnum;
  members: DashboardCategoryMemberModel[];
}

// Read-only recap of every prior step -- shows the actual Dashboard category
// card design (via CreateCategoryScreenCardPreviewStaticComponent) instead of
// a plain field list, so the user sees exactly what their category will look
// like before creating it. No tap-to-jump, no icon glyph on the card (see
// that component's own comment) -- Previous still works normally to go back
// and edit -- see grilling session 2026-11-02.
export default function CreateCategoryScreenReviewStepStaticComponent({
  name,
  backgroundColor,
  amount,
  period,
  type,
  members,
}: CreateCategoryScreenReviewStepStaticComponentProps): React.JSX.Element {
  return (
    <View style={{ flex: 1 }}>
      <CreateCategoryScreenCardPreviewStaticComponent
        name={name}
        backgroundColor={backgroundColor}
        amount={amount}
        period={period}
        type={type}
        members={members}
      />
    </View>
  );
}
