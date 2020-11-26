export function formatApostrophe(str: string) {
    if (str.charAt(str.length - 1) === 's') {
        return str + '\'';
    } else {
        return str + '\'s';
    }
}