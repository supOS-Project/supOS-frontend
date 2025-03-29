import { Checkbox, CheckboxProps } from 'antd';
import { CSSProperties, FC } from 'react';
import classNames from 'classnames';
import './index.scss';

export interface ComCheckboxProps extends CheckboxProps {
  label?: string;
  disabled?: boolean;
  rootStyle?: CSSProperties;
  rootClassname?: CSSProperties;
}

const ComCheckbox: FC<ComCheckboxProps> = ({ rootClassname, rootStyle, label, disabled, ...restProps }) => {
  return (
    <div className={classNames('custom-checkbox-wrapper', rootClassname)} style={rootStyle}>
      <Checkbox {...restProps} disabled={disabled} className="com-checkbox">
        {label}
      </Checkbox>
    </div>
  );
};

export default ComCheckbox;
