import React from "react";
import { summaryCardStyles } from "@/styles/components/summary-card";
import { cn, variant, conditional } from "@/styles";

interface SummaryCardProps {
  title: string;
  value: number;
  highlight?: boolean;
  red?: boolean;
}

export function SummaryCard({ title, value, highlight = false, red = false }: SummaryCardProps) {
  const cardVariant = highlight ? 'highlight' : red ? 'red' : 'default';

  return (
    <div className={cn(
      summaryCardStyles.base,
      variant(cardVariant, summaryCardStyles.variants)
    )}>
      <div className={summaryCardStyles.title}>{title}</div>
      <div
        className={cn(
          summaryCardStyles.value,
          conditional(red, summaryCardStyles.valueRed)
        )}
        style={{ fontFamily: '"Patrick Hand", "Comic Sans MS", cursive' }}
      >
        ${Number(value || 0).toFixed(2)}
      </div>
    </div>
  );
}