import { ButtonHTMLAttributes, ReactNode } from 'react';
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
};
export default function Button({ children, className, variant, size, ...props }: ButtonProps): import("react/jsx-runtime").JSX.Element;
export {};
