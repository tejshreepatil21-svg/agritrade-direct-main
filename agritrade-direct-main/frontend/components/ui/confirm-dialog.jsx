import React from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';

export function ConfirmDialog({ open, onOpenChange, title, description, confirmText = 'Delete', cancelText = 'Cancel', variant = 'destructive' }) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="sm:max-w-md">
                <AlertDialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${variant === 'destructive'
                            ? 'bg-destructive/10'
                            : 'bg-primary/10'
                            }`}>
                            <AlertTriangle className={`w-6 h-6 ${variant === 'destructive'
                                ? 'text-destructive'
                                : 'text-primary'
                                }`} />
                        </div>
                    </div>
                    <AlertDialogTitle className="text-xl">{title}</AlertDialogTitle>
                    <AlertDialogDescription className="text-base leading-relaxed">
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2 sm:gap-2">
                    <AlertDialogCancel className="mt-0">
                        {cancelText}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        className={variant === 'destructive' ? 'bg-destructive hover:bg-destructive/90' : ''}
                    >
                        {confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

// Hook for imperative usage (similar to window.confirm)
export function useConfirmDialog() {
    const [dialogState, setDialogState] = React.useState({
        open: false,
        title: '',
        description: '',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        variant: 'destructive',
        resolver: null,
    });

    const confirm = React.useCallback((options) => {
        return new Promise((resolve) => {
            setDialogState({
                open: true,
                title: options.title || 'Are you sure?',
                description: options.description || 'This action cannot be undone.',
                confirmText: options.confirmText || 'Delete',
                cancelText: options.cancelText || 'Cancel',
                variant: options.variant || 'destructive',
                resolver: resolve,
            });
        });
    }, []);

    const handleOpenChange = React.useCallback((open) => {
        if (!open && dialogState.resolver) {
            dialogState.resolver(false);
        }
        setDialogState((prev) => ({ ...prev, open }));
    }, [dialogState.resolver]);

    const handleConfirm = React.useCallback(() => {
        if (dialogState.resolver) {
            dialogState.resolver(true);
        }
        setDialogState((prev) => ({ ...prev, open: false }));
    }, [dialogState.resolver]);

    const handleCancel = React.useCallback(() => {
        if (dialogState.resolver) {
            dialogState.resolver(false);
        }
        setDialogState((prev) => ({ ...prev, open: false }));
    }, [dialogState.resolver]);

    const ConfirmDialogComponent = React.useCallback(() => (
        <AlertDialog open={dialogState.open} onOpenChange={handleOpenChange}>
            <AlertDialogContent className="sm:max-w-md">
                <AlertDialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${dialogState.variant === 'destructive'
                            ? 'bg-destructive/10'
                            : 'bg-primary/10'
                            }`}>
                            <AlertTriangle className={`w-6 h-6 ${dialogState.variant === 'destructive'
                                ? 'text-destructive'
                                : 'text-primary'
                                }`} />
                        </div>
                    </div>
                    <AlertDialogTitle className="text-xl">{dialogState.title}</AlertDialogTitle>
                    <AlertDialogDescription className="text-base leading-relaxed">
                        {dialogState.description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2 sm:gap-2">
                    <AlertDialogCancel onClick={handleCancel} className="mt-0">
                        {dialogState.cancelText}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        className={dialogState.variant === 'destructive' ? 'bg-destructive hover:bg-destructive/90' : ''}
                    >
                        {dialogState.confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    ), [dialogState, handleOpenChange, handleConfirm, handleCancel]);

    return { confirm, ConfirmDialog: ConfirmDialogComponent };
}
