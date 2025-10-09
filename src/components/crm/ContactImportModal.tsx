'use client';

import { useState, useCallback, useRef } from 'react';
import { 
  XMarkIcon, 
  CloudArrowUpIcon, 
  DocumentTextIcon,
  TableCellsIcon,
  CodeBracketIcon,
  CircleStackIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface ContactImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any) => void;
}

interface ImportField {
  source: string;
  target: string;
  required: boolean;
  type: 'text' | 'email' | 'phone' | 'number' | 'boolean' | 'date';
  sample?: string;
}

const CONTACT_FIELDS = [
  { key: 'name', label: 'Full Name', required: true, type: 'text' as const },
  { key: 'email', label: 'Email Address', required: false, type: 'email' as const },
  { key: 'phone', label: 'Phone Number', required: false, type: 'phone' as const },
  { key: 'mobile', label: 'Mobile Number', required: false, type: 'phone' as const },
  { key: 'whatsapp_number', label: 'WhatsApp Number', required: false, type: 'phone' as const },
  { key: 'company', label: 'Company/Organization', required: false, type: 'text' as const },
  { key: 'job_title', label: 'Job Title/Position', required: false, type: 'text' as const },
  { key: 'district', label: 'District', required: false, type: 'text' as const },
  { key: 'village', label: 'Village/Location', required: false, type: 'text' as const },
  { key: 'mobile_money_provider', label: 'Mobile Money Provider', required: false, type: 'text' as const },
  { key: 'mobile_money_number', label: 'Mobile Money Number', required: false, type: 'phone' as const },
  { key: 'preferred_communication_channel', label: 'Preferred Communication', required: false, type: 'text' as const },
  { key: 'primary_language', label: 'Primary Language', required: false, type: 'text' as const },
  { key: 'trust_level', label: 'Trust Level (1-10)', required: false, type: 'number' as const },
  { key: 'has_bank_account', label: 'Has Bank Account', required: false, type: 'boolean' as const },
  { key: 'prefers_cash_transactions', label: 'Prefers Cash', required: false, type: 'boolean' as const },
  { key: 'customer_lifetime_value', label: 'Customer Lifetime Value', required: false, type: 'number' as const },
  { key: 'community_groups', label: 'Community Groups', required: false, type: 'text' as const },
  { key: 'notes', label: 'Notes/Description', required: false, type: 'text' as const }
];

const UGANDA_DISTRICTS = [
  'Kampala', 'Wakiso', 'Mukono', 'Jinja', 'Mbale', 'Gulu', 'Mbarara', 'Masaka', 
  'Kasese', 'Lira', 'Soroti', 'Hoima', 'Kabale', 'Arua', 'Kitgum', 'Moroto'
];

const MOBILE_MONEY_PROVIDERS = ['MTN Mobile Money', 'Airtel Money', 'M-Sente', 'Centenary Bank Mobile'];

export default function ContactImportModal({ isOpen, onClose, onImport }: ContactImportModalProps) {
  const [step, setStep] = useState(1);
  const [importFormat, setImportFormat] = useState<'csv' | 'excel' | 'json' | 'sql'>('csv');
  const [file, setFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<any[]>([]);
  const [fieldMapping, setFieldMapping] = useState<ImportField[]>([]);
  const [preview, setPreview] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          if (!Array.isArray(parsedData)) {
            throw new Error('JSON must contain an array of contacts');
          }
          break;
        case 'sql':
          parsedData = parseSQL(content);
          break;
        default:
          throw new Error('Unsupported format');
      }

      if (parsedData.length === 0) {
        throw new Error('No data found in file');
      }

      setImportData(parsedData);
      generateFieldMapping(parsedData[0]);
      setStep(2);
    } catch (error: any) {
      setErrors([`Failed to parse file: ${error?.message || 'Unknown error'}`]);
    } finally {
      setIsProcessing(false);
    }
  }, [importFormat]);

  const parseCSV = (content: string): any[] => {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 2) throw new Error('CSV must have at least a header row and one data row');
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }
    
    return data;
  };

  const parseSQL = (content: string): any[] => {
    // Simple SQL INSERT parser for demo - in production, use a proper SQL parser
    const insertRegex = /INSERT\s+INTO\s+\w+\s*\([^)]+\)\s+VALUES\s*\(([^)]+)\)/gi;
    const data = [];
    let match;
    
    while ((match = insertRegex.exec(content)) !== null) {
      const values = match[1].split(',').map(v => v.trim().replace(/['"`]/g, ''));
      // This is a simplified parser - in production, match with column names
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
      // Smart field matching
      const lowerField = sourceField.toLowerCase();
      let targetField = '';
      
      if (lowerField.includes('name') || lowerField.includes('full_name')) targetField = 'name';
      else if (lowerField.includes('email') || lowerField.includes('mail')) targetField = 'email';
      else if (lowerField.includes('phone') || lowerField.includes('mobile')) targetField = 'phone';
      else if (lowerField.includes('whatsapp')) targetField = 'whatsapp_number';
      else if (lowerField.includes('company') || lowerField.includes('organization')) targetField = 'company';
      else if (lowerField.includes('district') || lowerField.includes('location')) targetField = 'district';
      else if (lowerField.includes('village') || lowerField.includes('address')) targetField = 'village';
      else if (lowerField.includes('momo') || lowerField.includes('mobile_money')) targetField = 'mobile_money_number';
      
      const targetFieldInfo = CONTACT_FIELDS.find(f => f.key === targetField);
      
      return {
        source: sourceField,
        target: targetField,
        required: targetFieldInfo?.required || false,
        type: (targetFieldInfo?.type || 'text') as 'text' | 'email' | 'phone' | 'number' | 'boolean' | 'date',
        sample: sampleRow[sourceField]
      };
    });
    
    setFieldMapping(mapping);
  };

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
    
    fieldMapping.forEach(field => {
      if (field.required && !field.target) {
        validationErrors.push(`Required field "${field.source}" is not mapped`);
      }
    });

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
    try {
      const mappedData = importData.map(row => {
        const mappedRow: any = {};
        fieldMapping.forEach(field => {
          if (field.target && field.source) {
            let value = row[field.source];
            
            // Type conversion and validation
            if (field.type === 'boolean') {
              value = ['true', '1', 'yes', 'y'].includes(String(value).toLowerCase());
            } else if (field.type === 'number') {
              value = parseFloat(value) || 0;
            }
            
            mappedRow[field.target] = value;
          }
        });
        
        // Add defaults for Uganda context
        if (!mappedRow.district && mappedRow.village) {
          mappedRow.district = 'Kampala'; // Default district
        }
        if (!mappedRow.primary_language) {
          mappedRow.primary_language = 'English';
        }
        if (!mappedRow.preferred_communication_channel) {
          mappedRow.preferred_communication_channel = 'WhatsApp';
        }
        
        return mappedRow;
      });

      await onImport(mappedData);
      onClose();
    } catch (error: any) {
      setErrors([`Import failed: ${error?.message || 'Unknown error'}`]);
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
    a.download = `nexen-crm-import-template.csv`;
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
            Import Contacts - Step {step} of 3
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 mb-6">
          <div className="flex items-center">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    step >= stepNumber
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'border-gray-300 text-gray-400'
                  }`}
                >
                  {step > stepNumber ? (
                    <CheckCircleIcon className="h-5 w-5" />
                  ) : (
                    stepNumber
                  )}
                </div>
                {stepNumber < 3 && (
                  <div
                    className={`w-full h-1 mx-2 ${
                      step > stepNumber ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Choose Format & Upload</span>
            <span>Map Fields</span>
            <span>Preview & Import</span>
          </div>
        </div>

        {/* Step 1: File Upload */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Import Format
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { key: 'csv', label: 'CSV File', icon: DocumentTextIcon, desc: 'Comma separated values' },
                  { key: 'excel', label: 'Excel File', icon: TableCellsIcon, desc: 'Microsoft Excel (.xlsx)' },
                  { key: 'json', label: 'JSON File', icon: CodeBracketIcon, desc: 'JavaScript Object Notation' },
                  { key: 'sql', label: 'SQL File', icon: CircleStackIcon, desc: 'SQL INSERT statements' }
                ].map((format) => (
                  <button
                    key={format.key}
                    onClick={() => setImportFormat(format.key as any)}
                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                      importFormat === format.key
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <format.icon className="h-8 w-8 mx-auto mb-2" />
                    <div className="font-medium text-sm">{format.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{format.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* File Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Drop your {importFormat.toUpperCase()} file here or click to browse
                    </span>
                    <input
                      ref={fileInputRef}
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      accept={`.${importFormat}`}
                      className="sr-only"
                      onChange={(e) => {
                        const uploadedFile = e.target.files?.[0];
                        if (uploadedFile) {
                          setFile(uploadedFile);
                          handleFileUpload(uploadedFile);
                        }
                      }}
                    />
                  </label>
                  {file && (
                    <p className="mt-2 text-sm text-gray-500">
                      Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Template Download */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <ArrowDownTrayIcon className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-blue-800">
                    Need a template?
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>Download our CSV template with all the Uganda-specific fields and sample data.</p>
                  </div>
                  <div className="mt-3">
                    <button
                      onClick={downloadTemplate}
                      className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded-md"
                    >
                      Download Template
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Processing State */}
            {isProcessing && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Processing file...</p>
              </div>
            )}

            {/* Errors */}
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Import Errors
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <ul className="list-disc pl-5 space-y-1">
                        {errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Field Mapping */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">
                Map Your Fields to CRM Fields
              </h4>
              <p className="text-sm text-gray-600">
                Found {importData.length} contacts. Map your file columns to the appropriate CRM fields.
              </p>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {fieldMapping.map((field, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900">
                      {field.source}
                    </div>
                    {field.sample && (
                      <div className="text-xs text-gray-500 mt-1">
                        Sample: "{field.sample}"
                      </div>
                    )}
                  </div>
                  <div className="text-gray-500">→</div>
                  <div className="flex-1">
                    <select
                      value={field.target}
                      onChange={(e) => {
                        const newMapping = [...fieldMapping];
                        newMapping[index].target = e.target.value;
                        const targetFieldInfo = CONTACT_FIELDS.find(f => f.key === e.target.value);
                        if (targetFieldInfo) {
                          newMapping[index].required = targetFieldInfo.required;
                          newMapping[index].type = targetFieldInfo.type as 'text' | 'email' | 'phone' | 'number' | 'boolean' | 'date';
                        }
                        setFieldMapping(newMapping);
                      }}
                      className="block w-full text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    >
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
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={generatePreview}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Generate Preview
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Preview & Import */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">
                Preview Your Import
              </h4>
              <p className="text-sm text-gray-600">
                Review the first 5 contacts. If everything looks good, proceed with the import.
              </p>
            </div>

            {preview.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {Object.keys(preview[0]).map((key) => (
                          <th
                            key={key}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {CONTACT_FIELDS.find(f => f.key === key)?.label || key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {preview.map((row, index) => (
                        <tr key={index}>
                          {Object.values(row).map((value: any, cellIndex) => (
                            <td
                              key={cellIndex}
                              className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                            >
                              {String(value)}
                            </td>
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
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Ready to Import
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      {importData.length} contacts will be imported with Uganda-specific defaults applied.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Validation Errors
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <ul className="list-disc pl-5 space-y-1">
                        {errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Back to Mapping
              </button>
              <button
                onClick={handleImport}
                disabled={isProcessing || errors.length > 0}
                className="px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
              >
                {isProcessing ? 'Importing...' : `Import ${importData.length} Contacts`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}