'use client';

import { useState, useCallback, useRef } from 'react';
import type { ContactImportResponse } from '../../types/crm';
import {
  XMarkIcon,
  CloudArrowUpIcon,
  DocumentTextIcon,
  TableCellsIcon,
  CodeBracketIcon,
  CircleStackIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

type ImportFormat = 'csv' | 'excel' | 'json' | 'sql';
type FieldType = 'text' | 'email' | 'phone' | 'number' | 'boolean' | 'date';

interface ImportField {
  source: string;
  target: string;
  required: boolean;
  type: FieldType;
  sample: string;
}

interface ContactField {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
}

const CONTACT_FIELDS: ContactField[] = [
  { key: 'name', label: 'Full Name', type: 'text', required: true },
  { key: 'email', label: 'Email Address', type: 'email', required: false },
  { key: 'phone', label: 'Phone Number', type: 'phone', required: false },
  { key: 'mobile', label: 'Mobile Number', type: 'phone', required: false },
  { key: 'whatsapp_number', label: 'WhatsApp Number', type: 'phone', required: false },
  { key: 'company', label: 'Company/Organization', type: 'text', required: false },
  { key: 'job_title', label: 'Job Title/Position', type: 'text', required: false },
  { key: 'district', label: 'District', type: 'text', required: false },
  { key: 'village', label: 'Village/Location', type: 'text', required: false },
  { key: 'mobile_money_provider', label: 'Mobile Money Provider', type: 'text', required: false },
  { key: 'mobile_money_number', label: 'Mobile Money Number', type: 'phone', required: false },
  { key: 'preferred_communication_channel', label: 'Preferred Communication', type: 'text', required: false },
  { key: 'primary_language', label: 'Primary Language', type: 'text', required: false },
  { key: 'trust_level', label: 'Trust Level (1-10)', type: 'number', required: false },
  { key: 'has_bank_account', label: 'Has Bank Account', type: 'boolean', required: false },
  { key: 'prefers_cash_transactions', label: 'Prefers Cash', type: 'boolean', required: false },
  { key: 'customer_lifetime_value', label: 'Customer Lifetime Value', type: 'number', required: false },
  { key: 'community_groups', label: 'Community Groups', type: 'text', required: false },
  { key: 'notes', label: 'Notes/Description', type: 'text', required: false },
];

const ContactImportModal = ({ isOpen, onClose, onImport }: {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[]) => Promise<ContactImportResponse>;
}) => {
  const [step, setStep] = useState(1);
  const [importFormat, setImportFormat] = useState<ImportFormat>('csv');
  const [file, setFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<any[]>([]);
  const [fieldMapping, setFieldMapping] = useState<ImportField[]>([]);
  const [preview, setPreview] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [importSummary, setImportSummary] = useState<ContactImportResponse | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleClose = () => {
    if (isProcessing) return;
    setStep(1);
    setImportFormat('csv');
    setFile(null);
    setImportData([]);
    setFieldMapping([]);
    setPreview([]);
    setIsProcessing(false);
    setProgress(0);
    setProgressMessage('');
    setErrors([]);
    setImportSummary(null);
    onClose();
  };

  const parseCSV = (content: string): any[] => {
    try {
      const lines = content.split('\n').filter(line => line.trim());
      if (lines.length < 2) throw new Error('CSV must have at least a header row and one data row');
      
      const parseCSVLine = (line: string): string[] => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        result.push(current.trim());
        return result;
      };
      
      const headers = parseCSVLine(lines[0]).map(h => h.replace(/"/g, '').trim());
      const data = [];
      
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = parseCSVLine(lines[i]).map(v => v.replace(/"/g, '').trim());
        const row: any = {};
        headers.forEach((header, index) => {
          const value = values[index] || '';
          row[header] = value === 'null' || value === 'NULL' || value === 'undefined' ? '' : value;
        });
        if (row[headers[0]] && row[headers[0]].trim()) {
          data.push(row);
        }
      }
      
      if (data.length === 0) throw new Error('No valid data rows found in CSV');
      return data;
    } catch (error: any) {
      throw new Error(`CSV parsing failed: ${error.message}`);
    }
  };

  const parseSQL = (content: string): any[] => {
    const insertRegex = /INSERT\s+INTO\s+\w+\s*\([^)]+\)\s+VALUES\s*\(([^)]+)\)/gi;
    const data = [];
    let match;
    
    while ((match = insertRegex.exec(content)) !== null) {
      const values = match[1].split(',').map(v => v.trim().replace(/['"`]/g, ''));
      data.push({
        name: values[0] || '',
        email: values[1] || '',
        phone: values[2] || ''
      });
    }
    return data;
  };

  const generateFieldMapping = (sampleRow: any) => {
    const sourceFields = Object.keys(sampleRow);
    const mapping: ImportField[] = sourceFields.map(sourceField => {
      const lowerField = sourceField.toLowerCase().replace(/[^a-z]/g, '');
      let targetField = '';
      
      if (lowerField.includes('fullname') || lowerField === 'name') targetField = 'name';
      else if (lowerField.includes('email')) targetField = 'email';
      else if (lowerField.includes('phone') && !lowerField.includes('mobile')) targetField = 'phone';
      else if (lowerField.includes('mobile')) targetField = 'mobile';
      else if (lowerField.includes('whatsapp')) targetField = 'whatsapp_number';
      else if (lowerField.includes('company') || lowerField.includes('organization')) targetField = 'company';
      else if (lowerField.includes('job') || lowerField.includes('title')) targetField = 'job_title';
      else if (lowerField.includes('district')) targetField = 'district';
      else if (lowerField.includes('village') || lowerField.includes('location')) targetField = 'village';
      else if (lowerField.includes('provider')) targetField = 'mobile_money_provider';
      else if (lowerField.includes('moneynumber')) targetField = 'mobile_money_number';
      else if (lowerField.includes('communication')) targetField = 'preferred_communication_channel';
      else if (lowerField.includes('language')) targetField = 'primary_language';
      else if (lowerField.includes('trust')) targetField = 'trust_level';
      else if (lowerField.includes('bank')) targetField = 'has_bank_account';
      else if (lowerField.includes('cash')) targetField = 'prefers_cash_transactions';
      else if (lowerField.includes('value') || lowerField.includes('clv')) targetField = 'customer_lifetime_value';
      else if (lowerField.includes('group') || lowerField.includes('community')) targetField = 'community_groups';
      else if (lowerField.includes('note') || lowerField.includes('description')) targetField = 'notes';
      
      const targetFieldInfo = CONTACT_FIELDS.find(f => f.key === targetField);
      return {
        source: sourceField,
        target: targetField,
        required: targetFieldInfo?.required || false,
        type: (targetFieldInfo?.type || 'text') as FieldType,
        sample: sampleRow[sourceField] ? String(sampleRow[sourceField]).substring(0, 50) : ''
      };
    });
    setFieldMapping(mapping);
  };

  const handleFileUpload = useCallback(async (uploadedFile: File) => {
    setIsProcessing(true);
    setErrors([]);
    
    try {
      const content = await uploadedFile.text();
      let parsedData: any[] = [];
      
      switch (importFormat) {
        case 'csv':
          parsedData = parseCSV(content);
          break;
        case 'json':
          parsedData = JSON.parse(content);
          if (!Array.isArray(parsedData)) throw new Error('JSON must contain an array of contacts');
          break;
        case 'sql':
          parsedData = parseSQL(content);
          break;
        default:
          throw new Error('Unsupported format');
      }

      if (parsedData.length === 0) throw new Error('No data found in file');
      setImportData(parsedData);
      generateFieldMapping(parsedData[0]);
      setStep(2);
    } catch (error: any) {
      setErrors([`Failed to parse file: ${error?.message || 'Unknown error'}`]);
    } finally {
      setIsProcessing(false);
    }
  }, [importFormat]);

  const generatePreview = () => {
    const mapped = importData.slice(0, 5).map(row => {
      const mappedRow: any = {};
      fieldMapping.forEach(field => {
        if (field.target && field.source) {
          mappedRow[field.target] = row[field.source];
        }
      });
      return mappedRow;
    });
    setPreview(mapped);
    setStep(3);
  };

  const validateData = (): string[] => {
    const validationErrors: string[] = [];
    if (!fieldMapping.some(f => f.target === 'name')) {
      validationErrors.push('Name field is required but not mapped');
    }
    return validationErrors;
  };

  const handleImport = async () => {
    const validationErrors = validateData();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsProcessing(true);
    setProgress(10);
    setProgressMessage('Preparing contact data...');

    try {
      const totalRows = importData.length || 1;
      const mappedData = importData.map((row, index) => {
        const mappedRow: any = {};
        fieldMapping.forEach(field => {
          if (field.target && field.source) {
            let value = row[field.source];
            
            if (typeof value === 'string') {
              value = value.trim();
              if (value === '' || value === 'null' || value === 'NULL' || value === 'undefined') {
                value = null;
              }
            }
            
            if (field.type === 'boolean') {
              value = value === null || value === '' ? false : ['true', '1', 'yes', 'y', 'True', 'TRUE', 'Yes', 'YES'].includes(String(value));
            } else if (field.type === 'number') {
              if (value === null || value === '') {
                value = 0;
              } else {
                const numValue = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
                value = isNaN(numValue) ? 0 : numValue;
              }
            } else if (field.type === 'email' && value) {
              value = String(value).toLowerCase().trim();
              if (!value.includes('@') || !value.includes('.')) value = null;
            } else if (field.type === 'phone' && value) {
              value = String(value).replace(/[^0-9+]/g, '');
            }
            
            mappedRow[field.target] = value;
          }
        });
        
        if (!mappedRow.name || typeof mappedRow.name !== 'string') {
          throw new Error(`Row ${index + 1}: Name is required`);
        }
        mappedRow.name = mappedRow.name.trim();
        
        if (!mappedRow.district && mappedRow.village) mappedRow.district = 'Kampala';
        if (!mappedRow.primary_language) mappedRow.primary_language = 'English';
        if (!mappedRow.preferred_communication_channel) mappedRow.preferred_communication_channel = 'WhatsApp';
        if (mappedRow.trust_level === null || mappedRow.trust_level === 0) mappedRow.trust_level = 5;

        const mappingProgress = Math.round(((index + 1) / totalRows) * 40);
        setProgress(10 + mappingProgress);
        setProgressMessage(`Mapping fields (${index + 1} of ${totalRows})`);
        
        return mappedRow;
      });

      setProgress(60);
      setProgressMessage('Sending contacts to server...');
      const response = await onImport(mappedData);
      setProgress(100);
      setProgressMessage('Import complete!');

      if (response) {
        setImportSummary(response);
        setStep(4);
      }
    } catch (error: any) {
      console.error('Import processing error:', error);
      setErrors([`Import processing failed: ${error?.message || 'Unknown error'}`]);
      setProgress(0);
      setProgressMessage('');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const headers = CONTACT_FIELDS.map(field => field.label).join(',');
    const sampleData = [
      'John Doe,john@example.com,+256701234567,+256701234567,+256701234567,Tech Solutions Ltd,Sales Manager,Kampala,Nakawa,MTN Mobile Money,+256701234567,WhatsApp,English,8,true,false,2500000,"Rotary Club, Business Network",Active customer with high potential'
    ];
    
    const csvContent = [headers, ...sampleData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nexen-crm-import-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between pb-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">
            {step === 4 ? 'Import Summary' : `Import Contacts - Step ${step} of 3`}
          </h3>
          <button onClick={handleClose} disabled={isProcessing} className="text-gray-400 hover:text-gray-600 disabled:opacity-50">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {step <= 3 && (
          <div className="mt-4 mb-6">
            <div className="flex items-center">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center flex-1">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${step >= stepNumber ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 text-gray-400'}`}>
                    {step > stepNumber ? <CheckCircleIcon className="h-5 w-5" /> : stepNumber}
                  </div>
                  {stepNumber < 3 && <div className={`w-full h-1 mx-2 ${step > stepNumber ? 'bg-indigo-600' : 'bg-gray-300'}`} />}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Choose Format & Upload</span>
              <span>Map Fields</span>
              <span>Preview & Import</span>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">{progressMessage}</span>
              <span className="text-sm font-medium text-indigo-600">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Select Import Format</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { key: 'csv', label: 'CSV File', icon: DocumentTextIcon, desc: 'Comma separated values' },
                  { key: 'excel', label: 'Excel File', icon: TableCellsIcon, desc: 'Microsoft Excel (.xlsx)' },
                  { key: 'json', label: 'JSON File', icon: CodeBracketIcon, desc: 'JavaScript Object Notation' },
                  { key: 'sql', label: 'SQL File', icon: CircleStackIcon, desc: 'SQL INSERT statements' }
                ].map((format) => (
                  <button key={format.key} onClick={() => setImportFormat(format.key as ImportFormat)}
                    className={`p-4 border-2 rounded-lg text-center transition-all ${importFormat === format.key ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:border-gray-300'}`}>
                    <format.icon className="h-8 w-8 mx-auto mb-2" />
                    <div className="font-medium text-sm">{format.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{format.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Drop your {importFormat.toUpperCase()} file here or click to browse
                    </span>
                    <input ref={fileInputRef} id="file-upload" name="file-upload" type="file" accept={`.${importFormat}`} className="sr-only"
                      onChange={(e) => {
                        const uploadedFile = e.target.files?.[0];
                        if (uploadedFile) {
                          setFile(uploadedFile);
                          handleFileUpload(uploadedFile);
                        }
                      }}
                    />
                  </label>
                  {file && <p className="mt-2 text-sm text-gray-500">Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)</p>}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start">
                <ArrowDownTrayIcon className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-blue-800">Need a template?</h3>
                  <p className="mt-2 text-sm text-blue-700">Download our CSV template with all the Uganda-specific fields and sample data.</p>
                  <button onClick={downloadTemplate} className="mt-3 text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded-md">
                    Download Template
                  </button>
                </div>
              </div>
            </div>

            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Import Errors</h3>
                    <ul className="mt-2 text-sm text-red-700 list-disc pl-5 space-y-1">
                      {errors.map((error, index) => <li key={index}>{error}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Map Your Fields to CRM Fields</h4>
              <p className="text-sm text-gray-600">Found {importData.length} contacts. Map your file columns to the appropriate CRM fields.</p>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {fieldMapping.map((field, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900">{field.source}</div>
                    {field.sample && <div className="text-xs text-gray-500 mt-1">Sample: "{field.sample}"</div>}
                  </div>
                  <div className="text-gray-500">→</div>
                  <div className="flex-1">
                    <select value={field.target}
                      onChange={(e) => {
                        const newMapping = [...fieldMapping];
                        newMapping[index].target = e.target.value;
                        const targetFieldInfo = CONTACT_FIELDS.find(f => f.key === e.target.value);
                        if (targetFieldInfo) {
                          newMapping[index].required = targetFieldInfo.required;
                          newMapping[index].type = targetFieldInfo.type;
                        }
                        setFieldMapping(newMapping);
                      }}
                      className="block w-full text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                      <option value="">-- Skip Field --</option>
                      {CONTACT_FIELDS.map(contactField => (
                        <option key={contactField.key} value={contactField.key}>
                          {contactField.label} {contactField.required ? '*' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between">
              <button onClick={() => setStep(1)} disabled={isProcessing}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
                Back
              </button>
              <button onClick={generatePreview} disabled={isProcessing}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
                Generate Preview
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Preview Your Import</h4>
              <p className="text-sm text-gray-600">Review the first 5 contacts. If everything looks good, proceed with the import.</p>
            </div>

            {preview.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {Object.keys(preview[0]).map((key) => (
                          <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {CONTACT_FIELDS.find(f => f.key === key)?.label || key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {preview.map((row, index) => (
                        <tr key={index}>
                          {Object.values(row).map((value: any, cellIndex) => (
                            <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{String(value)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Ready to Import</h3>
                  <p className="mt-2 text-sm text-blue-700">{importData.length} contacts will be imported with Uganda-specific defaults applied.</p>
                </div>
              </div>
            </div>

            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Validation Errors</h3>
                    <ul className="mt-2 text-sm text-red-700 list-disc pl-5 space-y-1">
                      {errors.map((error, index) => <li key={index}>{error}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <button onClick={() => setStep(2)} disabled={isProcessing}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
                Back to Mapping
              </button>
              <button onClick={handleImport} disabled={isProcessing || errors.length > 0}
                className="px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400">
                {isProcessing ? 'Importing...' : `Import ${importData.length} Contacts`}
              </button>
            </div>
          </div>
        )}

        {step === 4 && importSummary && (
          <div className="space-y-6">
            <div className={`p-4 rounded-lg ${importSummary.success ? 'bg-green-50' : 'bg-yellow-50'}`}>
              <div className="flex">
                <CheckCircleIcon className={`h-5 w-5 ${importSummary.success ? 'text-green-400' : 'text-yellow-400'} flex-shrink-0`} />
                <h3 className={`ml-3 text-sm font-medium ${importSummary.success ? 'text-green-800' : 'text-yellow-800'}`}>{importSummary.message}</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-500">Total Processed</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">{importSummary.results.total_processed}</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-sm text-green-700">✅ Imported</div>
                <div className="text-2xl font-bold text-green-900 mt-1">{importSummary.results.imported}</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm text-blue-700">🔄 Updated</div>
                <div className="text-2xl font-bold text-blue-900 mt-1">{importSummary.results.updated}</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="text-sm text-yellow-700">⏭️ Skipped</div>
                <div className="text-2xl font-bold text-yellow-900 mt-1">{importSummary.results.skipped}</div>
              </div>
            </div>

            {importSummary.results.created_contacts && importSummary.results.created_contacts.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">✅ Successfully Created Contacts ({importSummary.results.created_contacts.length})</h4>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {importSummary.results.created_contacts.slice(0, 10).map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between py-2 px-3 bg-green-50 rounded text-sm">
                      <div>
                        <span className="font-medium text-gray-900">{contact.name}</span>
                        {contact.email && <span className="text-gray-500 ml-2">• {contact.email}</span>}
                        {contact.phone && <span className="text-gray-500 ml-2">• {contact.phone}</span>}
                      </div>
                      <span className="text-xs text-green-600">ID: {contact.id}</span>
                    </div>
                  ))}
                  {importSummary.results.created_contacts.length > 10 && (
                    <div className="text-center text-sm text-gray-500 py-2">... and {importSummary.results.created_contacts.length - 10} more</div>
                  )}
                </div>
              </div>
            )}

            {importSummary.results.duplicate_details && importSummary.results.duplicate_details.length > 0 && (
              <div className="bg-white border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">⏭️ Skipped Duplicates ({importSummary.results.duplicate_details.length})</h4>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {importSummary.results.duplicate_details.slice(0, 10).map((dup, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 px-3 bg-yellow-50 rounded text-sm">
                      <div>
                        <span className="font-medium text-gray-900">{dup.name}</span>
                        <span className="text-gray-500 ml-2">• {dup.duplicate_basis}</span>
                      </div>
                      <span className="text-xs text-yellow-600">Existing ID: {dup.existing_contact_id}</span>
                    </div>
                  ))}
                  {importSummary.results.duplicate_details.length > 10 && (
                    <div className="text-center text-sm text-gray-500 py-2">... and {importSummary.results.duplicate_details.length - 10} more</div>
                  )}
                </div>
              </div>
            )}

            {importSummary.results.errors && importSummary.results.errors.length > 0 && (
              <div className="bg-white border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">❌ Failed Imports ({importSummary.results.errors.length})</h4>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {importSummary.results.errors.slice(0, 10).map((error, idx) => (
                    <div key={idx} className="py-2 px-3 bg-red-50 rounded text-sm">
                      <div className="font-medium text-gray-900">Row {error.row}: {error.name}</div>
                      <div className="text-red-600 text-xs mt-1">{error.error}</div>
                    </div>
                  ))}
                  {importSummary.results.errors.length > 10 && (
                    <div className="text-center text-sm text-gray-500 py-2">... and {importSummary.results.errors.length - 10} more errors</div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button onClick={handleClose} className="px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                Close & View Contacts
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactImportModal;
