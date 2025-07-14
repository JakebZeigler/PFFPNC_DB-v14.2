import React, { useState, useCallback, useMemo } from 'react';
import Header from '../components/Header';
import { useToast } from '../components/Toast';
import { useData } from '../context/FirebaseDataContext';
import UploadIcon from '../components/icons/UploadIcon';
import Spinner from '../components/Spinner';
import { ChecksImportResult } from '../types';
import { downloadCSV, objectToCsv } from '../utils/csv';

const Pagination: React.FC<{ currentPage: number, totalPages: number, onPageChange: (page: number) => void }> = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    return (
        <div className="space-x-2">
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 text-sm font-medium text-white bg-brand-red rounded-lg hover:bg-brand-red-dark disabled:bg-gray-400">Previous</button>
            <span className="text-sm text-gray-700 dark:text-gray-400">Page {currentPage} of {totalPages}</span>
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 text-sm font-medium text-white bg-brand-red rounded-lg hover:bg-brand-red-dark disabled:bg-gray-400">Next</button>
        </div>
    );
};

const AdvancedImportsPage: React.FC = () => {
    const { addToast } = useToast();
    const { 
        addDispositionsForPaidsFile, paidsImportHistory, paidDispositionId, setPaidDispositionId, 
        addDispositionsForChecksFile, checksImportHistory, checkDispositionId, setCheckDispositionId,
        paymentDispositions 
    } = useData();
    
    const [paidFiles, setPaidFiles] = useState<File[]>([]);
    const [checkFiles, setCheckFiles] = useState<File[]>([]);
    const [isPaidsImporting, setIsPaidsImporting] = useState(false);
    const [isChecksImporting, setIsChecksImporting] = useState(false);

    const [paidsCurrentPage, setPaidsCurrentPage] = useState(1);
    const [checksCurrentPage, setChecksCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const paginatedPaidsHistory = useMemo(() => {
        const startIndex = (paidsCurrentPage - 1) * itemsPerPage;
        return paidsImportHistory.slice(startIndex, startIndex + itemsPerPage);
    }, [paidsImportHistory, paidsCurrentPage]);
    const totalPaidsPages = Math.ceil(paidsImportHistory.length / itemsPerPage);

    const paginatedChecksHistory = useMemo(() => {
        const startIndex = (checksCurrentPage - 1) * itemsPerPage;
        return checksImportHistory.slice(startIndex, startIndex + itemsPerPage);
    }, [checksImportHistory, checksCurrentPage]);
    const totalChecksPages = Math.ceil(checksImportHistory.length / itemsPerPage);

    const handleFileDrop = (e: React.ChangeEvent<HTMLInputElement>, type: 'paids' | 'checks') => {
        const acceptedFiles = e.target.files;
        if (acceptedFiles && acceptedFiles.length > 0) {
            const expectedType = type === 'paids' ? 'text/plain' : 'text/csv';
            const expectedExt = type === 'paids' ? '.txt' : '.csv';
            const files = Array.from(acceptedFiles);
            const validFiles = files.filter(file => file.type === expectedType || file.name.endsWith(expectedExt));
            
            if (validFiles.length !== files.length) {
                addToast(`Invalid file type detected. Please upload only ${expectedExt} files.`, 'error');
            }
            if (type === 'paids') setPaidFiles(prev => [...prev, ...validFiles]);
            else setCheckFiles(prev => [...prev, ...validFiles]);
        }
        // Reset the input value to allow selecting the same file again
        e.target.value = '';
    };
    
    const readFileAsText = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    };

    const handlePaidsImport = async () => {
        if (!paidFiles || paidFiles.length === 0) {
            addToast('Please select one or more .txt files to import.', 'error');
            return;
        }
        if (!paidDispositionId) {
            addToast('Please select a disposition to use for the import.', 'error');
            return;
        }
        setIsPaidsImporting(true);
        const filesToProcess = await Promise.all(paidFiles.map(async (file) => ({ name: file.name, content: await readFileAsText(file) })));
        addDispositionsForPaidsFile(filesToProcess);
        addToast(`Checks import complete for ${paidFiles.length} file(s).`, 'success');
        setIsPaidsImporting(false);
        setPaidFiles([]);
    };

    const handleChecksImport = async () => {
        if (!checkFiles || checkFiles.length === 0) {
            addToast('Please select one or more .csv files to import.', 'error');
            return;
        }
        if (!checkDispositionId) {
            addToast('Please select a disposition to use for the import.', 'error');
            return;
        }
        setIsChecksImporting(true);
        const filesToProcess = await Promise.all(checkFiles.map(async (file) => ({ name: file.name, content: await readFileAsText(file) })));
        await addDispositionsForChecksFile(filesToProcess);
        addToast(`Credit import complete for ${checkFiles.length} file(s).`, 'success');
        setIsChecksImporting(false);
        setCheckFiles([]);
    };

    const handleDownloadNotFound = (log: ChecksImportResult) => {
        if (!log.notFoundRows || log.notFoundRows.length === 0) {
            addToast("No 'Not Found' records to download for this import.", "info");
            return;
        }
        const csvContent = objectToCsv(log.notFoundRows);
        downloadCSV(csvContent, `not_found_records_${log.fileName}`);
        addToast(`Downloaded ${log.notFoundRows.length} 'not found' records.`, 'success');
    };

    const FileUploader: React.FC<{type: 'paids' | 'checks'}> = ({ type }) => {
        const files = type === 'paids' ? paidFiles : checkFiles;
        const accept = type === 'paids' ? '.txt' : '.csv';
        
        return (
            <>
                 <div 
                    onDragOver={e => e.preventDefault()} 
                    onDrop={e => {
                        e.preventDefault();
                        const input = document.getElementById(`${type}-file-upload`) as HTMLInputElement;
                        if (input) {
                            input.files = e.dataTransfer.files;
                            const event = new Event('change', { bubbles: true });
                            input.dispatchEvent(event);
                        }
                    }}
                    className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-neutral-600 border-dashed rounded-md"
                >
                    <div className="space-y-1 text-center">
                        <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600 dark:text-gray-400">
                            <label htmlFor={`${type}-file-upload`} className="relative cursor-pointer bg-white dark:bg-neutral-800 rounded-md font-medium text-brand-red hover:text-brand-red-dark focus-within:outline-none">
                                <span>Upload file(s)</span>
                                <input id={`${type}-file-upload`} name={`${type}-file-upload`} type="file" className="sr-only" accept={accept} multiple onChange={(e) => handleFileDrop(e, type)} />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-500">{accept.toUpperCase()} format only</p>
                    </div>
                </div>
                 {files.length > 0 && (
                    <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                        <p className="font-semibold">Selected files ({files.length}):</p>
                         <ul className="list-disc list-inside max-h-24 overflow-y-auto bg-gray-50 dark:bg-neutral-700/50 p-2 rounded-md">
                            {files.map((f, i) => <li key={`${f.name}-${i}`}>{f.name}</li>)}
                        </ul>
                    </div>
                )}
            </>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-screen">
            <Header title="Paids Import" />
            <main className="flex-1 p-6 space-y-8 overflow-y-auto">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Checks Import Section (TXT) - Formerly Paids */}
                    <section className="space-y-6">
                        <div className="bg-white dark:bg-neutral-800 shadow-md rounded-lg p-6 space-y-4">
                            <h2 className="text-xl font-semibold">Checks File Import (TXT)</h2>
                            <p className="text-sm">Import .txt files with phone numbers. Filename must include a date (MMDDYYYY). Uses previous sale data.</p>
                             <div className="pt-2">
                                <label htmlFor="paid-disposition-select" className="block text-sm font-medium">Disposition to Use</label>
                                <select id="paid-disposition-select" value={paidDispositionId} onChange={e => setPaidDispositionId(e.target.value)}
                                    className="mt-1 w-full p-2 border border-gray-300 bg-white rounded-md dark:bg-neutral-700 dark:border-neutral-600">
                                    {paymentDispositions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                                <p className="mt-1 text-xs text-gray-500">Default: Ran. Applied to imported checks and the "Mark as Paid" button.</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-neutral-800 shadow-md rounded-lg p-6 space-y-4">
                            <h2 className="text-xl font-semibold">Upload Checks File(s)</h2>
                            <FileUploader type="paids" />
                            <button onClick={handlePaidsImport} disabled={paidFiles.length === 0 || isPaidsImporting}
                                className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-red hover:bg-brand-red-dark disabled:bg-gray-400">
                                {isPaidsImporting ? <><Spinner size="sm" /> <span className="ml-2">Importing...</span></> : `Start Checks Import (${paidFiles.length} files)`}
                            </button>
                        </div>
                        {paidsImportHistory.length > 0 && (
                             <div className="bg-white dark:bg-neutral-800 shadow-md rounded-lg p-6 space-y-4">
                                <h2 className="text-xl font-semibold">Checks Import History</h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-neutral-700 dark:text-gray-400">
                                            <tr><th className="px-4 py-2">Timestamp</th><th className="px-4 py-2">File</th><th className="px-4 py-2">Disp. Date</th><th className="px-4 py-2">Updated</th><th className="px-4 py-2">Not Found</th></tr>
                                        </thead>
                                        <tbody>
                                            {paginatedPaidsHistory.map(log => (
                                                <tr key={log.id} className="border-b dark:border-neutral-700">
                                                    <td className="px-4 py-2">{new Date(log.timestamp).toLocaleString()}</td><td className="px-4 py-2">{log.fileName}</td>
                                                    <td className="px-4 py-2">{log.dispositionDate}</td><td className="px-4 py-2 text-green-500">{log.updatedCount}</td>
                                                    <td className="px-4 py-2 text-yellow-500">{log.notFoundCount}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <Pagination currentPage={paidsCurrentPage} totalPages={totalPaidsPages} onPageChange={setPaidsCurrentPage} />
                            </div>
                        )}
                    </section>
                    
                    {/* Credit File Import Section (CSV) - Formerly Checks */}
                    <section className="space-y-6">
                        <div className="bg-white dark:bg-neutral-800 shadow-md rounded-lg p-6 space-y-4">
                            <h2 className="text-xl font-semibold">Credit File Import (CSV)</h2>
                            <p className="text-sm">Import CSV files. Customers are matched by phone, email, or address. The 'total' column is used for the amount.</p>
                            <div className="pt-2">
                                <label htmlFor="check-disposition-select" className="block text-sm font-medium">Disposition to Use</label>
                                <select id="check-disposition-select" value={checkDispositionId} onChange={e => setCheckDispositionId(e.target.value)}
                                    className="mt-1 w-full p-2 border border-gray-300 bg-white rounded-md dark:bg-neutral-700 dark:border-neutral-600">
                                    {paymentDispositions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                                <p className="mt-1 text-xs text-gray-500">Default: Verified Credit. Applied to imported credit records.</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-neutral-800 shadow-md rounded-lg p-6 space-y-4">
                            <h2 className="text-xl font-semibold">Upload Credit File(s)</h2>
                            <FileUploader type="checks" />
                            <button onClick={handleChecksImport} disabled={checkFiles.length === 0 || isChecksImporting}
                                className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-red hover:bg-brand-red-dark disabled:bg-gray-400">
                                {isChecksImporting ? <><Spinner size="sm" /> <span className="ml-2">Importing...</span></> : `Start Credit Import (${checkFiles.length} files)`}
                            </button>
                        </div>
                        {checksImportHistory.length > 0 && (
                            <div className="bg-white dark:bg-neutral-800 shadow-md rounded-lg p-6 space-y-4">
                                <h2 className="text-xl font-semibold">Credit Import History</h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-neutral-700 dark:text-gray-400">
                                            <tr>
                                                <th className="px-4 py-2">Timestamp</th>
                                                <th className="px-4 py-2">File</th>
                                                <th className="px-4 py-2">Updated</th>
                                                <th className="px-4 py-2">Not Found</th>
                                                <th className="px-4 py-2 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedChecksHistory.map(log => (
                                                <tr key={log.id} className="border-b dark:border-neutral-700">
                                                    <td className="px-4 py-2">{new Date(log.timestamp).toLocaleString()}</td>
                                                    <td className="px-4 py-2">{log.fileName}</td>
                                                    <td className="px-4 py-2 text-green-500">{log.updatedCount}</td>
                                                    <td className="px-4 py-2 text-yellow-500">{log.notFoundCount}</td>
                                                    <td className="px-4 py-2 text-right">
                                                        <button
                                                            onClick={() => handleDownloadNotFound(log)}
                                                            disabled={log.notFoundCount === 0}
                                                            className="font-medium text-blue-600 dark:text-blue-500 hover:underline disabled:text-gray-400 disabled:no-underline"
                                                        >
                                                            Download Not Found
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <Pagination currentPage={checksCurrentPage} totalPages={totalChecksPages} onPageChange={setChecksCurrentPage} />
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
};

export default AdvancedImportsPage;