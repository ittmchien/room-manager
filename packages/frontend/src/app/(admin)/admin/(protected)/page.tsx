'use client';

import { Card, Col, Row, Statistic, Typography } from 'antd';
import { UserOutlined, TagsOutlined, CreditCardOutlined, SettingOutlined } from '@ant-design/icons';

const { Title } = Typography;
const TypographyText = Typography.Text;

export default function AdminDashboardPage() {
  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>
        Dashboard
      </Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Tổng users" value={'-'} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Tags" value={'-'} prefix={<TagsOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Subscriptions" value={'-'} prefix={<CreditCardOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="System Config" value={'-'} prefix={<SettingOutlined />} />
          </Card>
        </Col>
      </Row>
      <Card style={{ marginTop: 24 }}>
        <TypographyText type="secondary">
          Reports và analytics sẽ được bổ sung trong Phase 2.
        </TypographyText>
      </Card>
    </div>
  );
}
