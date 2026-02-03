'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';
import type { Expense, ExpenseStatus, Recurrence } from '@/app/types';
import { expenseStatuses, recurrenceOptions, expenseCategories } from '@/app/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileUp, Table, Loader2 } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Table as UiTable, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { format } from 'date-fns';

interface ExpenseImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (expenses: Omit<Expense, 'id'>[]) => void;
  userCategories: string[];
}

type ParsedExpense = Omit<Expense, 'id'>;
type ParseResult = {
    validExpenses: ParsedExpense[];
    invalidRows: { row: number; data: any; error: string }[];
};

export default function ExpenseImportDialog({ isOpen, onClose, onImport, userCategories }: ExpenseImportDialogProps) {
  const [step, setStep] = useState<'upload' | 'preview'>('upload');
  const [parsedData, setParsedData] = useState<ParseResult | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const resetState = () => {
    setStep('upload');
    setParsedData(null);
    setFileName('');
    setIsLoading(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };
  
  const validateAndParseRow = (row: any, allCategories: string[]): { expense: ParsedExpense | null, error: string | null } => {
      const { title, amount, date, category, status, recurrence, notes } = row;
      
      if (!title || !amount || !date || !category) {
        return { expense: null, error: "Missing required fields (title, amount, date, category)." };
      }

      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return { expense: null, error: `Invalid amount: ${amount}` };
      }

      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return { expense: null, error: `Invalid date format: ${date}. Use YYYY-MM-DD.` };
      }

      if (!allCategories.includes(category)) {
          console.warn(`Category "${category}" not found. It will be imported as is.`);
      }

      const validStatus = (status && expenseStatuses.includes(status as ExpenseStatus)) ? status as ExpenseStatus : 'completed';
      const validRecurrence = (recurrence && recurrenceOptions.includes(recurrence as Recurrence)) ? recurrence as Recurrence : 'one-time';

      return {
          expense: {
            title: String(title),
            amount: parsedAmount,
            date: parsedDate,
            category: String(category),
            status: validStatus,
            recurrence: validRecurrence,
            notes: notes ? String(notes) : '',
          },
          error: null
      };
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setFileName(file.name);
    const allCategories = [...expenseCategories, ...userCategories];

    if (file.name.endsWith('.csv')) {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const validExpenses: ParsedExpense[] = [];
            const invalidRows: { row: number; data: any; error: string }[] = [];

            results.data.forEach((row: any, index) => {
              const { expense, error } = validateAndParseRow(row, allCategories);
              if (error) {
                invalidRows.push({ row: index + 2, data: row, error });
              } else if (expense) {
                validExpenses.push(expense);
              }
            });

            setParsedData({ validExpenses, invalidRows });
            setStep('preview');
            setIsLoading(false);
          },
          error: (error: any) => {
            toast({ variant: 'destructive', title: 'CSV Parse Error', description: error.message });
            setIsLoading(false);
          },
        });
    } else if (file.name.endsWith('.txt')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            if (!text) {
                setIsLoading(false);
                return;
            }

            const validExpenses: ParsedExpense[] = [];
            const invalidRows: { row: number; data: any; error: string }[] = [];
            
            const expenseBlocks = text.split(/^\s*---\s*$/gm).filter(block => block.trim() !== '');

            expenseBlocks.forEach((block, index) => {
                const lines = block.trim().split('\n');
                const row: {[key: string]: string} = {};
                lines.forEach(line => {
                    const parts = line.split(/:/);
                    if (parts.length >= 2) {
                        const key = parts[0].trim();
                        const value = parts.slice(1).join(':').trim();
                        if (key) row[key] = value;
                    }
                });

                const { expense, error } = validateAndParseRow(row, allCategories);
                if (error) {
                    invalidRows.push({ row: index + 1, data: block, error });
                } else if (expense) {
                    validExpenses.push(expense);
                }
            });

            setParsedData({ validExpenses, invalidRows });
            setStep('preview');
            setIsLoading(false);
        };
        reader.readAsText(file);
    } else {
        toast({
            variant: 'destructive',
            title: 'Unsupported File Type',
            description: 'Please upload a .csv or .txt file.',
        });
        setIsLoading(false);
    }
  };

  const handleConfirmImport = () => {
    if (parsedData && parsedData.validExpenses.length > 0) {
      onImport(parsedData.validExpenses);
      toast({
        title: 'Import Successful',
        description: `${parsedData.validExpenses.length} expenses have been added to your list.`,
      });
      handleClose();
    }
  };

  const downloadTemplate = (format: 'csv' | 'txt') => {
    let content: string;
    let filename: string;
    if (format === 'csv') {
        content = "data:text/csv;charset=utf-8," + "title,amount,date,category,status,recurrence,notes\n" + "Example Coffee,2.50,2023-10-27,Food,completed,one-time,Morning coffee";
        filename = "xpns_import_template.csv";
    } else {
        content = "data:text/plain;charset=utf-8," + "title: Example Lunch\namount: 15.75\ndate: 2023-11-21\ncategory: Food\nnotes: With colleagues\n---\ntitle: Movie Tickets\namount: 30.00\ndate: 2023-11-20\ncategory: Entertainment\nstatus: pending";
        filename = "xpns_import_template.txt";
    }
    const encodedUri = encodeURI(content);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-3xl flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Import Expenses</DialogTitle>
          <DialogDescription>
            {step === 'upload' ? 'Upload a CSV or TXT file to bulk-import your expenses.' : 'Review your expenses before importing.'}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground">Parsing your file...</p>
            </div>
        ) : step === 'upload' ? (
          <div className="py-4 space-y-6">
            <div className="space-y-2 p-4 border rounded-lg">
                <h3 className="font-semibold">Instructions</h3>
                <ul className="list-disc list-outside text-sm text-muted-foreground space-y-2 pl-4">
                    <li>The date format must be `YYYY-MM-DD`.</li>
                    <li>Optional fields are: `status`, `recurrence`, `notes`.</li>
                    <li>
                        For **CSV files**, your file must have the headers: `title`, `amount`, `date`, `category`.
                        <Button variant="link" onClick={() => downloadTemplate('csv')} className="p-0 h-auto ml-1">Download CSV template</Button>.
                    </li>
                     <li>
                        For **TXT files**, each expense should be separated by `---` on its own line. Each property should be on a new line in `key: value` format (e.g., `title: My Expense`). Required keys are `title`, `amount`, `date`, `category`.
                        <Button variant="link" onClick={() => downloadTemplate('txt')} className="p-0 h-auto ml-1">Download TXT template</Button>.
                    </li>
                </ul>
            </div>
            <div className="flex items-center justify-center w-full">
              <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/50 hover:bg-secondary">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FileUp className="w-10 h-10 mb-3 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">CSV or TXT file (MAX. 5MB)</p>
                </div>
                <Input id="file-upload" type="file" className="hidden" accept=".csv,.txt" onChange={handleFileChange} />
              </label>
            </div>
          </div>
        ) : (
          parsedData && (
            <div className="flex-1 overflow-hidden flex flex-col gap-4">
                {parsedData.invalidRows.length > 0 && (
                    <Alert variant="destructive">
                        <Table className="h-4 w-4" />
                        <AlertTitle>Found {parsedData.invalidRows.length} invalid rows!</AlertTitle>
                        <AlertDescription>
                            These rows will be skipped. Please check the data format. The most common errors are missing required fields or incorrect date formats.
                        </AlertDescription>
                    </Alert>
                )}
                {parsedData.validExpenses.length > 0 ? (
                    <>
                        <p className="text-sm font-medium">Found <strong className="text-primary">{parsedData.validExpenses.length}</strong> valid expenses to import. Here's a preview:</p>
                        <ScrollArea className="border rounded-md flex-1">
                            <UiTable>
                                <TableHeader className="sticky top-0 bg-secondary">
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Category</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {parsedData.validExpenses.slice(0, 100).map((exp, i) => (
                                        <TableRow key={i}>
                                            <TableCell>{exp.title}</TableCell>
                                            <TableCell>{exp.amount.toFixed(2)}</TableCell>
                                            <TableCell>{format(exp.date, 'PPP')}</TableCell>
                                            <TableCell><Badge variant="outline">{exp.category}</Badge></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </UiTable>
                            {parsedData.validExpenses.length > 100 && <p className="text-center text-sm text-muted-foreground p-2">Showing first 100 of {parsedData.validExpenses.length} rows.</p>}
                        </ScrollArea>
                    </>
                ) : (
                    <Alert>
                        <Table className="h-4 w-4" />
                        <AlertTitle>No valid expenses found.</AlertTitle>
                        <AlertDescription>
                            We couldn't find any expenses to import. Please check your file against the templates and try again.
                        </AlertDescription>
                    </Alert>
                )}
            </div>
          )
        )}

        <DialogFooter className='pt-4'>
            {step === 'upload' ? (
                <Button variant="outline" onClick={handleClose}>Cancel</Button>
            ) : (
                <>
                    <Button variant="outline" onClick={resetState}>Upload Another File</Button>
                    <Button onClick={handleConfirmImport} disabled={!parsedData || parsedData.validExpenses.length === 0}>
                        Import {parsedData?.validExpenses.length || 0} expenses
                    </Button>
                </>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
