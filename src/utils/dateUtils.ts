import { format as fnsFormat, formatInTimeZone } from "date-fns-tz";

export const formatToVancouverTime = (
  date: string | Date,
  formatString: string = "yyyy-MM-dd"
) => {
  const vancouverTimeZone = "America/Vancouver";

  // 문자열인 경우 Date 객체로 변환하지 않고 직접 처리
  if (typeof date === "string") {
    // ISO 문자열에서 날짜 부분만 추출 (EditPage처럼)
    if (formatString === "yyyy-MM-dd" && date.includes("T")) {
      return date.substring(0, 10);
    }
    // 그 외의 경우는 date-fns-tz로 처리
    return formatInTimeZone(date, vancouverTimeZone, formatString);
  }

  return formatInTimeZone(date, vancouverTimeZone, formatString);
};
