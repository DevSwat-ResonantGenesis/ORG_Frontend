export const formatDate = (input: string | number | Date) => {
  const date = new Date(input);
  return date.toLocaleString();
};
