import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export default function Button({ children, className, ...props }: ButtonProps) {
  return (
    <button
      className={cn('py-1 px-4 text-white bg-green-600 rounded-md ', className)}
      {...props}
    >
      {children}
    </button>
  );
}
