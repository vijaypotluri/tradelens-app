import React, { useState, useEffect } from 'react';
import { Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface OptionData {
  key: string;
  ticker: string;
  type: 'CALL' | 'PUT';
  strike: number;
  premium: number;
  contracts: number;
  expiry: string;
  totalPremium: number;
  currentPrice?: number;
  moneyness?: string;
}

const generateOptionsData = (): OptionData[] => {
  const tickers = ['AAPL', 'AMZN', 'MSFT', 'GOOGL', 'TSLA', 'META', 'NVDA', 'NFLX'];
  const types = ['CALL', 'PUT'] as const;

  return tickers.map((ticker, i) => {
    const type = types[Math.floor(Math.random() * types.length)];
    const strike = type === 'CALL'
        ? Math.floor(Math.random() * 1000) + 50
        : Math.floor(Math.random() * 500) + 50;
    const premium = parseFloat((Math.random() * 20 + 1).toFixed(2));
    const contracts = Math.floor(Math.random() * 20) + 1;

    const expiry = new Date();
    expiry.setDate(expiry.getDate() + Math.floor(Math.random() * 90));

    return {
      key: i.toString(),
      ticker,
      type,
      strike,
      premium,
      contracts,
      expiry: expiry.toISOString().split('T')[0],
      totalPremium: parseFloat((premium * contracts).toFixed(2))
    };
  });
};

const columns: ColumnsType<OptionData> = [
  {
    title: 'Ticker',
    dataIndex: 'ticker',
    key: 'ticker',
    sorter: (a, b) => a.ticker.localeCompare(b.ticker),
  },
  {
    title: 'Expiry',
    dataIndex: 'expiry',
    key: 'expiry',
    render: (date: string) => new Date(date).toLocaleDateString(),
    sorter: (a, b) => new Date(a.expiry).getTime() - new Date(b.expiry).getTime(),
  },
  {
    title: 'Type',
    dataIndex: 'type',
    key: 'type',
    render: (type: 'CALL' | 'PUT') => (
        <Tag color={type === 'CALL' ? 'green' : 'red'}>
          {type}
        </Tag>
    ),
  },
  {
    title: 'Strike',
    dataIndex: 'strike',
    key: 'strike',
    render: (strike: number) => `$${strike.toFixed(2)}`,
    sorter: (a, b) => a.strike - b.strike,
  },
  {
    title: 'Premium/Contract',
    dataIndex: 'premium',
    key: 'premium',
    render: (premium: number) => `$${premium.toFixed(2)}`,
    sorter: (a, b) => a.premium - b.premium,
  },
  {
    title: '# of Contracts',
    dataIndex: 'contracts',
    key: 'contracts',
    sorter: (a, b) => a.contracts - b.contracts,
  },
  {
    title: 'Total Premium',
    key: 'totalPremium',
    render: (_, record) => `$${(record.premium * record.contracts).toFixed(2)}`,
    sorter: (a, b) => (a.premium * a.contracts) - (b.premium * b.contracts),
  },
];

export const OptionsTable: React.FC = () => {
  const [dataSource, setDataSource] = useState<OptionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = generateOptionsData();
    setDataSource(data);
    setLoading(false);
  }, []);

  return (
      <div style={{
        padding: '24px',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h2 style={{ marginBottom: '16px' }}>Options Portfolio</h2>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <Table
              columns={columns}
              dataSource={dataSource}
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '25', '50', '100']
              }}
              bordered
              size="middle"
              scroll={{ y: 'calc(100vh - 180px)' }}
              style={{ height: '100%' }}
          />
        </div>
      </div>
  );
};