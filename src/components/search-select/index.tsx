import { Close, Search } from '@carbon/icons-react';
import { CSSProperties, FC } from 'react';
import ComSelect from '../com-select';
import { useRoutesContext } from '@/contexts/routes-context.ts';
import { observer } from 'mobx-react-lite';
import { useMenuNavigate, usePropsValue, useTranslate } from '@/hooks';
import { Space } from 'antd';
import './index.scss';

interface SearchSelectProps {
  onSearchCallback?: () => void;
  value?: boolean;
  onChange?: (value: boolean) => void;
  selectStyle?: CSSProperties;
}

const SearchSelect: FC<SearchSelectProps> = ({ onSearchCallback, value, onChange, selectStyle }) => {
  const routesStore = useRoutesContext();
  const formatMessage = useTranslate();

  const handleNavigate = useMenuNavigate();
  const [isIcon, setIcon] = usePropsValue({
    value,
    onChange,
    defaultValue: true,
  });

  return isIcon ? (
    <div
      className="com-header-search-select"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: 48 }}
      onClick={() => {
        setIcon(false);
        onSearchCallback?.();
      }}
    >
      <Search size={20} style={{ color: 'var(--supos-text-color)' }} />
    </div>
  ) : (
    <Space.Compact block>
      <ComSelect
        variant="filled"
        options={routesStore.pickedRoutesOptions}
        placeholder={formatMessage('uns.inputText')}
        style={{ width: 180, height: '100%', ...selectStyle }}
        onChange={(_: any, options: any) => {
          handleNavigate(options);
          setIcon(true);
        }}
        filterOption={(input, option) => ((option?.label as string) ?? '').toLowerCase().includes(input.toLowerCase())}
        allowClear
        showSearch
      />
      <div
        onClick={() => {
          setIcon(true);
        }}
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          display: 'flex',
          width: 40,
          background: 'rgba(0, 0, 0, 0.04)',
        }}
      >
        <Close style={{ cursor: 'pointer' }} />
      </div>
    </Space.Compact>
  );
};

export default observer(SearchSelect);
