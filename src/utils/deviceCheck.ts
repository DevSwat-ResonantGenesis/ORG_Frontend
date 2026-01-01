export function deviceIsMobile(): boolean {
    return /Mobi|Android/i.test(navigator.userAgent);
}
