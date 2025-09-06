import ComLayout from '@/components/com-layout';
import { FC } from 'react';
import { PageProps } from '@/common-types.ts';
import { Filter, GuiManagement, Search, Wikis } from '@carbon/icons-react';
import ComContent from '@/components/com-layout/ComContent.tsx';
import { Button, Flex, Form, Popover, Radio, Tag } from 'antd';
import ComLeft from '@/components/com-layout/ComLeft.tsx';
import { usePagination, useTranslate } from '@/hooks';
import ProTree from '@/components/pro-tree';
import ProSearch from '@/components/pro-search';
import ComSearch from '../../components/com-search';
import { AuthButton } from '@/components';
import { ButtonPermission } from '@/common-types/button-permission.ts';
import ProTable from '@/components/pro-table';
import { flowPage } from '@/apis/inter-api/flow.ts';
import ComTagFilter from '@/components/com-tag-filter';
import useLocalesSettings from '@/pages/localization/components/use-locales-settings';
import useNewEntry from '@/pages/localization/components/use-new-entry';
const defaultData: any[] = [
  {
    title: '首页',
    key: 'home',
  },
  {
    title: '数据管理',
    key: 'data-management',
  },
  {
    title: '工具集',
    key: 'toolset',
  },
  {
    title: '应用集',
    key: 'application-set',
  },
  {
    title: '系统配置',
    key: 'system-config',
  },
];

const TreeHeader = () => {
  const formatMessage = useTranslate();
  const popoverContent = (
    <Radio.Group
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
      options={[
        { value: 1, label: formatMessage('Localization.all') },
        { value: 3, label: formatMessage('Localization.builtIn') },
        { value: 2, label: formatMessage('Localization.custom') },
      ]}
    />
  );
  return (
    <Flex gap={8} align="center" style={{ padding: '0 8px 8px 0' }}>
      <Popover placement="bottomLeft" title="" content={popoverContent} trigger="hover">
        <Button
          icon={<Filter />}
          style={{ flexShrink: 0, background: 'var(--supos-switchwrap-bg-color)' }}
          color="default"
          variant="filled"
        />
      </Popover>
      <ProSearch size="sm" />
    </Flex>
  );
};
const Index: FC<PageProps> = ({ title }) => {
  const formatMessage = useTranslate();
  const [searchForm] = Form.useForm();
  const { onLocalesModalOpen, LocalesModal } = useLocalesSettings();
  const { onNewModalOpen, NewEntryModal } = useNewEntry();
  const { data, pagination } = usePagination<any>({
    initPageSize: 100,
    fetchApi: flowPage,
  });
  return (
    <ComLayout>
      {NewEntryModal}
      {LocalesModal}
      <ComContent
        titleStyle={{ paddingLeft: 16 }}
        title={
          <Flex align="center" gap={8} style={{ lineHeight: 1 }}>
            <Wikis size={20} style={{ justifyContent: 'center', verticalAlign: 'middle' }} /> {title}
          </Flex>
        }
        extra={
          <AuthButton
            type="primary"
            onClick={() => {
              onLocalesModalOpen();
            }}
          >
            <Flex gap={8}>
              <GuiManagement />
              <span>{formatMessage('Localization.localesSetting')}</span>
            </Flex>
          </AuthButton>
        }
        hasBack={false}
      >
        <ComLayout>
          <ComLeft title={formatMessage('common.model')} style={{ overflow: 'hidden' }} resize defaultWidth={360}>
            <ProTree
              treeNodeIcon={() => {
                // green blue
                return (
                  <Tag style={{ flexShrink: 0 }} color={undefined}>
                    {formatMessage('Localization.builtIn')}
                  </Tag>
                );
              }}
              header={<TreeHeader />}
              showSwitcherIcon={false}
              wrapperStyle={{ padding: '8px 0 8px 8px' }}
              treeData={defaultData}
              height={0}
            />
          </ComLeft>
          <ComContent
            titleStyle={{ paddingLeft: 16, overflow: 'hidden' }}
            title={
              <Flex gap={8} align="center">
                <span style={{ flexShrink: 0, lineHeight: 1 }}>{formatMessage('common.entry')}</span>
                <ComTagFilter />
              </Flex>
            }
            extra={
              <Flex style={{ flexShrink: 0 }} gap={8}>
                <ComSearch
                  form={searchForm}
                  formItemOptions={[
                    {
                      name: 'k',
                      properties: {
                        prefix: <Search />,
                        placeholder: formatMessage('common.searchPlaceholder'),
                        style: { width: 300 },
                        allowClear: true,
                      },
                    },
                  ]}
                  formConfig={{
                    onFinish: () => {},
                  }}
                  onSearch={() => {}}
                />
                <AuthButton
                  auth={ButtonPermission['EventFlow.add']}
                  onClick={() => {
                    onNewModalOpen();
                  }}
                >
                  + {formatMessage('Localization.newEntry')}
                </AuthButton>
              </Flex>
            }
            hasBack={false}
          >
            <ProTable
              columns={[
                {
                  title: formatMessage('uns.key'),
                  dataIndex: 'key',
                  width: '30%',
                  ellipsis: true,
                },
              ]}
              scroll={{ y: 'calc(100vh  - 260px)', x: 'max-content' }}
              dataSource={data}
              pagination={{
                total: pagination?.total,
                style: { display: 'flex', justifyContent: 'flex-end', padding: '10px 0' },
                pageSize: pagination?.pageSize || 20,
                current: pagination?.page,
                showQuickJumper: true,
                pageSizeOptions: pagination?.pageSizes,
                onChange: pagination.onChange,
                onShowSizeChange: (current, size) => {
                  pagination.onChange({ page: current, pageSize: size });
                },
              }}
            />
          </ComContent>
        </ComLayout>
      </ComContent>
    </ComLayout>
  );
};

export default Index;
