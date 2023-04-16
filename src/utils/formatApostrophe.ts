export const formatApostrophe = (str: string) => {
  return str.charAt(str.length - 1) === "s" 
    ? str + "'"
    : str + "'s";
}
