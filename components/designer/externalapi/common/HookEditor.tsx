import React from 'react';
import { MOCK_JAVA_CLASSES } from './constants';
import { JavaHookConfig } from './types';
import { Settings } from 'lucide-react';

interface HookEditorProps {
    config: JavaHookConfig;
    onChange: (config: JavaHookConfig) => void;
    label?: string;
    showEnableCheckbox?: boolean;
    headerIcon?: boolean;
    texts?: any;
    // New props for inheritance support
    allowInherit?: boolean;
    inheritValue?: boolean; // If true, we are in 'inherit' mode
    onInheritChange?: (inherit: boolean) => void;
}

const HookEditor: React.FC<HookEditorProps> = ({
    config,
    onChange,
    label,
    showEnableCheckbox = true,
    headerIcon = false,
    texts = {},
    allowInherit = false,
    inheritValue = false,
    onInheritChange
}) => {
    const selectedClass = MOCK_JAVA_CLASSES.find(c => c.name === config.className);
    const selectedMethod = selectedClass?.methods.find(m => m.name === config.methodName);

    // Styles
    const selectClass = "w-full appearance-none px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-800 dark:text-white outline-none focus:border-nebula-500 focus:ring-1 focus:ring-nebula-500 transition-all text-sm";
    const selectWrapperClass = "relative";
    const SelectChevron = () => (
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
        </div>
    );

    const renderMethodSelector = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">{texts.javaClass || 'Java Class'}</label>
                    <div className={selectWrapperClass}>
                        <select
                            value={config.className}
                            onChange={(e) => onChange({ ...config, className: e.target.value, methodName: '', args: {} })}
                            className={selectClass}
                        >
                            <option value="">Select Class...</option>
                            {MOCK_JAVA_CLASSES.map(cls => (
                                <option key={cls.name} value={cls.name}>{cls.name}</option>
                            ))}
                        </select>
                        <SelectChevron />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">{texts.method || 'Method'}</label>
                    <div className={selectWrapperClass}>
                        <select
                            value={config.methodName}
                            onChange={(e) => onChange({ ...config, methodName: e.target.value, args: {} })}
                            disabled={!config.className}
                            className={`${selectClass} disabled:opacity-50`}
                        >
                            <option value="">Select Method...</option>
                            {selectedClass?.methods.map(m => (
                                <option key={m.name} value={m.name}>{m.name}</option>
                            ))}
                        </select>
                        <SelectChevron />
                    </div>
                </div>
            </div>

            {selectedMethod && (
                <div className="bg-white dark:bg-gray-900 p-4 rounded-md border border-gray-200 dark:border-gray-700 mt-4">
                    <h4 className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-3">{texts.argsConfig || 'Arguments'}</h4>
                    <div className="space-y-2">
                        {selectedMethod.params.map((param: string) => (
                            <div key={param} className="flex items-center gap-3">
                                <div className="w-32 flex-shrink-0 text-xs font-mono text-blue-600 dark:text-blue-400">{param}</div>
                                <span className="text-gray-400">=</span>
                                <input
                                    type="text"
                                    value={config.args?.[param] || ''}
                                    onChange={(e) => onChange({ ...config, args: { ...config.args, [param]: e.target.value } })}
                                    placeholder="Value or expression..."
                                    className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:border-nebula-500"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className={`rounded-lg ${label ? 'bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 p-6' : ''}`}>

            {/* Header Section */}
            {(label || showEnableCheckbox || allowInherit) && (
                <div className="flex items-center justify-between mb-4">
                    {label && (
                        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                            {headerIcon && <Settings size={16} className="text-nebula-500" />}
                            {label}
                        </h3>
                    )}

                    <div className="flex items-center gap-4">
                        {allowInherit && onInheritChange && (
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={inheritValue}
                                    onChange={(e) => onInheritChange(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-nebula-600 focus:ring-nebula-500"
                                />
                                <span className="text-xs text-gray-500 dark:text-gray-400">Inherit System</span>
                            </label>
                        )}

                        {showEnableCheckbox && !inheritValue && (
                            <label className="flex items-center gap-2 cursor-pointer">
                                <span className="text-xs text-gray-500 dark:text-gray-400">{texts.enableHook || 'Enable'}</span>
                                <input
                                    type="checkbox"
                                    checked={config.enabled}
                                    onChange={(e) => onChange({ ...config, enabled: e.target.checked })}
                                    className="w-4 h-4 rounded border-gray-300 text-nebula-600 focus:ring-nebula-500"
                                />
                            </label>
                        )}
                    </div>
                </div>
            )}

            {/* Content */}
            {inheritValue ? (
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded text-gray-500 text-xs italic">
                    Using system default configuration.
                </div>
            ) : (
                (config.enabled || !showEnableCheckbox) && renderMethodSelector()
            )}
        </div>
    );
};

export default HookEditor;
