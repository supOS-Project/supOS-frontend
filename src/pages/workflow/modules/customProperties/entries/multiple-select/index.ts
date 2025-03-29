import { html } from 'htm/preact';
import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';
import './index.scss';

export default function MultiSelectEntry(props: any) {
  const { id, label, getValue, setValue, getOptions } = props;

  const [selectedValues, setSelectedValues] = useState(getValue());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setSelectedValues(getValue());
  }, [getValue]);

  useEffect(() => {
    // 添加点击事件监听器
    const handleClickOutside = (event: any) => {
      const dropdownElement = document.getElementById(id);
      if (dropdownElement && !dropdownElement.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [id]);

  const options = getOptions();

  const handleSelectionChange = (optionValue: any) => {
    let newSelectedValues;
    if (selectedValues.includes(optionValue)) {
      newSelectedValues = selectedValues.filter((value: any) => value !== optionValue);
    } else {
      newSelectedValues = [...selectedValues, optionValue];
    }
    setSelectedValues(newSelectedValues);
    setValue(newSelectedValues); // 更新业务对象中的值
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return html`
    <div class="bio-properties-panel-entry" id=${id}>
      <label class="bio-properties-panel-label">${label}</label>
      <div class="${'multiple-select-box ' + (isOpen ? 'focus' : '')}""" onClick=${toggleDropdown}>
        <ul class="selected-values">
          ${
            selectedValues.length > 0
              ? selectedValues.map(
                  (value: any) => html`<li>${options?.find((e: any) => e.value === value)?.label}</li>`
                )
              : ''
          }
        </ul>
        <div class="${'dropdown ' + (isOpen ? 'open' : '')}">
          <ul>
            ${options.map(
              (option: any) => html`
                <li
                  onClick=${(e: any) => {
                    e.stopPropagation();
                    handleSelectionChange(option.value);
                  }}
                  class="${selectedValues.includes(option.value) ? 'selected' : ''}"
                >
                  ${option.label}
                </li>
              `
            )}
          </ul>
        </div>
      </div>
    </div>
  `;
}
