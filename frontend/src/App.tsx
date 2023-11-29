import React from 'react';
import './App.css';
import { ConfigProvider } from 'antd';

import Dashboard from './components/Dashboard';

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: 'DM Sans',
        },
      }}
    >
      <Dashboard />
    </ConfigProvider>
  );
}

export default App;
