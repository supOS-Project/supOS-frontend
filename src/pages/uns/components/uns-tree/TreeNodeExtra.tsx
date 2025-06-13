import { Copy, Subtract } from '@carbon/icons-react';
import { FC } from 'react';
import { useTreeStore } from '../../store/treeStore';
import { useTranslate } from '@/hooks';
import { ButtonPermission } from '@/common-types/button-permission';
import { AuthWrapper } from '@/components/auth';

const deletePerMap: { [key: string]: string } = {
  uns: ButtonPermission['uns.delete'],
  template: ButtonPermission['uns.templateDelete'],
  label: ButtonPermission['uns.labelDelete'],
};

const copyPerMap: { [key: string]: string } = {
  uns: ButtonPermission['uns.copy'],
  template: ButtonPermission['uns.templateCopy'],
};

const TreeNodeExtra: FC<{ handleDelete: () => void; handleCopy: () => void }> = ({ handleDelete, handleCopy }) => {
  const formatMessage = useTranslate();
  const { treeType } = useTreeStore((state) => ({
    treeType: state.treeType,
  }));

  return (
    <>
      {treeType !== 'label' && (
        <AuthWrapper auth={copyPerMap[treeType]}>
          <span title={formatMessage('common.copy')} style={{ lineHeight: 1 }}>
            <Copy
              onClick={(e) => {
                e.stopPropagation();
                handleCopy?.();
              }}
            />
          </span>
        </AuthWrapper>
      )}
      <AuthWrapper auth={deletePerMap[treeType]}>
        <span title={formatMessage('common.delete')} style={{ lineHeight: 1 }}>
          <Subtract
            onClick={(e) => {
              e?.stopPropagation();
              handleDelete?.();
            }}
          />
        </span>
      </AuthWrapper>
    </>
  );
};

export default TreeNodeExtra;
