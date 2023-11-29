import React, { ReactNode } from 'react';
import { Button, Layout, theme } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <Layout className="layout">
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        <div className="demo-logo" />
        {/* <SignOutButton>
          <Button type="primary" icon={<LogoutOutlined />}>
            Sign out
          </Button>
        </SignOutButton> */}
      </Header>
      <Content
        style={{
          padding: '0 50px',
          minHeight: '100vh',
          background: colorBgContainer,
        }}
      >
        {children}
      </Content>
    </Layout>
  );
};

export default MainLayout;
