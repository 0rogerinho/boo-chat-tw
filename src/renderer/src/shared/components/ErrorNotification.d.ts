import React from 'react';
interface ErrorNotificationProps {
    error: string | null;
    onClose: () => void;
    duration?: number;
}
export declare const ErrorNotification: React.FC<ErrorNotificationProps>;
interface SuccessNotificationProps {
    message: string | null;
    onClose: () => void;
    duration?: number;
}
export declare const SuccessNotification: React.FC<SuccessNotificationProps>;
export {};
