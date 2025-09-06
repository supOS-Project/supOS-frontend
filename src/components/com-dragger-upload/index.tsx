import { FolderAdd } from '@carbon/icons-react';
import { App, DrawerProps, Upload, type UploadFile } from 'antd';
import { CSSProperties, FC, ReactNode, useRef } from 'react';
import usePropsValue from '@/hooks/usePropsValue.ts';
import { useTranslate } from '@/hooks';
import './index.scss';

const { Dragger } = Upload;

interface ComDraggerUploadProps extends Omit<DrawerProps, 'action' | 'fileList'> {
  value?: UploadFile[];
  defaultValue?: UploadFile[];
  onChange?: (fileList: UploadFile[]) => void;
  acceptList?: string[];
  AddIcon?: ReactNode;
  style?: CSSProperties;
}

const ComDraggerUpload: FC<ComDraggerUploadProps> = ({
  value,
  onChange,
  defaultValue,
  acceptList = [],
  AddIcon,
  style,
}) => {
  const [fileList, setFileList] = usePropsValue<UploadFile[]>({
    value,
    onChange,
    defaultValue,
  });
  const formatMessage = useTranslate();
  const { message } = App.useApp();
  const uploadRef = useRef<any>(null);
  const accept = acceptList.map((item) => `.${item}`).join(',');

  const beforeUpload = (file: any) => {
    const fileType = file.name.split('.').pop();
    if (acceptList?.length === 0 || acceptList.includes(fileType.toLowerCase())) {
      setFileList([file]);
    } else {
      message.warning(formatMessage('common.theFileFormatType', { fileType: accept }));
    }
    return false;
  };

  return (
    <div style={style}>
      <Dragger
        ref={uploadRef}
        className="com-dragger-upload"
        action=""
        accept={accept}
        maxCount={1}
        beforeUpload={beforeUpload}
        fileList={fileList}
        onRemove={() => {
          setFileList([]);
        }}
      >
        {AddIcon ? AddIcon : <FolderAdd size={100} style={{ color: '#E0E0E0' }} />}
      </Dragger>
    </div>
  );
};

export default ComDraggerUpload;
