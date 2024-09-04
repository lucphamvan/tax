// get date from DD-MM-YYYY
export const getFromDate = (dateString: string) => {
  const [day, month, year] = dateString.split("-");
  return `${day}/${month}/${year}T00:00:00`;
};

export const getToDate = (dateString: string) => {
  const [day, month, year] = dateString.split("-");
  return `${day}/${month}/${year}T23:59:59`;
};
