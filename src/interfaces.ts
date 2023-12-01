export interface FarpatchWidget {
    onInit(): void,
    onFocus(element: HTMLElement): void,
    onBlur(element: HTMLElement): void,
}
