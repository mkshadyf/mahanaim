import { db } from '@/config/firebase';
import { Button, Container, Group, Loader, Paper, Select, Table, Title } from '@mantine/core';
import dayjs from 'dayjs';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
dayjs.extend(quarterOfYear);

// Define the DailyReport type based on the expected fields
interface DailyReport {
  id: string;
  mpesaBalanceUSD: number;
  mpesaBalanceFC: number;
  airtelBalanceUSD: number;
  airtelBalanceFC: number;
  vodacomBalanceUSD: number;
  mvBalanceUSD: number;
  cashUSD: number;
  cashFC: number;
  sendTransactionsUSD: number;
  sendTransactionsFC: number;
  receiveTransactionsUSD: number;
  receiveTransactionsFC: number;
  timestamp: any; // Firestore timestamp
}

// Define the aggregated report interface
interface AggregatedReport {
  totalMpesaUSD: number;
  totalMpesaFC: number;
  totalAirtelUSD: number;
  totalAirtelFC: number;
  totalVodacomUSD: number;
  totalMvUSD: number;
  totalCashUSD: number;
  totalCashFC: number;
  totalSendTransactionsUSD: number;
  totalSendTransactionsFC: number;
  totalReceiveTransactionsUSD: number;
  totalReceiveTransactionsFC: number;
}

const initialAggregatedReport: AggregatedReport = {
  totalMpesaUSD: 0,
  totalMpesaFC: 0,
  totalAirtelUSD: 0,
  totalAirtelFC: 0,
  totalVodacomUSD: 0,
  totalMvUSD: 0,
  totalCashUSD: 0,
  totalCashFC: 0,
  totalSendTransactionsUSD: 0,
  totalSendTransactionsFC: 0,
  totalReceiveTransactionsUSD: 0,
  totalReceiveTransactionsFC: 0,
};

export default function AggregatedReports() {
  const { t } = useTranslation();
  // Report period selection: weekly, monthly, quarterly, yearly
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'quarterly' | 'yearly'>('weekly');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [aggregated, setAggregated] = useState<AggregatedReport>(initialAggregatedReport);
  const [loading, setLoading] = useState(false);

  const fetchAggregatedReport = async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    try {
      const reportsRef = collection(db, 'dailyReports');
      const q = query(reportsRef, where('timestamp', '>=', startDate), where('timestamp', '<=', endDate));
      const snapshot = await getDocs(q);
      const reports: DailyReport[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as DailyReport[];

      // Aggregate the report values
      const agg: AggregatedReport = { ...initialAggregatedReport };
      reports.forEach(report => {
        agg.totalMpesaUSD += report.mpesaBalanceUSD || 0;
        agg.totalMpesaFC += report.mpesaBalanceFC || 0;
        agg.totalAirtelUSD += report.airtelBalanceUSD || 0;
        agg.totalAirtelFC += report.airtelBalanceFC || 0;
        agg.totalVodacomUSD += report.vodacomBalanceUSD || 0;
        agg.totalMvUSD += report.mvBalanceUSD || 0;
        agg.totalCashUSD += report.cashUSD || 0;
        agg.totalCashFC += report.cashFC || 0;
        agg.totalSendTransactionsUSD += report.sendTransactionsUSD || 0;
        agg.totalSendTransactionsFC += report.sendTransactionsFC || 0;
        agg.totalReceiveTransactionsUSD += report.receiveTransactionsUSD || 0;
        agg.totalReceiveTransactionsFC += report.receiveTransactionsFC || 0;
      });
      setAggregated(agg);
    } catch (error) {
      console.error('Error fetching aggregated report:', error);
    } finally {
      setLoading(false);
    }
  };

  // Compute date range based on selected period
  const computeDateRange = (periodType: string) => {
    const now = dayjs();
    let start, end;
    switch (periodType) {
      case 'weekly':
        start = now.startOf('week');
        end = now.endOf('week');
        break;
      case 'monthly':
        start = now.startOf('month');
        end = now.endOf('month');
        break;
      case 'quarterly':
        start = now.startOf('quarter');
        end = now.endOf('quarter');
        break;
      case 'yearly':
        start = now.startOf('year');
        end = now.endOf('year');
        break;
      default:
        start = now.startOf('week');
        end = now.endOf('week');
    }
    setStartDate(start.toDate());
    setEndDate(end.toDate());
  };

  useEffect(() => {
    computeDateRange(period);
  }, [period]);

  useEffect(() => {
    if (startDate && endDate) {
      fetchAggregatedReport();
    }
  }, [startDate, endDate]);

  return (
    <Container>
      <Title order={2}>{t('Aggregated Reports')}</Title>
      <Group my="md">
        <Select
          label={t('Report Period')}
          data={[
            { value: 'weekly', label: t('Weekly') },
            { value: 'monthly', label: t('Monthly') },
            { value: 'quarterly', label: t('Quarterly') },
            { value: 'yearly', label: t('Yearly') },
          ]}
          value={period}
          onChange={(value) => setPeriod(value as 'weekly' | 'monthly' | 'quarterly' | 'yearly')}
        />
        <Button onClick={fetchAggregatedReport}>{t('Refresh')}</Button>
      </Group>
      {loading ? (
        <Loader />
      ) : (
        <Paper withBorder p="md">
          <Table>
            <thead>
              <tr>
                <th>{t('Metric')}</th>
                <th>{t('Value')}</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>{t('Total M-Pesa USD')}</td><td>{aggregated.totalMpesaUSD.toFixed(2)}</td></tr>
              <tr><td>{t('Total M-Pesa FC')}</td><td>{aggregated.totalMpesaFC.toFixed(2)}</td></tr>
              <tr><td>{t('Total Airtel USD')}</td><td>{aggregated.totalAirtelUSD.toFixed(2)}</td></tr>
              <tr><td>{t('Total Airtel FC')}</td><td>{aggregated.totalAirtelFC.toFixed(2)}</td></tr>
              <tr><td>{t('Total Vodacom USD')}</td><td>{aggregated.totalVodacomUSD.toFixed(2)}</td></tr>
              <tr><td>{t('Total MV USD')}</td><td>{aggregated.totalMvUSD.toFixed(2)}</td></tr>
              <tr><td>{t('Total Cash USD')}</td><td>{aggregated.totalCashUSD.toFixed(2)}</td></tr>
              <tr><td>{t('Total Cash FC')}</td><td>{aggregated.totalCashFC.toFixed(2)}</td></tr>
              <tr><td>{t('Total Send Transactions USD')}</td><td>{aggregated.totalSendTransactionsUSD.toFixed(2)}</td></tr>
              <tr><td>{t('Total Send Transactions FC')}</td><td>{aggregated.totalSendTransactionsFC.toFixed(2)}</td></tr>
              <tr><td>{t('Total Receive Transactions USD')}</td><td>{aggregated.totalReceiveTransactionsUSD.toFixed(2)}</td></tr>
              <tr><td>{t('Total Receive Transactions FC')}</td><td>{aggregated.totalReceiveTransactionsFC.toFixed(2)}</td></tr>
            </tbody>
          </Table>
        </Paper>
      )}
    </Container>
  );
} 