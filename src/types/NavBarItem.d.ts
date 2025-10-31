declare interface NavBarItem {
    key: string;
    label?: string;
    children?: NavBarItem[];
    type: 'item' | 'radio' | 'divider';
    onClick?: () => void;
    isCheck?: boolean;
    isHide?: boolean;
}