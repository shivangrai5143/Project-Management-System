import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const Toast = ({ toast, onRemove }) => {
    const icons = {
        success: CheckCircle,
        error: AlertCircle,
        warning: AlertTriangle,
        info: Info,
    };

    const styles = {
        success: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400',
        error: 'bg-red-500/20 border-red-500/50 text-red-400',
        warning: 'bg-amber-500/20 border-amber-500/50 text-amber-400',
        info: 'bg-blue-500/20 border-blue-500/50 text-blue-400',
    };

    const Icon = icons[toast.type] || icons.info;

    return (
        <div
            className={`
        flex items-center gap-3 px-4 py-3 rounded-lg border
        backdrop-blur-lg shadow-lg
        animate-slide-in
        ${styles[toast.type] || styles.info}
      `}
        >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
                onClick={() => onRemove(toast.id)}
                className="p-1 rounded hover:bg-white/10 transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

const ToastContainer = ({ toasts, onRemove }) => {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
            {toasts.map(toast => (
                <Toast key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </div>
    );
};

export { Toast, ToastContainer };
export default ToastContainer;
