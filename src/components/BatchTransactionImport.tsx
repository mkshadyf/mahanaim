import { Box, Button, Code, Group, List, Text as MantineText, Paper, Progress, useMantineTheme } from '@mantine/core';
import { Dropzone, FileWithPath } from '@mantine/dropzone';
import { IconFileUpload, IconUpload, IconX } from '@tabler/icons-react';
import Papa from 'papaparse';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTransaction } from '../hooks/useTransaction';
import { TransactionInput } from '../types';
import { CurrencyCode, TransactionType } from '../types/transaction';

interface BatchImportProps {
  onComplete?: (results: { success: number; failed: number }) => void;
  onSuccess: () => void;
  onCancel: () => void;
}

interface ParsedRow {
  description: string;
  amount: string;
  currency: string;
  type: string;
  date?: string;
}

interface ProgressState {
  total: number;
  processed: number;
  success: number;
  failed: number;
  errors: string[];
}

export function BatchTransactionImport({ onComplete, onSuccess, onCancel }: BatchImportProps) {
  const { t } = useTranslation();
  const [, setFiles] = useState<FileWithPath[]>([]);
  const [progress, setProgress] = useState<ProgressState>({ total: 0, processed: 0, success: 0, failed: 0, errors: [] });
  const [isProcessing, setIsProcessing] = useState(false);
  const [, setIsUploading] = useState(false);
  const { createTransaction } = useTransaction();
  const theme = useMantineTheme();

  const handleDrop = (acceptedFiles: FileWithPath[]) => {
    setFiles(acceptedFiles);
    setIsUploading(true);
    if (acceptedFiles.length > 0) {
      processFile(acceptedFiles[0]);
    }
  };

  const processFile = (file: File) => {
    setIsProcessing(true);
    setProgress({ total: 0, processed: 0, success: 0, failed: 0, errors: [] });

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as ParsedRow[];
        setProgress(prev => ({ ...prev, total: rows.length }));
        processRows(rows).then(() => {
          setIsProcessing(false);
          setIsUploading(false);
          if (onComplete) {
            onComplete({ success: progress.success, failed: progress.failed });
          }
        });
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        setIsProcessing(false);
        setIsUploading(false);
      }
    });
  };

  const processRows = async (rows: ParsedRow[]) => {
    let processed = 0;
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const row of rows) {
      try {
        const transaction = parseRow(row);
        await createTransaction(transaction);
        success++;
      } catch (error) {
        failed++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Row ${processed + 1}: ${errorMessage}`);
        console.error('Error processing row:', error);
      } finally {
        processed++;
        setProgress(prev => ({
          ...prev,
          processed,
          success,
          failed,
          errors
        }));
      }
    }

    if (success > 0 && onSuccess) {
      onSuccess();
    }
  };

  const parseRow = (row: ParsedRow): TransactionInput => {
    // Map CSV fields to transaction fields
    // Validate and convert types
    const amount = parseFloat(row.amount);
    if (isNaN(amount)) {
      throw new Error(`Invalid amount: ${row.amount}`);
    }

    // Map string values to enum values
    const mapTransactionType = (type: string): TransactionType => {
      const typeMap: Record<string, TransactionType> = {
        'deposit': TransactionType.DEPOSIT,
        'withdrawal': TransactionType.WITHDRAWAL,
        'transfer': TransactionType.TRANSFER,
        'payment': TransactionType.PAYMENT,
        'send': TransactionType.SEND,
        'receive': TransactionType.RECEIVE
      };
      
      return typeMap[type.toLowerCase()] || TransactionType.PAYMENT;
    };

    const mapCurrency = (currency: string): CurrencyCode => {
      const currencyMap: Record<string, CurrencyCode> = {
        'usd': 'USD',
        'eur': 'EUR',
        'cdf': 'CDF',
        'fc': 'FC'
      };
      
      return currencyMap[currency.toLowerCase()] || 'USD';
    };

    return {
      description: row.description,
      amount,
      currency: mapCurrency(row.currency) as any,
      type: mapTransactionType(row.type) as any
    };
  };
  
  return (
    <Box>
      {isProcessing ? (
        <Box p="md" sx={{ border: '1px solid #eee', borderRadius: '8px' }}>
          <MantineText size="sm" mb={5} weight={500}>
            {t('batchImport.importing', {
              processed: progress.processed,
              total: progress.total,
            })}
          </MantineText>
          
          <Progress value={progress.processed / progress.total * 100} mb="md" size="md" />
          
          <Group position="apart">
            <MantineText size="xs" color="green">
              {t('batchImport.success')}: {progress.success}
            </MantineText>
            
            <MantineText size="xs" color="red">
              {t('batchImport.failed')}: {progress.failed}
            </MantineText>
          </Group>
          
          {progress.errors.length > 0 && (
            <Box mt="md">
              <MantineText size="xs" color="red" mb={5}>
                {t('batchImport.errors')}:
              </MantineText>
              <Box sx={{ maxHeight: '150px', overflowY: 'auto' }}>
                {progress.errors.map((error, index) => (
                  <MantineText key={index} size="xs" color="red" mb={2}>
                    {error}
                  </MantineText>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      ) : (
        <>
          <Paper p="md" withBorder mb="md">
            <MantineText size="sm" mb="md" weight={500}>
              {t('batchImport.instructions')}
            </MantineText>
            <List size="sm" spacing="xs" mb="md">
              <List.Item>{t('batchImport.instructionFormat')}</List.Item>
              <List.Item>{t('batchImport.instructionColumns')}</List.Item>
              <List.Item>{t('batchImport.instructionExample')}</List.Item>
            </List>
            <Code block>
              description,amount,currency,type,date
              "Payment for services",100.50,USD,PAYMENT,2023-05-15
              "Refund",25.75,FC,REFUND,2023-05-16
            </Code>
          </Paper>
          
          <Dropzone
            onDrop={handleDrop}
            maxSize={3 * 1024 ** 2}
            accept={['text/csv']}
            loading={isProcessing}
          >
            <Group position="center" spacing="xl" style={{ minHeight: 120, pointerEvents: 'none' }}>
              <Dropzone.Accept>
                <IconUpload
                  size={50}
                  stroke={1.5}
                  color={theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 4 : 6]}
                />
              </Dropzone.Accept>
              <Dropzone.Reject>
                <IconX
                  size={50}
                  stroke={1.5}
                  color={theme.colors.red[theme.colorScheme === 'dark' ? 4 : 6]}
                />
              </Dropzone.Reject>
              <Dropzone.Idle>
                <IconFileUpload size={50} stroke={1.5} />
              </Dropzone.Idle>

              <div>
                <MantineText size="xl" inline>
                  {t('batchImport.dragFiles')}
                </MantineText>
                <MantineText size="sm" color="dimmed" inline mt={7}>
                  {t('batchImport.fileLimit')}
                </MantineText>
              </div>
            </Group>
          </Dropzone>
          
          <Group position="right" mt="md">
            <Button variant="outline" onClick={onCancel}>
              {t('common.cancel')}
            </Button>
          </Group>
        </>
      )}
    </Box>
  );
} 