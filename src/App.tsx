import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { ClipboardIcon, CheckIcon, SparklesIcon, XCircleIcon, TrashIcon, Cog6ToothIcon, DocumentPlusIcon, ArrowUturnLeftIcon, DocumentArrowUpIcon, CheckBadgeIcon, BanknotesIcon, QueueListIcon, ClockIcon, CheckCircleIcon, CircleStackIcon, ReceiptPercentIcon, ArrowDownTrayIcon } from './components/icons';
import { useLanguage, Language } from './contexts/LanguageContext';

// Interfaces
interface GeneratedItem {
  id: string;
  value: number;
  linkUrl: string;
  isPaid: boolean;
}

interface ExtractedInfo {
  orderNumber: string;
  type: string;
  filledQuantity: string;
  icebergValue: string;
  averagePrice: string;
  conditions: string;
  fee: string;
  total: string;
  creationDate: string;
  updateDate: string;
}

interface OrderTotals {
  filledQuantity: string;
  averagePrice: string;
  fee: string;
  total: string;
}

interface Order {
  id: string; // purchaseOrderCode
  totalAmount: number;
  status: 'pendiente' | 'pagado';
  createdAt: string;
  links: GeneratedItem[];
  extractedData?: ExtractedInfo[];
  executionTotals?: OrderTotals;
  isExecutionRegistered?: boolean;
}

interface ViewState {
    view: 'dashboard' | 'generator' | 'detail' | 'processing' | 'history';
    orderId: string | null;
}

// Helper function for debouncing API calls
const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return function(this: any, ...args: any[]) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
};

// Helper Functions
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
        };
        reader.onerror = error => reject(error);
    });
};

const parseCurrencyValue = (valueStr: string | undefined): { amount: number, currency: string | null } => {
    if (!valueStr) return { amount: 0, currency: null };

    const cleanedStr = valueStr.split('/')[0].trim();
    // Use a non-greedy match for the number part to correctly separate currency
    const match = cleanedStr.match(/^(.*?)(?:\s*([A-Z]{3,}))?$/);

    if (!match) return { amount: 0, currency: null };

    let numberPart = (match[1] || '').trim();
    const currency = match[2] || null;

    if (!numberPart) return { amount: 0, currency: null };

    const lastComma = numberPart.lastIndexOf(',');
    const lastDot = numberPart.lastIndexOf('.');

    // If comma is the last separator, it's the decimal point (European style)
    if (lastComma > lastDot) {
        // e.g., "1.234,56" -> "1234.56"
        numberPart = numberPart.replace(/\./g, '').replace(',', '.');
    } else if (lastDot > lastComma) {
        // If dot is the last separator, it's the decimal point (American style)
        // e.g., "1,234.56" -> "1234.56"
        numberPart = numberPart.replace(/,/g, '');
    }
    // If no separators, or only one type, parseFloat should handle it (e.g., "1234" or "1234.56")
    
    const amount = parseFloat(numberPart);

    return { amount: isNaN(amount) ? 0 : amount, currency };
};

const parseNumericValue = (text: string | undefined): string => {
    if (!text) return '-';
    const match = text.match(/[\d.,]+/);
    return match ? match[0] : '-';
};


// Components
const LinkItem: React.FC<{
  item: GeneratedItem;
  onLinkChange: (id: string, url: string) => void;
  onPaidChange: (id: string, isPaid: boolean) => void;
  onValueChange: (id: string, value: number) => void;
  onDelete: (id: string) => void;
}> = ({ item, onLinkChange, onPaidChange, onValueChange, onDelete }) => {
    const [copied, setCopied] = useState(false);
    const { t } = useLanguage();

    const handleCopy = useCallback(() => {
        if (!item.linkUrl) return;
        navigator.clipboard.writeText(item.linkUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [item.linkUrl]);

    return (
        <div className={`bg-slate-700/50 p-4 rounded-lg flex flex-col transition-all duration-300 hover:bg-slate-700 hover:shadow-lg hover:scale-105 ${item.isPaid ? 'opacity-50 border border-green-500/50' : 'border border-transparent'} relative`}>
            <button 
                onClick={() => onDelete(item.id)}
                className="absolute top-2 right-2 text-slate-500 hover:text-red-400 transition-colors z-10"
                aria-label="Eliminar item"
            >
                <TrashIcon className="w-5 h-5" />
            </button>
            <input
                type="number"
                value={item.value}
                step="0.01"
                onChange={(e) => onValueChange(item.id, parseFloat(e.target.value) || 0)}
                className="font-mono text-lg text-cyan-400 bg-slate-800 border border-slate-600 rounded-md py-2 px-3 w-full mb-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-shadow"
            />
            
            <div className="relative w-full mb-3">
                <input
                    type="text"
                    value={item.linkUrl}
                    onChange={(e) => onLinkChange(item.id, e.target.value)}
                    placeholder={t('pastePaymentLink')}
                    className="w-full bg-slate-800 border border-slate-600 rounded-md py-2 pl-3 pr-10 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-shadow text-sm"
                />
                <button 
                    onClick={handleCopy} 
                    disabled={!item.linkUrl}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-white disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
                    aria-label="Copiar link"
                >
                    {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <ClipboardIcon className="w-5 h-5" />}
                </button>
            </div>

            <div className="flex items-center self-start">
                <input
                    type="checkbox"
                    id={`paid-${item.id}`}
                    checked={item.isPaid}
                    onChange={(e) => onPaidChange(item.id, e.target.checked)}
                    className="h-4 w-4 rounded border-slate-500 bg-slate-800 text-cyan-600 focus:ring-cyan-500"
                />
                <label htmlFor={`paid-${item.id}`} className="ml-2 text-sm text-slate-300">
                    {t('paid')}
                </label>
            </div>
        </div>
    );
};

const ExecutionProcessor: React.FC<{
    order: Order;
    onBack: () => void;
    onSaveData: (orderId: string, data: ExtractedInfo[]) => void;
    onRegister: (orderId: string, totals: OrderTotals) => void;
    formatNumber: (num: number, options?: Intl.NumberFormatOptions) => string;
}> = ({ order, onBack, onSaveData, onRegister, formatNumber }) => {
    const { t } = useLanguage();
    const [files, setFiles] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const initialManualEntryState: ExtractedInfo = {
        orderNumber: '', type: '', filledQuantity: '', icebergValue: '',
        averagePrice: '', conditions: '', fee: '', total: '',
        creationDate: '', updateDate: '',
    };
    const [manualEntryData, setManualEntryData] = useState<ExtractedInfo>(initialManualEntryState);
    
    const extractedData = order.extractedData || [];
    const isRegistered = order.isExecutionRegistered || false;

    const tableHeaders = useMemo(() => [
        { key: 'orderNumber' as keyof ExtractedInfo, label: t('orderNumber') }, { key: 'type' as keyof ExtractedInfo, label: t('type') },
        { key: 'filledQuantity' as keyof ExtractedInfo, label: t('filledQuantity') }, { key: 'icebergValue' as keyof ExtractedInfo, label: t('icebergValue') },
        { key: 'averagePrice' as keyof ExtractedInfo, label: t('averagePrice') }, { key: 'conditions' as keyof ExtractedInfo, label: t('conditions') },
        { key: 'fee' as keyof ExtractedInfo, label: t('fee') }, { key: 'total' as keyof ExtractedInfo, label: t('total') },
        { key: 'creationDate' as keyof ExtractedInfo, label: t('creationDate') }, { key: 'updateDate' as keyof ExtractedInfo, label: t('updateDate') },
    ], [t]);


    const totals = useMemo<OrderTotals | null>(() => {
        if (!extractedData || extractedData.length === 0) return null;

        const totalsData = {
            quantity: 0,
            fees: new Map<string, number>(),
            totals: new Map<string, number>(),
        };

        for (const item of extractedData) {
            const { amount: quantityAmount } = parseCurrencyValue(item.filledQuantity);
            totalsData.quantity += quantityAmount;

            const { amount: feeAmount, currency: feeCurrency } = parseCurrencyValue(item.fee);
            if (feeCurrency) {
                totalsData.fees.set(feeCurrency, (totalsData.fees.get(feeCurrency) || 0) + feeAmount);
            }

            const { amount: totalAmount, currency: totalCurrency } = parseCurrencyValue(item.total);
            if (totalCurrency) {
                totalsData.totals.set(totalCurrency, (totalsData.totals.get(totalCurrency) || 0) + totalAmount);
            }
        }
        
        const filledQuantity = `${formatNumber(totalsData.quantity)} / ${formatNumber(totalsData.quantity)}`;
        const fee = Array.from(totalsData.fees.entries()).map(([curr, val]) => `${formatNumber(val)} ${curr}`).join(', ');
        const total = Array.from(totalsData.totals.entries()).map(([curr, val]) => `${formatNumber(val)} ${curr}`).join(', ');
        
        const mainTotal = totalsData.totals.get('BRL') || 0;
        const averagePrice = totalsData.quantity > 0 ? formatNumber(mainTotal / totalsData.quantity) : '0,00';

        return {
            filledQuantity,
            fee,
            total,
            averagePrice,
        };
    }, [extractedData, formatNumber]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isRegistered || !e.target.files) return;
        setFiles(prevFiles => [...prevFiles, ...Array.from(e.target.files)]);
        e.target.value = ''; // Allow re-selecting the same file
    };
    
    const handleDragEvents = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (isRegistered) return;
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragging(true);
        } else if (e.type === "dragleave") {
            setIsDragging(false);
        }
    };
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (isRegistered) return;
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFiles(prevFiles => [...prevFiles, ...Array.from(e.dataTransfer.files)]);
            e.dataTransfer.clearData();
        }
    };

    const handleRemoveFile = (indexToRemove: number) => {
        if (isRegistered) return;
        setFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    };

    const handleProcessFiles = async () => {
        if (isRegistered || files.length === 0) {
            setError(t('errorSelectFile'));
            return;
        }
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        const filesToProcessCount = files.length;
        
        try {
            const newExtractedData: ExtractedInfo[] = [];
            const geminiPrompt = t('geminiPrompt');

            for (const file of files) {
                if (!file.type.startsWith('image/')) {
                    throw new Error(t('errorFileNotImage', file.name));
                }
                const base64Image = await fileToBase64(file);
                
                const response = await fetch('/api/extract-data', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        base64Image,
                        mimeType: file.type,
                        prompt: geminiPrompt,
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to extract data from server.');
                }

                const extracted = await response.json() as ExtractedInfo[];
                newExtractedData.push(...extracted);
            }
            const allData = [...extractedData, ...newExtractedData];
            onSaveData(order.id, allData);
            setFiles([]);
            setSuccessMessage(t('infoAddedToTable', filesToProcessCount));
            setTimeout(() => setSuccessMessage(null), 4000);
        } catch (e) {
             if (e instanceof Error && e.message.includes('Failed to parse')) {
                setError(t('errorCouldNotParse'));
            } else {
                setError(e instanceof Error ? e.message : t('errorOccurred'));
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = () => {
        if (totals) {
            onRegister(order.id, totals);
        }
    };

    const handleDeleteExtractedItem = (indexToRemove: number) => {
        if (isRegistered) return;
        const updatedData = extractedData.filter((_, index) => index !== indexToRemove);
        onSaveData(order.id, updatedData);
    };

    const handleExtractedItemChange = (
        indexToUpdate: number,
        field: keyof ExtractedInfo,
        value: string
    ) => {
        if (isRegistered) return;
        const updatedData = extractedData.map((item, index) =>
            index === indexToUpdate ? { ...item, [field]: value } : item
        );
        onSaveData(order.id, updatedData);
    };

    const handleManualEntryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isRegistered) return;
        const { name, value } = e.target as { name: keyof ExtractedInfo; value: string };
        setManualEntryData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddManualRecord = () => {
        if (isRegistered) return;
        if (Object.values(manualEntryData).every(val => val.trim() === '')) {
            setError(t('errorFillOneField'));
            return;
        }
        setError(null);
        const newExtractedData = [...extractedData, manualEntryData];
        onSaveData(order.id, newExtractedData);
        setManualEntryData(initialManualEntryState);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-4xl font-bold text-cyan-400">{t('processExecutionTitle')}</h1>
                    <p className="text-slate-400 mt-2 font-mono">{order.id}</p>
                </div>
                <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors duration-200 text-sm py-2 px-4 rounded-md hover:bg-slate-700">
                    <ArrowUturnLeftIcon className="w-5 h-5"/> {t('back')}
                </button>
            </div>

            <div className="space-y-6">
                <div 
                  onDragEnter={handleDragEvents} onDragOver={handleDragEvents}
                  onDragLeave={handleDragEvents} onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isRegistered ? 'bg-slate-800/50 border-slate-700 cursor-not-allowed' : isDragging ? 'border-cyan-400 bg-slate-700/50' : 'border-slate-600 hover:border-slate-500'}`}
                >
                    <DocumentArrowUpIcon className="w-12 h-12 mx-auto text-slate-500"/>
                    <label htmlFor="file-upload" className={`mt-4 block text-sm font-medium text-slate-300 ${!isRegistered && 'cursor-pointer'}`}>
                        {isRegistered ? t('executionRegistered') : <><span className="text-cyan-400 font-semibold">{t('uploadOrDrop').split(' ')[0]}</span> {t('uploadOrDrop').substring(t('uploadOrDrop').indexOf(' ') + 1)}</>}
                    </label>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={handleFileChange} accept="image/*" disabled={isRegistered} />
                    <p className="mt-1 text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
                </div>

                {files.length > 0 && !isRegistered && (
                     <div>
                        <h3 className="text-sm font-semibold text-slate-300 mb-2">{t('selectedFiles')}</h3>
                        <ul className="space-y-2">
                            {files.map((file, index) => (
                                <li key={`${file.name}-${index}-${file.lastModified}`} className="flex items-center justify-between bg-slate-800/70 p-2 rounded-md text-slate-300 text-sm animate-fade-in-down">
                                    <span className="truncate pr-2">{file.name}</span>
                                    <button 
                                        onClick={() => handleRemoveFile(index)} 
                                        className="text-slate-500 hover:text-red-400 transition-colors flex-shrink-0"
                                        aria-label={`Eliminar ${file.name}`}
                                    >
                                        <XCircleIcon className="w-5 h-5" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <button
                    onClick={handleProcessFiles}
                    disabled={isLoading || files.length === 0 || isRegistered}
                    className="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-slate-900 font-bold py-3 px-6 rounded-md transition-all duration-300"
                >
                    {isLoading ? (
                        <><svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>{t('processing')}</>
                    ) : (
                        <><SparklesIcon className="w-5 h-5" />{t('extractInfoFromFiles', files.length)}</>
                    )}
                </button>

                {successMessage && (
                    <div className="flex items-center gap-3 p-3 bg-green-900/50 text-green-300 border border-green-800 rounded-md animate-fade-in-down">
                        <CheckIcon className="w-5 h-5 flex-shrink-0" />
                        <span>{successMessage}</span>
                    </div>
                )}

                {error && (
                    <div className="flex items-center gap-3 p-3 bg-red-900/50 text-red-300 border border-red-800 rounded-md">
                        <XCircleIcon className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}
            </div>

             <div className="mt-8">
                <h2 className="text-2xl font-bold text-slate-300 mb-4">{t('manualEntry')}</h2>
                <div className="bg-slate-900/50 rounded-lg border border-slate-700 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        {tableHeaders.map(({ key, label }) => (
                            <div key={key}>
                                <label htmlFor={key} className="block text-sm font-medium text-slate-400 mb-1">{label}</label>
                                <input
                                    type="text"
                                    id={key}
                                    name={key}
                                    value={manualEntryData[key]}
                                    onChange={handleManualEntryChange}
                                    disabled={isRegistered}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white font-mono placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-shadow disabled:bg-slate-800 disabled:cursor-not-allowed"
                                    placeholder={label}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={handleAddManualRecord}
                            disabled={isRegistered}
                            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-2 px-5 rounded-md transition-all duration-300"
                        >
                            <DocumentPlusIcon className="w-5 h-5" />
                            {t('addRecord')}
                        </button>
                    </div>
                </div>
            </div>

            {extractedData.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-2xl font-bold text-slate-300 mb-4">{t('extractedInfo')}</h2>
                    <div className="bg-slate-900/50 rounded-lg border border-slate-700 overflow-hidden">
                       <div className="overflow-x-auto">
                           <table className="w-full text-left">
                               <thead className="bg-slate-800 text-xs text-slate-400 uppercase tracking-wider">
                                   <tr>
                                       {tableHeaders.map(h => <th key={h.key} scope="col" className="px-4 py-3">{h.label}</th>)}
                                       {!isRegistered && <th scope="col" className="px-4 py-3 text-right">{t('action')}</th>}
                                   </tr>
                               </thead>
                               <tbody className="divide-y divide-slate-700 text-sm">
                                   {extractedData.map((item, index) => (
                                       <tr key={index} className="hover:bg-slate-700/50 group">
                                            {tableHeaders.map(h => (
                                                <td key={h.key} className="px-2 py-1 whitespace-nowrap align-middle">
                                                    <input
                                                        type="text"
                                                        value={item[h.key] || ''}
                                                        onChange={(e) => handleExtractedItemChange(index, h.key, e.target.value)}
                                                        disabled={isRegistered}
                                                        aria-label={`${h.label} for the fila ${index + 1}`}
                                                        className="w-full bg-transparent px-2 py-2 rounded-md text-slate-300 font-mono focus:outline-none focus:bg-slate-700 focus:ring-1 focus:ring-cyan-500 transition-all duration-200 disabled:cursor-not-allowed"
                                                    />
                                                </td>
                                            ))}
                                           {!isRegistered && (
                                                <td className="px-4 py-3 text-right align-middle">
                                                    <button
                                                        onClick={() => handleDeleteExtractedItem(index)}
                                                        className="text-slate-500 hover:text-red-400 transition-colors p-1"
                                                        aria-label="Eliminar registro"
                                                    >
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                </td>
                                           )}
                                       </tr>
                                   ))}
                               </tbody>
                                {totals && (
                                    <tfoot className="bg-slate-800 font-bold border-t-2 border-slate-600">
                                        <tr>
                                            <td className="px-4 py-4 text-slate-300 uppercase">{t('total')}es</td>
                                            <td></td> {/* Tipo */}
                                            <td className="px-4 py-4 text-slate-300 whitespace-nowrap font-mono">{totals.filledQuantity}</td>
                                            <td></td> {/* Iceberg */}
                                            <td className="px-4 py-4 text-slate-300 whitespace-nowrap font-mono">{totals.averagePrice}</td>
                                            <td></td> {/* Condições */}
                                            <td className="px-4 py-4 text-slate-300 whitespace-nowrap font-mono">{totals.fee}</td>
                                            <td className="px-4 py-4 text-slate-300 whitespace-nowrap font-mono">{totals.total}</td>
                                            <td></td> {/* Criação */}
                                            <td></td> {/* Atualização */}
                                            {!isRegistered && <td></td>}
                                        </tr>
                                    </tfoot>
                                )}
                           </table>
                       </div>
                    </div>
                     <div className="mt-8 flex justify-end">
                        <button
                            onClick={handleRegister}
                            disabled={isRegistered}
                            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-md transition-all duration-300"
                        >
                            {isRegistered ? (
                                <><CheckIcon className="w-5 h-5" />{t('executionWasRegistered')}</>
                            ) : (
                                <><CheckBadgeIcon className="w-5 h-5" />{t('registerExecution')}</>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const HistoryView: React.FC<{
    orders: Order[];
    language: Language;
    formatCurrency: (value: number) => string;
}> = ({ orders, language, formatCurrency }) => {
    const { t } = useLanguage();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredOrders = useMemo(() => {
        return orders
            .filter(order => order.isExecutionRegistered && order.executionTotals)
            .filter(order => {
                const orderDateStr = order.createdAt.substring(0, 10);
                if (startDate && orderDateStr < startDate) return false;
                if (endDate && orderDateStr > endDate) return false;
                return true;
            })
            .filter(order => {
                if (!searchTerm.trim()) return true;
                const lowerSearchTerm = searchTerm.toLowerCase();

                const searchIn = [
                    order.id,
                    order.totalAmount.toString(),
                    order.executionTotals?.total,
                    order.executionTotals?.filledQuantity,
                    order.executionTotals?.fee,
                    order.executionTotals?.averagePrice,
                ].filter(Boolean).join(' ').toLowerCase();

                return searchIn.includes(lowerSearchTerm);
            });
    }, [orders, startDate, endDate, searchTerm]);
    
    const handleExportCSV = () => {
        const locale = language === 'pt' ? 'pt-BR' : language === 'en' ? 'en-US' : 'es-CL';
        
        const headers = [
            t('poCode'), t('date'), t('totalAmount'),
            t('totalBRLExec'), t('totalUSDTExec'), t('feeExec'), t('averagePriceHeader'),
        ];
        
        const rows = filteredOrders.map(order => {
            const totals = order.executionTotals!;
            return [
                `"${order.id}"`,
                `"${new Date(order.createdAt).toLocaleString(locale)}"`,
                `"${order.totalAmount.toFixed(2)}"`,
                `"${parseCurrencyValue(totals.total).amount.toFixed(2)}"`,
                `"${parseCurrencyValue(totals.filledQuantity).amount.toFixed(2)}"`,
                `"${parseCurrencyValue(totals.fee).amount.toFixed(2)}"`,
                `"${parseCurrencyValue(totals.averagePrice).amount.toFixed(2)}"`,
            ].join(',');
        });

        const csvContent = "data:text/csv;charset=utf-8," 
            + [headers.join(','), ...rows].join('\n');
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        const timestamp = new Date().toISOString().slice(0, 10);
        link.setAttribute("download", `operaciones_historicas_${timestamp}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="animate-fade-in-down">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-cyan-400">{t('operationsHistory')}</h1>
                <p className="text-slate-400 mt-2">{t('historySubtitle')}</p>
            </div>

            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 mb-6 flex flex-wrap items-end gap-4">
                <div className="flex-grow min-w-[200px]">
                    <label htmlFor="search" className="sr-only">{t('searchPlaceholder')}</label>
                    <input
                        type="text"
                        id="search"
                        placeholder={t('searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-shadow"
                    />
                </div>
                <div className="flex-grow sm:flex-grow-0">
                    <label htmlFor="startDate" className="block text-sm font-medium text-slate-400 mb-1">{t('startDate')}</label>
                    <input
                        type="date"
                        id="startDate"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-shadow"
                    />
                </div>
                <div className="flex-grow sm:flex-grow-0">
                    <label htmlFor="endDate" className="block text-sm font-medium text-slate-400 mb-1">{t('endDate')}</label>
                    <input
                        type="date"
                        id="endDate"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-shadow"
                    />
                </div>
                <div className="self-end">
                    <button
                        onClick={handleExportCSV}
                        disabled={filteredOrders.length === 0}
                        className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition-all duration-300 w-full sm:w-auto"
                    >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        {t('exportToCSV')}
                    </button>
                </div>
            </div>

            <div className="bg-slate-900/50 rounded-lg border border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-max">
                        <thead className="bg-slate-800 text-xs text-slate-400 uppercase tracking-wider">
                            <tr>
                                <th scope="col" className="px-6 py-3">{t('poCode')}</th>
                                <th scope="col" className="px-6 py-3">{t('date')}</th>
                                <th scope="col" className="px-6 py-3 text-right">{t('totalAmount')}</th>
                                <th scope="col" className="px-6 py-3 text-right">{t('totalBRLExec')}</th>
                                <th scope="col" className="px-6 py-3 text-right">{t('totalUSDTExec')}</th>
                                <th scope="col" className="px-6 py-3 text-right">{t('feeExec')}</th>
                                <th scope="col" className="px-6 py-3 text-right">{t('averagePriceHeader')}</th>
                                <th scope="col" className="px-6 py-3 text-center">{t('status')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {filteredOrders.length > 0 ? filteredOrders.map(order => {
                                const totals = order.executionTotals!;
                                const locale = language === 'pt' ? 'pt-BR' : language === 'en' ? 'en-US' : 'es-CL';
                                const formattedAmount = formatCurrency(order.totalAmount);
                                
                                return (
                                    <tr key={order.id} className="hover:bg-slate-700/50 transition-colors text-sm">
                                        <td className="px-6 py-4 font-mono text-cyan-400 whitespace-nowrap">{order.id}</td>
                                        <td className="px-6 py-4 text-slate-300 whitespace-nowrap">{new Date(order.createdAt).toLocaleDateString(locale)}</td>
                                        <td className="px-6 py-4 font-mono text-slate-300 whitespace-nowrap text-right">{formattedAmount}</td>
                                        <td className="px-6 py-4 font-mono text-slate-300 whitespace-nowrap text-right">{parseNumericValue(totals.total)}</td>
                                        <td className="px-6 py-4 font-mono text-slate-300 whitespace-nowrap text-right">{parseNumericValue(totals.filledQuantity)}</td>
                                        <td className="px-6 py-4 font-mono text-slate-300 whitespace-nowrap text-right">{parseNumericValue(totals.fee)}</td>
                                        <td className="px-6 py-4 font-mono text-slate-300 whitespace-nowrap text-right">{parseNumericValue(totals.averagePrice)}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 text-xs font-bold rounded-full capitalize ${order.status === 'pagado' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                                                {t(order.status === 'pagado' ? 'statusPaid' : 'statusPending')}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={8} className="text-center py-10 text-slate-400">
                                        {t('noOperationsFound')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};


const DashboardCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; colorClass: string }> = ({ title, value, icon, colorClass }) => (
    <div className="bg-slate-800/60 p-6 rounded-xl border border-slate-700 flex items-center gap-6 transition-all hover:bg-slate-800 hover:shadow-lg hover:scale-105">
        <div className={`p-3 rounded-full ${colorClass}`}>
            {icon}
        </div>
        <div>
            <p className="text-slate-400 text-sm">{title}</p>
            <p className="text-2xl font-bold text-white font-mono">{value}</p>
        </div>
    </div>
);

const LanguageSwitcher = () => {
    const { language, setLanguage } = useLanguage();

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLanguage(e.target.value as Language);
    };

    return (
        <div className="absolute top-6 right-20 z-10">
            <select
                value={language}
                onChange={handleLanguageChange}
                className="bg-slate-700 border border-slate-600 rounded-md py-1 px-2 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                aria-label="Select language"
            >
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="pt">Português</option>
            </select>
        </div>
    );
};


const App: React.FC = () => {
    const { t, language } = useLanguage();
    const MIN_RANGE = 14000;
    // State for the generator / current view
    const [inputValue, setInputValue] = useState('');
    const [generatedLinks, setGeneratedLinks] = useState<GeneratedItem[]>([]);
    const [purchaseOrderCode, setPurchaseOrderCode] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [configError, setConfigError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [linksToGenerate, setLinksToGenerate] = useState(0);
    const [maxPixValue, setMaxPixValue] = useState(14999);
    const [showConfig, setShowConfig] = useState(false);

    // State for orders management
    const [orders, setOrders] = useState<Order[]>([]);
    const [viewState, setViewState] = useState<ViewState>({ view: 'dashboard', orderId: null });
    const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());

    
    // Debounced function to save order updates to the backend
    const updateOrderInDb = useCallback(
        debounce(async (orderToUpdate: Order) => {
            try {
                const response = await fetch(`/api/orders/${orderToUpdate.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderToUpdate),
                });
                if (!response.ok) {
                    console.error('Failed to save order update to the server.');
                }
            } catch (err) {
                console.error("Error sending order update to server:", err);
            }
        }, 1000), // Debounce updates by 1 second
        []
    );
    
    // Effect to fetch initial data from backend
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch('/api/orders');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data: Order[] = await response.json();
                setOrders(data);
            } catch (error) {
                console.error("Failed to fetch orders:", error);
                setError(t('errorOccurred'));
            }
        };

        fetchOrders();
    }, [t]);

    // Sync UI with selected order data for detail view
    useEffect(() => {
        if (viewState.view === 'detail' && viewState.orderId) {
            const order = orders.find(o => o.id === viewState.orderId);
            if (order) {
                setGeneratedLinks(order.links);
                setInputValue(String(order.totalAmount.toFixed(2)));
                setPurchaseOrderCode(order.id);
            }
        }
    }, [viewState, orders]);


    const calculateLinksToGenerate = (inputVal: string, maxVal: number) => {
        if (inputVal === '' || inputVal.startsWith('0')) {
            return 0;
        }
        const numValue = parseInt(inputVal, 10);
        if (!isNaN(numValue) && numValue > 0 && maxVal > 0) {
            return Math.ceil(numValue / maxVal);
        }
        return 0;
    };
    
    useEffect(() => {
        if (viewState.view === 'generator') {
            const numToGen = calculateLinksToGenerate(inputValue, maxPixValue);
            setLinksToGenerate(numToGen);
        }
    }, [inputValue, maxPixValue, viewState.view]);
    
    const dashboardMetrics = useMemo(() => {
        const metrics = {
            totalOrders: orders.length,
            montoTotalPendiente: 0,
            montoTotalPagado: 0,
            totalBRL: 0,
            totalUSDT: 0,
            totalTaxa: new Map<string, number>(),
        };

        for (const order of orders) {
            const amount = Number(order.totalAmount);
            if (isNaN(amount)) continue;

            if (order.status === 'pendiente') {
                metrics.montoTotalPendiente += amount;
            } else if (order.status === 'pagado') {
                metrics.montoTotalPagado += amount;
            }

            if (order.isExecutionRegistered && order.executionTotals) {
                const { amount: brlAmount } = parseCurrencyValue(order.executionTotals.total);
                metrics.totalBRL += brlAmount;

                const { amount: usdtAmount } = parseCurrencyValue(order.executionTotals.filledQuantity);
                metrics.totalUSDT += usdtAmount;

                const feeParts = order.executionTotals.fee.split(',');
                for (const part of feeParts) {
                    const { amount: feeAmount, currency: feeCurrency } = parseCurrencyValue(part.trim());
                    if(feeCurrency) {
                        metrics.totalTaxa.set(feeCurrency, (metrics.totalTaxa.get(feeCurrency) || 0) + feeAmount);
                    }
                }
            }
        }
        return metrics;
    }, [orders]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        const numValue = parseInt(value, 10);
        if (value && (isNaN(numValue) || numValue <= 0)) {
            setError(t('errorPositiveNumber'));
        } else {
            setError(null);
        }
    };

    const handleMaxPixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === '') {
            setMaxPixValue(MIN_RANGE);
            setConfigError(t('errorValueNotEmpty', MIN_RANGE + 1));
            return;
        }
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue)) {
            if (numValue <= MIN_RANGE) {
                setConfigError(t('errorValueGreaterThan', MIN_RANGE));
                setMaxPixValue(numValue);
            } else {
                setConfigError(null);
                setMaxPixValue(numValue);
            }
        }
    };

    const handleGenerate = useCallback(() => {
        setError(null);
        if (configError) {
            setError(t('errorFixConfig'));
            return;
        }
        setGeneratedLinks([]);
        setIsLoading(true);

        const valorDeEntrada = parseInt(inputValue, 10);

        if (isNaN(valorDeEntrada) || valorDeEntrada <= 0) {
            setError(t('errorInputPositive'));
            setIsLoading(false);
            return;
        }
        
        const numeroDeValores = calculateLinksToGenerate(inputValue, maxPixValue);
        if (numeroDeValores <= 0) {
            setError(t('errorCannotGenerateZero'));
            setIsLoading(false);
            return;
        }

        const poCode = `PO-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        setPurchaseOrderCode(poCode);

        setTimeout(() => {
            let newValues: number[];
            if (numeroDeValores === 1) {
                newValues = [valorDeEntrada];
            } else {
                const baseValue = Math.floor(valorDeEntrada / numeroDeValores);
                const remainder = valorDeEntrada % numeroDeValores;
                newValues = Array(numeroDeValores).fill(baseValue);
                for (let i = 0; i < remainder; i++) {
                    newValues[i]++;
                }
                for (let k = 0; k < numeroDeValores * 2; k++) {
                    const i = Math.floor(Math.random() * numeroDeValores);
                    const j = Math.floor(Math.random() * numeroDeValores);
                    if (i === j) continue;

                    const maxTransfer = Math.floor(newValues[i] * 0.05);
                    if (maxTransfer < 1) continue;
                    const amountToTransfer = Math.floor(Math.random() * maxTransfer) + 1;

                    newValues[i] -= amountToTransfer;
                    newValues[j] += amountToTransfer;
                }
                let isUnique = false;
                let attempts = 0;
                while (!isUnique && attempts < 100) {
                    const seen = new Set();
                    let hasDuplicate = false;
                    for(let i=0; i < newValues.length; i++) {
                        if(seen.has(newValues[i])) {
                            hasDuplicate = true;
                            const j = (i + 1) % newValues.length;
                            newValues[i]++;
                            newValues[j]--;
                            break; 
                        }
                        seen.add(newValues[i]);
                    }
                    if(!hasDuplicate) {
                        isUnique = true;
                    }
                    attempts++;
                }
                const finalSum = newValues.reduce((a, b) => a + b, 0);
                const diff = valorDeEntrada - finalSum;
                if (diff !== 0) {
                    newValues[newValues.length - 1] += diff;
                }
            }
            
            const newItems: GeneratedItem[] = newValues.map((val, index) => ({
                id: `${poCode}-${index}`,
                value: val,
                linkUrl: '',
                isPaid: false,
            }));

            setGeneratedLinks(newItems);
            setIsLoading(false);
        }, 200);

    }, [inputValue, maxPixValue, configError, t]);

    const handleClear = () => {
        setInputValue('');
        setGeneratedLinks([]);
        setError(null);
        setLinksToGenerate(0);
        setPurchaseOrderCode(null);
        setSelectedOrders(new Set());
    };

    const handleSaveOperation = async () => {
        if (!purchaseOrderCode || generatedLinks.length === 0) return;

        const newOrder: Order = {
            id: purchaseOrderCode,
            totalAmount: generatedLinks.reduce((sum, item) => sum + item.value, 0),
            status: 'pendiente',
            createdAt: new Date().toISOString(),
            links: generatedLinks,
        };
        
        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newOrder),
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to save order');
            }
            const savedOrder = await response.json();
            setOrders(prevOrders => [savedOrder, ...prevOrders]);
            handleClear();
        } catch(e) {
            setError(e instanceof Error ? e.message : 'Failed to register operation.');
        }
    };

    const handleBackToList = () => {
        setViewState({ view: 'generator', orderId: null });
        handleClear();
    };

    const updateOrder = (orderId: string, updatedFields: Partial<Order>) => {
        let updatedOrder: Order | undefined;
        setOrders(prevOrders => {
            const newOrders = prevOrders.map(order => {
                if (order.id === orderId) {
                    updatedOrder = { ...order, ...updatedFields };
                    return updatedOrder;
                }
                return order;
            });
            if (updatedOrder) {
                updateOrderInDb(updatedOrder);
            }
            return newOrders;
        });
    };

    const handleLinkChange = (id: string, url: string) => {
        const orderId = viewState.orderId;
        if (!orderId) {
            setGeneratedLinks(prev => prev.map(item => item.id === id ? { ...item, linkUrl: url } : item));
            return;
        }
        const orderToUpdate = orders.find(o => o.id === orderId);
        if (!orderToUpdate) return;
        
        const updatedLinks = orderToUpdate.links.map(l => l.id === id ? {...l, linkUrl: url} : l);
        updateOrder(orderId, { links: updatedLinks });
    };

    const handlePaidChange = (id: string, isPaid: boolean) => {
        const orderId = viewState.orderId;
        if (!orderId) {
            setGeneratedLinks(prev => prev.map(item => item.id === id ? { ...item, isPaid } : item));
            return;
        }
        const orderToUpdate = orders.find(o => o.id === orderId);
        if (!orderToUpdate) return;

        const updatedLinks = orderToUpdate.links.map(l => l.id === id ? { ...l, isPaid } : l);
        const allPaid = updatedLinks.every(l => l.isPaid);

        updateOrder(orderId, { links: updatedLinks, status: allPaid ? 'pagado' : 'pendiente' });
    };

    const handleValueChange = (id: string, value: number) => {
        const orderId = viewState.orderId;
        const updateAndRecalculate = (links: GeneratedItem[]) => {
            const newLinks = links.map(l => l.id === id ? { ...l, value } : l);
            const newTotal = newLinks.reduce((sum, item) => sum + item.value, 0);
            return { newLinks, newTotal };
        };

        if (!orderId) {
            const { newLinks, newTotal } = updateAndRecalculate(generatedLinks);
            setGeneratedLinks(newLinks);
            setInputValue(String(newTotal.toFixed(2)));
            return;
        }

        const orderToUpdate = orders.find(o => o.id === orderId);
        if (!orderToUpdate) return;
        const { newLinks, newTotal } = updateAndRecalculate(orderToUpdate.links);
        updateOrder(orderId, { links: newLinks, totalAmount: newTotal });
    };
    
    const handleDeleteItem = (id: string) => {
        const orderId = viewState.orderId;
        if (!orderId) {
            const newLinks = generatedLinks.filter(item => item.id !== id);
            if (newLinks.length === 0) {
                handleClear();
            } else {
                const newTotal = newLinks.reduce((sum, item) => sum + item.value, 0);
                setInputValue(String(newTotal.toFixed(2)));
                setGeneratedLinks(newLinks);
            }
            return;
        }
        const orderToUpdate = orders.find(o => o.id === orderId);
        if (!orderToUpdate) return;
        
        const updatedLinks = orderToUpdate.links.filter(item => item.id !== id);
        const newTotal = updatedLinks.reduce((sum, item) => sum + item.value, 0);
        updateOrder(orderId, { links: updatedLinks, totalAmount: newTotal });
    };

    const handleSaveExtractedData = (orderId: string, data: ExtractedInfo[]) => {
        updateOrder(orderId, { extractedData: data });
    };

    const handleRegisterExecution = (orderId: string, totals: OrderTotals) => {
        updateOrder(orderId, { executionTotals: totals, isExecutionRegistered: true });
    };

    const handleToggleSelectOrder = (orderId: string) => {
        setSelectedOrders(prevSelected => {
            const newSelected = new Set(prevSelected);
            if (newSelected.has(orderId)) {
                newSelected.delete(orderId);
            } else {
                newSelected.add(orderId);
            }
            return newSelected;
        });
    };

    const handleToggleSelectAll = () => {
        if (selectedOrders.size === orders.length) {
            setSelectedOrders(new Set());
        } else {
            setSelectedOrders(new Set(orders.map(o => o.id)));
        }
    };

    const handleDeleteSelectedOrders = async () => {
        const idsToDelete = Array.from(selectedOrders);
        if (idsToDelete.length === 0) return;

        if (!window.confirm(t('confirmDeleteSelectedOrders', idsToDelete.length))) {
            return;
        }

        try {
            const response = await fetch('/api/orders/bulk-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: idsToDelete }),
            });

            if (!response.ok) {
                 const errorData = await response.json().catch(() => ({ error: 'An unknown error occurred during deletion.' }));
                 throw new Error(errorData.error || `Failed to delete orders. Status: ${response.status}`);
            }
            
            setOrders(prev => prev.filter(order => !selectedOrders.has(order.id)));
            setSelectedOrders(new Set());

        } catch(e) {
            setError(e instanceof Error ? e.message : 'Failed to delete operations.');
            setTimeout(() => setError(null), 5000);
        }
    };

    const currentOrder = viewState.orderId ? orders.find(o => o.id === viewState.orderId) : null;
    
    const formatCurrency = useCallback((value: number, options?: Intl.NumberFormatOptions) => {
        const locale = language === 'pt' ? 'pt-BR' : language === 'en' ? 'en-US' : 'es-CL';
        const formatter = new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            ...options
        });
        
        try {
            // Modern approach using formatToParts for robustness
            const parts = formatter.formatToParts(value);
            const currencyPart = parts.find(p => p.type === 'currency');
            
            // If the currency symbol/code is 'CLP', replace it with just '$'
            if (currencyPart && currencyPart.value.includes('CLP')) {
                currencyPart.value = '$';
            }
            
            return parts.map(p => p.value).join('');
        } catch (e) {
            // Fallback for older environments
            const formatted = formatter.format(value);
            return formatted.replace(/CLP\s*/, '$');
        }
    }, [language]);

    const formatNumber = useCallback((value: number, options?: Intl.NumberFormatOptions) => {
        const locale = language === 'pt' ? 'pt-BR' : language === 'en' ? 'en-US' : 'es-CL';
        return new Intl.NumberFormat(locale, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            ...options
        }).format(value);
    }, [language]);

    const formatTaxa = useCallback((taxaMap: Map<string, number>): string => {
        if (taxaMap.size === 0) return formatNumber(0);
        return Array.from(taxaMap.entries())
            .map(([currency, value]) => `${formatNumber(value, { maximumFractionDigits: 4 })} ${currency}`)
            .join(', ');
    }, [language, formatNumber]);


    const renderContent = () => {
        switch (viewState.view) {
            case 'history':
                return <HistoryView orders={orders} language={language} formatCurrency={formatCurrency} />;
            case 'processing':
                return currentOrder && (
                    <ExecutionProcessor 
                        order={currentOrder} 
                        onBack={handleBackToList} 
                        onSaveData={handleSaveExtractedData}
                        onRegister={handleRegisterExecution}
                        formatNumber={formatNumber}
                    />
                );
            case 'detail':
                return currentOrder && (
                    <>
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-4xl font-bold text-cyan-400">{t('orderDetailTitle')}</h1>
                                <p className="text-slate-400 mt-2 font-mono">{purchaseOrderCode}</p>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="text-slate-400 text-sm font-semibold">{t('totalAmount')}</p>
                                    <p className="text-2xl font-bold text-white font-mono">{formatCurrency(currentOrder.totalAmount)}</p>
                                </div>
                                <button onClick={handleBackToList} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors duration-200 text-sm py-2 px-4 rounded-md hover:bg-slate-700">
                                    <ArrowUturnLeftIcon className="w-5 h-5"/> {t('backToList')}
                                </button>
                            </div>
                        </div>
                        {generatedLinks.length > 0 ? (
                           <div className="max-h-[28rem] overflow-y-auto pr-2 bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {generatedLinks.map((item) => (
                                        <LinkItem 
                                            key={item.id} 
                                            item={item} 
                                            onLinkChange={handleLinkChange} 
                                            onPaidChange={handlePaidChange}
                                            onValueChange={handleValueChange}
                                            onDelete={handleDeleteItem}
                                         />
                                    ))}
                                </div>
                            </div>
                        ) : <p className="text-slate-400 text-center py-8">{t('noLinksInOrder')}</p>}
                    </>
                );
            case 'dashboard':
                 return (
                    <div className="animate-fade-in-down">
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-bold text-cyan-400">{t('dashboardTitle')}</h1>
                            <p className="text-slate-400 mt-2">{t('dashboardSubtitle')}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <DashboardCard title={t('totalOrders')} value={dashboardMetrics.totalOrders} icon={<QueueListIcon className="w-7 h-7"/>} colorClass="bg-blue-500/30 text-blue-300" />
                            <DashboardCard title={t('totalPendingAmount')} value={formatCurrency(dashboardMetrics.montoTotalPendiente)} icon={<ClockIcon className="w-7 h-7"/>} colorClass="bg-yellow-500/30 text-yellow-300" />
                            <DashboardCard title={t('totalPaidAmount')} value={formatCurrency(dashboardMetrics.montoTotalPagado)} icon={<CheckCircleIcon className="w-7 h-7"/>} colorClass="bg-green-500/30 text-green-300" />
                            <DashboardCard title={t('totalBRLExecuted')} value={formatNumber(dashboardMetrics.totalBRL)} icon={<CircleStackIcon className="w-7 h-7"/>} colorClass="bg-indigo-500/30 text-indigo-300" />
                            <DashboardCard title={t('totalUSDTExecuted')} value={formatNumber(dashboardMetrics.totalUSDT)} icon={<BanknotesIcon className="w-7 h-7"/>} colorClass="bg-teal-500/30 text-teal-300" />
                            <DashboardCard title={t('totalFeesPaid')} value={formatTaxa(dashboardMetrics.totalTaxa)} icon={<ReceiptPercentIcon className="w-7 h-7"/>} colorClass="bg-rose-500/30 text-rose-300" />
                        </div>
                    </div>
                 );
            case 'generator':
            default:
                return (
                    <>
                        <div className="text-center mb-6">
                            <h1 className="text-4xl font-bold text-cyan-400">{t('generatorTitle')}</h1>
                            <p className="text-slate-400 mt-2">{t('generatorSubtitle')}</p>
                        </div>
                        
                        {showConfig && (
                            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 mb-6 animate-fade-in-down">
                                <h3 className="text-lg font-bold text-slate-300 mb-3">{t('config')}</h3>
                                <div className="space-y-2">
                                    <label htmlFor="maxPix" className="block text-sm font-medium text-slate-400">{t('maxPixValue')}</label>
                                    <input
                                        type="number"
                                        id="maxPix"
                                        value={maxPixValue}
                                        onChange={handleMaxPixChange}
                                        className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-shadow"
                                        min={MIN_RANGE + 1}
                                    />
                                    <p className="text-xs text-slate-500">{t('maxPixValueDescription')}</p>
                                    {configError && (
                                        <div className="flex items-center gap-2 text-sm text-red-400">
                                            <XCircleIcon className="w-4 h-4 flex-shrink-0" />
                                            <span>{configError}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <input
                                    type="number"
                                    value={inputValue}
                                    onChange={handleInputChange}
                                    placeholder={t('totalAmountPlaceholder')}
                                    className="flex-grow bg-slate-700 border border-slate-600 rounded-md p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-shadow"
                                    min="1"
                                />
                                <button
                                    onClick={handleGenerate}
                                    disabled={isLoading || !inputValue || error !== null || configError !== null}
                                    className="flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-slate-900 font-bold py-3 px-6 rounded-md transition-all duration-300 transform hover:scale-105 disabled:scale-100"
                                >
                                    {isLoading ? (
                                        <><svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>{t('generating')}</>
                                    ) : (
                                        <><SparklesIcon className="w-5 h-5" />{t('generate')}</>
                                    )}
                                </button>
                            </div>

                            {linksToGenerate > 0 && inputValue && !purchaseOrderCode && (
                                <div className="text-center p-3 bg-slate-700/50 rounded-md border border-slate-700">
                                    <p className="text-slate-300">{t('willGenerateLinks')} <strong className="text-cyan-400 font-mono text-lg">{linksToGenerate}</strong> {t('paymentLinks')}</p>
                                </div>
                            )}

                            {error && (
                                <div className="flex items-center gap-3 p-3 bg-red-900/50 text-red-300 border border-red-800 rounded-md">
                                    <XCircleIcon className="w-5 h-5 flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}
                        </div>

                        {generatedLinks.length > 0 && (
                            <div className="mt-8">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-300">{t('generatedResults')}</h2>
                                        {purchaseOrderCode && <p className="text-sm text-slate-400 font-mono">{purchaseOrderCode}</p>}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button onClick={handleSaveOperation} className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-all duration-300">
                                            <DocumentPlusIcon className="w-5 h-5"/>
                                            {t('registerOperation')}
                                        </button>
                                        <button onClick={handleClear} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors duration-200 text-sm">
                                            <TrashIcon className="w-4 h-4"/>
                                            {t('clear')}
                                        </button>
                                    </div>
                                </div>
                                <div className="max-h-[28rem] overflow-y-auto pr-2 bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        {generatedLinks.map((item) => (
                                            <LinkItem 
                                                key={item.id} 
                                                item={item} 
                                                onLinkChange={handleLinkChange} 
                                                onPaidChange={handlePaidChange}
                                                onValueChange={handleValueChange}
                                                onDelete={handleDeleteItem}
                                             />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {orders.length > 0 && (
                            <div className="mt-12">
                                <div className="flex justify-between items-center mb-4">
                                     <h2 className="text-2xl font-bold text-slate-300">{t('registeredOrders')}</h2>
                                     {selectedOrders.size > 0 && (
                                        <div className="flex items-center gap-4 bg-slate-700/50 p-2 rounded-lg">
                                            <p className="text-sm text-slate-300 px-2">{t('selectedOrdersCount', selectedOrders.size)}</p>
                                            <button
                                                onClick={handleDeleteSelectedOrders}
                                                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-md text-sm transition-colors"
                                                aria-label={t('deleteSelected')}
                                            >
                                                <TrashIcon className="w-5 h-5"/>
                                                <span>{t('deleteSelected')}</span>
                                            </button>
                                        </div>
                                     )}
                                </div>
                                 <div className="bg-slate-900/50 rounded-lg border border-slate-700 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left min-w-max">
                                            <thead className="bg-slate-800 text-xs text-slate-400 uppercase tracking-wider">
                                                <tr>
                                                    <th scope="col" className="px-4 py-3">
                                                        <input
                                                            type="checkbox"
                                                            aria-label="Seleccionar todas las órdenes"
                                                            checked={orders.length > 0 && selectedOrders.size === orders.length}
                                                            onChange={handleToggleSelectAll}
                                                            className="h-4 w-4 rounded border-slate-500 bg-slate-800 text-cyan-600 focus:ring-cyan-500"
                                                        />
                                                    </th>
                                                    <th scope="col" className="px-6 py-3">{t('poCode')}</th>
                                                    <th scope="col" className="px-6 py-3">{t('date')}</th>
                                                    <th scope="col" className="px-6 py-3">{t('totalAmount')}</th>
                                                    <th scope="col" className="px-6 py-3">{t('totalBRLExec')}</th>
                                                    <th scope="col" className="px-6 py-3">{t('totalUSDTExec')}</th>
                                                    <th scope="col" className="px-6 py-3">{t('feeExec')}</th>
                                                    <th scope="col" className="px-6 py-3">{t('status')}</th>
                                                    <th scope="col" className="px-6 py-3">{t('action')}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-700">
                                                {orders.map(order => {
                                                    const totals = order.executionTotals;
                                                    const isRegistered = order.isExecutionRegistered;

                                                    const totalBRL = isRegistered ? parseNumericValue(totals?.total) : '-';
                                                    const totalUSDT = isRegistered ? parseNumericValue(totals?.filledQuantity) : '-';
                                                    const totalTaxa = isRegistered ? parseNumericValue(totals?.fee) : '-';
                                                    
                                                    const formattedAmount = formatCurrency(order.totalAmount);


                                                    return (
                                                        <tr key={order.id} className={`transition-colors ${selectedOrders.has(order.id) ? 'bg-slate-700' : 'hover:bg-slate-800'}`}>
                                                            <td className="px-4 py-4">
                                                                <input
                                                                    type="checkbox"
                                                                    aria-label={`Seleccionar orden ${order.id}`}
                                                                    checked={selectedOrders.has(order.id)}
                                                                    onChange={() => handleToggleSelectOrder(order.id)}
                                                                    className="h-4 w-4 rounded border-slate-500 bg-slate-800 text-cyan-600 focus:ring-cyan-500"
                                                                />
                                                            </td>
                                                            <td onClick={() => setViewState({ view: 'detail', orderId: order.id })} className="px-6 py-4 font-mono text-cyan-400 whitespace-nowrap cursor-pointer">{order.id}</td>
                                                            <td onClick={() => setViewState({ view: 'detail', orderId: order.id })} className="px-6 py-4 text-slate-300 whitespace-nowrap cursor-pointer">{new Date(order.createdAt).toLocaleString(language)}</td>
                                                            <td onClick={() => setViewState({ view: 'detail', orderId: order.id })} className="px-6 py-4 font-mono text-slate-300 whitespace-nowrap cursor-pointer">{formattedAmount}</td>
                                                            <td className="px-6 py-4 font-mono text-slate-300 whitespace-nowrap">{totalBRL}</td>
                                                            <td className="px-6 py-4 font-mono text-slate-300 whitespace-nowrap">{totalUSDT}</td>
                                                            <td className="px-6 py-4 font-mono text-slate-300 whitespace-nowrap">{totalTaxa}</td>
                                                            <td onClick={() => setViewState({ view: 'detail', orderId: order.id })} className="px-6 py-4 cursor-pointer">
                                                                <span className={`px-2 py-1 text-xs font-bold rounded-full capitalize ${order.status === 'pagado' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                                                                    {t(order.status === 'pagado' ? 'statusPaid' : 'statusPending')}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                            {order.status === 'pagado' && (
                                                                order.isExecutionRegistered ? (
                                                                        <button onClick={() => setViewState({ view: 'processing', orderId: order.id })} className="flex items-center gap-2 text-sm text-green-400 hover:text-green-300 font-semibold">
                                                                            <CheckBadgeIcon className="w-5 h-5"/>
                                                                            {t('processed')}
                                                                        </button>
                                                                    ) : (
                                                                        <button onClick={() => setViewState({ view: 'processing', orderId: order.id })} className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 font-semibold">
                                                                            <DocumentArrowUpIcon className="w-5 h-5"/>
                                                                            {t('process')}
                                                                        </button>
                                                                    )
                                                            )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                 </div>
                            </div>
                        )}
                    </>
                );
        }
    }
    
    return (
        <div className="bg-slate-900 text-white min-h-screen flex flex-col items-center p-4 font-sans selection:bg-cyan-500 selection:text-slate-900">
            <main className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-7xl transition-all duration-300 relative">
                 <button onClick={() => setShowConfig(!showConfig)} className="absolute top-6 right-6 text-slate-400 hover:text-cyan-400 transition-colors z-10" aria-label={t('config')}>
                    <Cog6ToothIcon className={`w-7 h-7 transition-transform duration-300 ${showConfig ? 'rotate-90' : ''}`}/>
                </button>
                <LanguageSwitcher />

                <div className="mb-6 border-b border-slate-700">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button
                            onClick={() => { handleClear(); setViewState({ view: 'dashboard', orderId: null }); }}
                            className={`${viewState.view === 'dashboard' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                        >
                            {t('dashboard')}
                        </button>
                         <button
                            onClick={() => { handleClear(); setViewState({ view: 'generator', orderId: null }); }}
                            className={`${viewState.view === 'generator' || viewState.view === 'detail' || viewState.view === 'processing' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                        >
                            {t('purchaseOrderGenerator')}
                        </button>
                        <button
                            onClick={() => setViewState({ view: 'history', orderId: null })}
                            className={`${viewState.view === 'history' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                        >
                            {t('operationsHistory')}
                        </button>
                    </nav>
                </div>
                
                {renderContent()}

            </main>
             <style>{`
                @keyframes fade-in-down { 0% { opacity: 0; transform: translateY(-10px); } 100% { opacity: 1; transform: translateY(0); } }
                .animate-fade-in-down { animation: fade-in-down 0.3s ease-out; }
                .overflow-y-auto::-webkit-scrollbar { width: 8px; }
                .overflow-y-auto::-webkit-scrollbar-track { background: transparent; }
                .overflow-y-auto::-webkit-scrollbar-thumb { background-color: #475569; border-radius: 20px; border: 3px solid #1e293b; }
                .overflow-y-auto::-webkit-scrollbar-thumb:hover { background-color: #64748b; }
                main { max-width: 80rem; }
            `}</style>
        </div>
    );
};

export default App;