/*
 * @Author: dongweipeng dongweipeng@supos.com
 * @Date: 2025-03-07 14:07:06
 * @LastEditors: dongweipeng dongweipeng@supos.com
 * @LastEditTime: 2025-03-07 16:35:08
 * @Description:
 */
import { useState } from 'react';
import { useTranslate } from '@/hooks';
import modelerStore from '@/stores/workflowEditor-store';
import { observer } from 'mobx-react-lite';
import { message } from 'antd';
import {
  AlignHorizontalLeft,
  AlignHorizontalCenter,
  AlignHorizontalRight,
  AlignVerticalTop,
  AlignVerticalCenter,
  AlignVerticalBottom,
  ZoomOut,
  ZoomIn,
  Undo,
  Redo,
  Plan,
} from '@carbon/icons-react';
import styles from './index.module.scss';

const ToolBar = () => {
  const { modeler, modeling, selection, align, canvas, command, minimap } = modelerStore;

  const formatMessage = useTranslate();
  const [currentScale, setCurrentScale] = useState(canvas ? canvas.zoom() : 1);

  const buttons = [
    { name: formatMessage('workflowEditor.alignLeft'), key: 'left', icon: <AlignHorizontalLeft /> },
    { name: formatMessage('workflowEditor.alignCenter'), key: 'center', icon: <AlignHorizontalCenter /> },
    { name: formatMessage('workflowEditor.alignRight'), key: 'right', icon: <AlignHorizontalRight /> },
    { name: formatMessage('workflowEditor.alignTop'), key: 'top', icon: <AlignVerticalTop /> },
    { name: formatMessage('workflowEditor.alignMiddle'), key: 'middle', icon: <AlignVerticalCenter /> },
    { name: formatMessage('workflowEditor.alignBottom'), key: 'bottom', icon: <AlignVerticalBottom /> },
  ];

  const handleAlignElements = (tag: string) => {
    if (!modeler) return;

    if (modeling && selection) {
      const SelectedElements = selection.get();
      if (!SelectedElements || SelectedElements.length <= 1) {
        return message.warning('请按住 Shift 键选择多个元素对齐');
      }
      align.trigger(SelectedElements, tag);
    }
  };

  // 放大缩小画布
  const handleZoom = (scale?: number) => {
    if (!canvas) return;

    const newScale = scale ? Math.floor(currentScale * 100 + scale * 100) / 100 : 1;
    canvas.zoom(newScale, !newScale ? undefined : { x: 0, y: 0 });
    setCurrentScale(newScale);
  };

  // 撤销
  const handleUndo = () => {
    if (!command || !command.canUndo()) return;
    command.undo();
  };

  // 恢复
  const handleRedo = () => {
    if (!command || !command.canRedo()) return;
    command.redo();
  };

  // 展开收起小地图
  const handleToggleMinimap = () => {
    if (!minimap) return;
    minimap.toggle();
  };

  return (
    <div className={styles.toolbar}>
      <ul className={styles.group}>
        <ul className={styles.innerGroup}>
          {buttons.map((item) => {
            return (
              <li key={item.key} title={item.name} onClick={() => handleAlignElements(item.key)}>
                {item.icon}
              </li>
            );
          })}
        </ul>
        <ul className={styles.innerGroup}>
          <li title={formatMessage('workflowEditor.zoomOut')} onClick={() => handleZoom(-0.1)}>
            <ZoomOut />
          </li>
          <li
            className={styles.zoomReset}
            title={formatMessage('workflowEditor.zoomReset')}
            onClick={() => handleZoom()}
          >
            {Math.floor(currentScale * 100) + '%'}
          </li>
          <li title={formatMessage('workflowEditor.zoomIn')} onClick={() => handleZoom(0.1)}>
            <ZoomIn />
          </li>
        </ul>
        <ul className={styles.innerGroup}>
          <li title={formatMessage('workflowEditor.undo')} onClick={handleUndo}>
            <Undo />
          </li>
          <li title={formatMessage('workflowEditor.redo')} onClick={handleRedo}>
            <Redo />
          </li>
        </ul>
        <li title={formatMessage('workflowEditor.toggleMinimap')} onClick={handleToggleMinimap}>
          <Plan />
        </li>
      </ul>
    </div>
  );
};

export default observer(ToolBar);
