export const getMonthName = (montNum) => {
  const months = {
    0: 'Jan',
    1: 'Feb',
    2: 'Mar',
    3: 'Apr',
    4: 'May',
    5: 'Jun',
    6: 'Jul',
    7: 'Aug',
    8: 'Sep',
    9: 'Oct',
    10: 'Nov',
    11: 'Dec',
  };

  return months[montNum];
};

export const QUERY_TYPE = {
  MONTHLY: 'M',
  YEARLY: 'Y',
};