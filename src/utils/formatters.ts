export const formatPayRate = (payRate: string | number | undefined): string => {
  if (!payRate) return "-";
  return `$${Number(payRate).toFixed(2)}`;
};
