import { useForm } from '@mantine/form';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Box, Button, Divider, Group, NumberInput, Select, Stack, Textarea, TextInput, Title } from '@mantine/core';
import { offlineTransactionManager } from '../services/OfflineTransactionManager';
import {
    TransactionType,
    type Transaction
} from '../types';

interface TransactionFormProps {
  initialValues?: Transaction;
  onSuccess: () => void;
  onCancel: () => void;
  isEdit?: boolean;
}

export function TransactionForm({
  initialValues,
  onSuccess,
  onCancel,
  isEdit
}: TransactionFormProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      description: initialValues?.description || '',
      amount: initialValues?.amount || 0,
      currency: initialValues?.currency || 'USD',
      type: initialValues?.type || TransactionType.PAYMENT,
      date: initialValues?.createdAt ? new Date(initialValues.createdAt) : new Date(),
      notes: ''
    },
    validate: {
      description: (value) => (value.length < 3 ? t('validation.descriptionTooShort') : null),
      amount: (value) => (value <= 0 ? t('validation.amountMustBePositive') : null),
    }
  });

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      const transactionInput = {
        description: form.values.description,
        amount: form.values.amount,
        currency: form.values.currency,
        type: form.values.type,
        createdAt: form.values.date.toISOString(),
      };
      
      if (isEdit && initialValues) {
        await offlineTransactionManager.updateTransaction(initialValues.id, transactionInput);
      } else {
        await offlineTransactionManager.createTransaction(transactionInput);
      }
      
      onSuccess();
    } catch (error) {
      console.error('Transaction form error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack spacing="md">
          <Title order={3}>
            {isEdit ? t('transaction.form.editTitle') : t('transaction.form.createTitle')}
          </Title>
          
          <Divider />
          
          <TextInput
            label={t('transaction.form.description')}
            placeholder={t('transaction.form.descriptionPlaceholder')}
            required
            {...form.getInputProps('description')}
          />
          
          <Group grow>
            <NumberInput
              label={t('transaction.form.amount')}
              placeholder={t('transaction.form.amountPlaceholder')}
              required
              min={0}
              precision={2}
              {...form.getInputProps('amount')}
            />
            
            <Select
              label={t('transaction.form.currency')}
              placeholder={t('transaction.form.currencyPlaceholder')}
              data={[
                { value: 'USD', label: 'USD' },
                { value: 'EUR', label: 'EUR' },
                { value: 'CDF', label: 'CDF' }
              ]}
              required
              {...form.getInputProps('currency')}
            />
          </Group>
          
          <Select
            label={t('transaction.form.type')}
            placeholder={t('transaction.form.typePlaceholder')}
            data={Object.values(TransactionType).map(type => ({
              value: type,
              label: t(`transaction.type.${type.toLowerCase()}`)
            }))}
            required
            {...form.getInputProps('type')}
          />
          
          <TextInput
            type="date"
            label={t('transaction.form.date')}
            {...form.getInputProps('date')}
          />
          
          <Textarea
            label={t('transaction.form.notes')}
            placeholder={t('transaction.form.notesPlaceholder')}
            {...form.getInputProps('notes')}
          />
          
          <Group position="right" mt="md">
            <Button variant="outline" onClick={onCancel}>
              {t('common.cancel')}
            </Button>
            
            <Button type="submit" loading={loading}>
              {isEdit ? t('common.save') : t('common.create')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Box>
  );
} 