import {
    Box,
    Button,
    Checkbox,
    Code,
    Divider,
    FileInput,
    Grid,
    Group,
    List,
    Text as MantineText,
    NumberInput,
    Paper,
    Select,
    Stack,
    Stepper,
    Tabs,
    TextInput,
    Textarea,
    Title,
    useMantineColorScheme
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
    IconBuildingBank,
    IconCheck,
    IconDeviceMobile,
    IconFileImport,
    IconFileSpreadsheet,
    IconReceipt,
    IconUpload
} from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DateInput } from './DateInput';

interface TransactionImportProps {
  onComplete: (results: { success: number; failed: number }) => void;
  onCancel: () => void;
}

export function TransactionImport({ onComplete, onCancel }: TransactionImportProps) {
  const { t } = useTranslation();
  useMantineColorScheme();
  const [activeStep, setActiveStep] = useState(0);
  const [importMethod, setImportMethod] = useState<string>('bank');
  const [bankName, setBankName] = useState<string | null>(null);
  const [mobileProvider, setMobileProvider] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [date, setDate] = useState<Date | null>(new Date());
  const [shopId, setShopId] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [manualTransactions, setManualTransactions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>('file');
  
  // Get theme colors
  const getThemeColor = (color: string, shade: number = 6) => {
    const colors = {
      blue: ['#e7f5ff', '#d0ebff', '#a5d8ff', '#74c0fc', '#4dabf7', '#339af0', '#228be6', '#1c7ed6', '#1971c2', '#1864ab'],
      green: ['#ebfbee', '#d3f9d8', '#b2f2bb', '#8ce99a', '#69db7c', '#51cf66', '#40c057', '#37b24d', '#2f9e44', '#2b8a3e'],
      orange: ['#fff4e6', '#ffe8cc', '#ffd8a8', '#ffc078', '#ffa94d', '#ff922b', '#fd7e14', '#f76707', '#e8590c', '#d9480f'],
      red: ['#fff5f5', '#ffe3e3', '#ffc9c9', '#ffa8a8', '#ff8787', '#ff6b6b', '#fa5252', '#f03e3e', '#e03131', '#c92a2a'],
      gray: ['#f8f9fa', '#f1f3f5', '#e9ecef', '#dee2e6', '#ced4da', '#adb5bd', '#868e96', '#495057', '#343a40', '#212529'],
    };
    
    return colors[color as keyof typeof colors][shade];
  };
  
  // Mock data for dropdowns
  const bankOptions = [
    { value: 'boa', label: 'Bank of Africa' },
    { value: 'rawbank', label: 'Rawbank' },
    { value: 'ecobank', label: 'Ecobank' },
    { value: 'tmb', label: 'Trust Merchant Bank' },
    { value: 'equity', label: 'Equity Bank' },
  ];
  
  const mobileProviderOptions = [
    { value: 'mpesa', label: 'M-Pesa' },
    { value: 'orange', label: 'Orange Money' },
    { value: 'airtel', label: 'Airtel Money' },
    { value: 'africell', label: 'Africell Money' },
  ];
  
  const shopOptions = [
    { value: 'shop1', label: 'Shop 1 - Downtown' },
    { value: 'shop2', label: 'Shop 2 - Uptown' },
    { value: 'shop3', label: 'Shop 3 - Westside' },
    { value: 'shop4', label: 'Shop 4 - Eastside' },
    { value: 'shop5', label: 'Shop 5 - Northside' },
  ];
  
  const currencyOptions = [
    { value: 'USD', label: 'USD' },
    { value: 'FC', label: 'FC (Franc Congolais)' },
    { value: 'EUR', label: 'EUR' },
  ];
  
  const transactionTypeOptions = [
    { value: 'DEPOSIT', label: 'Deposit' },
    { value: 'WITHDRAWAL', label: 'Withdrawal' },
    { value: 'TRANSFER', label: 'Transfer' },
    { value: 'PAYMENT', label: 'Payment' },
    { value: 'RECEIVE', label: 'Receive' },
    { value: 'SEND', label: 'Send' },
  ];
  
  const handleAddManualTransaction = () => {
    setManualTransactions([
      ...manualTransactions,
      {
        id: Date.now().toString(),
        description: '',
        amount: 0,
        currency: 'USD',
        type: 'PAYMENT',
        status: 'COMPLETED',
        date: new Date().toISOString(),
      }
    ]);
  };
  
  const handleRemoveManualTransaction = (index: number) => {
    const newTransactions = [...manualTransactions];
    newTransactions.splice(index, 1);
    setManualTransactions(newTransactions);
  };
  
  const updateManualTransaction = (index: number, field: string, value: any) => {
    const newTransactions = [...manualTransactions];
    newTransactions[index] = {
      ...newTransactions[index],
      [field]: value
    };
    setManualTransactions(newTransactions);
  };
  
  const handleSubmit = async () => {
    if (!date) {
      notifications.show({
        title: t('error'),
        message: t('import.selectDate'),
        color: 'red',
      });
      return;
    }
    
    if (!shopId) {
      notifications.show({
        title: t('error'),
        message: t('import.selectShop'),
        color: 'red',
      });
      return;
    }
    
    if (activeTab === 'file' && !file) {
      notifications.show({
        title: t('error'),
        message: t('import.selectFile'),
        color: 'red',
      });
      return;
    }
    
    if (activeTab === 'manual' && manualTransactions.length === 0) {
      notifications.show({
        title: t('error'),
        message: t('import.addTransactions'),
        color: 'red',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real app, this would send the data to a backend service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful import
      const success = activeTab === 'manual' ? manualTransactions.length : Math.floor(Math.random() * 10) + 5;
      const failed = activeTab === 'manual' ? 0 : Math.floor(Math.random() * 3);
      
      notifications.show({
        title: t('success'),
        message: t('import.importSuccess', { success, failed }),
        color: 'green',
      });
      
      onComplete({ success, failed });
    } catch (error) {
      notifications.show({
        title: t('error'),
        message: error instanceof Error ? error.message : t('import.importError'),
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const nextStep = () => {
    if (activeStep === 0 && !importMethod) {
      notifications.show({
        title: t('error'),
        message: t('import.selectMethod'),
        color: 'red',
      });
      return;
    }
    
    if (activeStep === 1) {
      if (importMethod === 'bank' && !bankName) {
        notifications.show({
          title: t('error'),
          message: t('import.selectBank'),
          color: 'red',
        });
        return;
      }
      
      if (importMethod === 'mobile' && !mobileProvider) {
        notifications.show({
          title: t('error'),
          message: t('import.selectProvider'),
          color: 'red',
        });
        return;
      }
    }
    
    setActiveStep((current) => current + 1);
  };
  
  const prevStep = () => setActiveStep((current) => current - 1);
  
  return (
    <Box>
      <Paper withBorder p="md" mb="md">
        <Stepper active={activeStep} onStepClick={setActiveStep} breakpoint="sm">
          <Stepper.Step
            label={t('import.selectSource')}
            description={t('import.sourceDescription')}
            icon={<IconFileImport size={18} />}
          >
            <Stack spacing="md" mt="md">
              <MantineText weight={500}>{t('import.selectImportMethod')}</MantineText>
              
              <Group grow>
                <Paper
                  withBorder
                  p="md"
                  sx={{
                    cursor: 'pointer',
                    backgroundColor: importMethod === 'bank' ? getThemeColor('blue') : undefined,
                    borderColor: importMethod === 'bank' ? getThemeColor('blue', 6) : undefined,
                  }}
                  onClick={() => setImportMethod('bank')}
                >
                  <Stack align="center" spacing="xs">
                    <IconBuildingBank size={32} color={getThemeColor('blue', 6)} />
                    <MantineText weight={500}>{t('import.bankStatement')}</MantineText>
                    <MantineText size="xs" color="dimmed" align="center">
                      {t('import.bankDescription')}
                    </MantineText>
                  </Stack>
                </Paper>
                
                <Paper
                  withBorder
                  p="md"
                  sx={{
                    cursor: 'pointer',
                    backgroundColor: importMethod === 'mobile' ? getThemeColor('green') : undefined,
                    borderColor: importMethod === 'mobile' ? getThemeColor('green', 6) : undefined,
                  }}
                  onClick={() => setImportMethod('mobile')}
                >
                  <Stack align="center" spacing="xs">
                    <IconDeviceMobile size={32} color={getThemeColor('green', 6)} />
                    <MantineText weight={500}>{t('import.mobileMoneyStatement')}</MantineText>
                    <MantineText size="xs" color="dimmed" align="center">
                      {t('import.mobileDescription')}
                    </MantineText>
                  </Stack>
                </Paper>
                
                <Paper
                  withBorder
                  p="md"
                  sx={{
                    cursor: 'pointer',
                    backgroundColor: importMethod === 'manual' ? getThemeColor('orange') : undefined,
                    borderColor: importMethod === 'manual' ? getThemeColor('orange', 6) : undefined,
                  }}
                  onClick={() => setImportMethod('manual')}
                >
                  <Stack align="center" spacing="xs">
                    <IconReceipt size={32} color={getThemeColor('orange', 6)} />
                    <MantineText weight={500}>{t('import.manualEntry')}</MantineText>
                    <MantineText size="xs" color="dimmed" align="center">
                      {t('import.manualDescription')}
                    </MantineText>
                  </Stack>
                </Paper>
              </Group>
            </Stack>
          </Stepper.Step>
          
          <Stepper.Step
            label={t('import.sourceDetails')}
            description={t('import.detailsDescription')}
            icon={<IconFileSpreadsheet size={18} />}
          >
            <Stack spacing="md" mt="md">
              {importMethod === 'bank' && (
                <>
                  <Select
                    label={t('import.selectBank')}
                    placeholder={t('import.selectBankPlaceholder')}
                    data={bankOptions}
                    value={bankName}
                    onChange={setBankName}
                    required
                  />
                  
                  <MantineText size="sm" color="dimmed">
                    {t('import.bankInstructions')}
                  </MantineText>
                  
                  <List size="sm">
                    <List.Item>{t('import.bankInstruction1')}</List.Item>
                    <List.Item>{t('import.bankInstruction2')}</List.Item>
                    <List.Item>{t('import.bankInstruction3')}</List.Item>
                  </List>
                </>
              )}
              
              {importMethod === 'mobile' && (
                <>
                  <Select
                    label={t('import.selectMobileProvider')}
                    placeholder={t('import.selectProviderPlaceholder')}
                    data={mobileProviderOptions}
                    value={mobileProvider}
                    onChange={setMobileProvider}
                    required
                  />
                  
                  <MantineText size="sm" color="dimmed">
                    {t('import.mobileInstructions')}
                  </MantineText>
                  
                  <List size="sm">
                    <List.Item>{t('import.mobileInstruction1')}</List.Item>
                    <List.Item>{t('import.mobileInstruction2')}</List.Item>
                    <List.Item>{t('import.mobileInstruction3')}</List.Item>
                  </List>
                </>
              )}
              
              {importMethod === 'manual' && (
                <>
                  <MantineText weight={500}>{t('import.manualInstructions')}</MantineText>
                  <MantineText size="sm" color="dimmed">
                    {t('import.manualInstructionsDetail')}
                  </MantineText>
                </>
              )}
            </Stack>
          </Stepper.Step>
          
          <Stepper.Step
            label={t('import.importData')}
            description={t('import.dataDescription')}
            icon={<IconUpload size={18} />}
          >
            <Stack spacing="md" mt="md">
              <Grid>
                <Grid.Col span={6}>
                  <DateInput
                    label={t('import.transactionDate')}
                    placeholder={t('import.selectDate')}
                    value={date}
                    onChange={setDate}
                    required
                    maxDate={new Date()}
                  />
                </Grid.Col>
                
                <Grid.Col span={6}>
                  <Select
                    label={t('import.selectShop')}
                    placeholder={t('import.selectShopPlaceholder')}
                    data={shopOptions}
                    value={shopId}
                    onChange={setShopId}
                    required
                  />
                </Grid.Col>
              </Grid>
              
              <Divider label={t('import.importMethod')} labelPosition="center" />
              
              <Tabs value={activeTab} onTabChange={setActiveTab}>
                <Tabs.List>
                  <Tabs.Tab value="file" icon={<IconFileImport size={14} />}>
                    {t('import.fileImport')}
                  </Tabs.Tab>
                  <Tabs.Tab value="manual" icon={<IconReceipt size={14} />}>
                    {t('import.manualEntry')}
                  </Tabs.Tab>
                </Tabs.List>
                
                <Tabs.Panel value="file" pt="md">
                  <Stack spacing="md">
                    <FileInput
                      label={t('import.selectFile')}
                      description={t('import.dragFile')}
                      accept=".csv,.xlsx,.xls"
                      icon={<IconFileSpreadsheet size={14} />}
                      value={file}
                      onChange={setFile}
                      required
                    />
                    
                    <Paper withBorder p="xs">
                      <MantineText size="sm" weight={500} mb="xs">
                        {t('import.fileFormat')}
                      </MantineText>
                      <Code block>
                        {importMethod === 'bank' 
                          ? 'Date,Description,Debit,Credit,Balance,Type\n2023-05-15,"Payment for services",,100.50,1500.00,DEPOSIT'
                          : 'Date,Description,Amount,Type,Reference\n2023-05-15,"Mobile payment",100.50,PAYMENT,REF123456'}
                      </Code>
                    </Paper>
                    
                    <Checkbox
                      label={t('import.hasHeaderRow')}
                      defaultChecked
                    />
                  </Stack>
                </Tabs.Panel>
                
                <Tabs.Panel value="manual" pt="md">
                  <Stack spacing="md">
                    <Group position="right">
                      <Button 
                        variant="outline" 
                        onClick={handleAddManualTransaction}
                        leftIcon={<IconReceipt size={14} />}
                      >
                        {t('import.addTransaction')}
                      </Button>
                    </Group>
                    
                    {manualTransactions.length === 0 ? (
                      <MantineText color="dimmed" align="center" py="lg">
                        {t('import.noTransactionsAdded')}
                      </MantineText>
                    ) : (
                      manualTransactions.map((transaction, index) => (
                        <Paper key={transaction.id} withBorder p="md" mb="xs">
                          <Group position="apart" mb="xs">
                            <MantineText weight={500}>
                              {t('import.transaction')} #{index + 1}
                            </MantineText>
                            <Button 
                              variant="subtle" 
                              color="red" 
                              compact
                              onClick={() => handleRemoveManualTransaction(index)}
                            >
                              {t('import.remove')}
                            </Button>
                          </Group>
                          
                          <Grid>
                            <Grid.Col span={12}>
                              <TextInput
                                label={t('transaction.description')}
                                placeholder={t('transaction.descriptionPlaceholder')}
                                value={transaction.description}
                                onChange={(e) => updateManualTransaction(index, 'description', e.target.value)}
                                required
                              />
                            </Grid.Col>
                            
                            <Grid.Col span={6}>
                              <NumberInput
                                label={t('transaction.amount')}
                                placeholder="0.00"
                                precision={2}
                                min={0.01}
                                step={0.01}
                                value={transaction.amount}
                                onChange={(value) => updateManualTransaction(index, 'amount', value)}
                                required
                              />
                            </Grid.Col>
                            
                            <Grid.Col span={6}>
                              <Select
                                label={t('transaction.currency')}
                                data={currencyOptions}
                                value={transaction.currency}
                                onChange={(value) => updateManualTransaction(index, 'currency', value)}
                                required
                              />
                            </Grid.Col>
                            
                            <Grid.Col span={6}>
                              <Select
                                label={t('transaction.type')}
                                data={transactionTypeOptions}
                                value={transaction.type}
                                onChange={(value) => updateManualTransaction(index, 'type', value)}
                                required
                              />
                            </Grid.Col>
                            
                            <Grid.Col span={6}>
                              <DateInput
                                label={t('transaction.date')}
                                placeholder={t('import.selectDate')}
                                value={new Date(transaction.date)}
                                onChange={(value) => updateManualTransaction(index, 'date', value?.toISOString())}
                                required
                                maxDate={new Date()}
                              />
                            </Grid.Col>
                          </Grid>
                        </Paper>
                      ))
                    )}
                  </Stack>
                </Tabs.Panel>
              </Tabs>
              
              <Textarea
                label={t('import.notes')}
                placeholder={t('import.notesPlaceholder')}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                minRows={3}
              />
            </Stack>
          </Stepper.Step>
          
          <Stepper.Completed>
            <Stack spacing="md" mt="md" align="center">
              <IconCheck size={48} color={getThemeColor('green', 6)} />
              <Title order={3}>{t('import.readyToImport')}</Title>
              <MantineText align="center">
                {t('import.readyToImportDescription')}
              </MantineText>
              
              <Paper withBorder p="md" w="100%">
                <Stack spacing="xs">
                  <Group position="apart">
                    <MantineText weight={500}>{t('import.source')}:</MantineText>
                    <MantineText>
                      {importMethod === 'bank' 
                        ? t('import.bankStatement') + (bankName ? ` (${bankOptions.find(b => b.value === bankName)?.label})` : '')
                        : importMethod === 'mobile'
                          ? t('import.mobileMoneyStatement') + (mobileProvider ? ` (${mobileProviderOptions.find(p => p.value === mobileProvider)?.label})` : '')
                          : t('import.manualEntry')
                      }
                    </MantineText>
                  </Group>
                  
                  <Group position="apart">
                    <MantineText weight={500}>{t('import.date')}:</MantineText>
                    <MantineText>{date?.toLocaleDateString()}</MantineText>
                  </Group>
                  
                  <Group position="apart">
                    <MantineText weight={500}>{t('import.shop')}:</MantineText>
                    <MantineText>{shopOptions.find(s => s.value === shopId)?.label}</MantineText>
                  </Group>
                  
                  <Group position="apart">
                    <MantineText weight={500}>{t('import.method')}:</MantineText>
                    <MantineText>{activeTab === 'file' ? t('import.fileImport') : t('import.manualEntry')}</MantineText>
                  </Group>
                  
                  {activeTab === 'file' && file && (
                    <Group position="apart">
                      <MantineText weight={500}>{t('import.fileName')}:</MantineText>
                      <MantineText>{file.name}</MantineText>
                    </Group>
                  )}
                  
                  {activeTab === 'manual' && (
                    <Group position="apart">
                      <MantineText weight={500}>{t('import.transactionCount')}:</MantineText>
                      <MantineText>{manualTransactions.length}</MantineText>
                    </Group>
                  )}
                </Stack>
              </Paper>
            </Stack>
          </Stepper.Completed>
        </Stepper>
        
        <Group position="right" mt="xl">
          {activeStep > 0 && (
            <Button variant="default" onClick={prevStep}>
              {t('back')}
            </Button>
          )}
          
          {activeStep === 3 ? (
            <Button onClick={handleSubmit} loading={isSubmitting} leftIcon={<IconUpload size={14} />}>
              {t('import.importNow')}
            </Button>
          ) : activeStep < 3 ? (
            <Button onClick={nextStep}>
              {t('next')}
            </Button>
          ) : null}
          
          <Button variant="subtle" onClick={onCancel}>
            {t('cancel')}
          </Button>
        </Group>
      </Paper>
    </Box>
  );
} 