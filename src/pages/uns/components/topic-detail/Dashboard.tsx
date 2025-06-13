import { FC, useEffect, useRef, useState } from 'react';
import md5 from 'blueimp-md5';
import { ResizableBox } from 'react-resizable';
import '@/components/resizable-container/index.scss';
import type { TimeRangePickerProps } from 'antd';
import { Flex, DatePicker, Button } from 'antd';
import { Renew } from '@carbon/icons-react';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { useTranslate } from '@/hooks';
import IframeMask from '@/components/iframe-mask';

const { RangePicker } = DatePicker;

interface DetailDashboardProps {
  instanceInfo: { [key: string]: any };
}

const DetailDashboard: FC<DetailDashboardProps> = ({ instanceInfo }) => {
  const { dataType, refers, alias } = instanceInfo;

  const formatMessage = useTranslate();
  const observer = useRef<MutationObserver | null>(null);

  const newAlias = dataType === 7 ? refers?.[0]?.alias : alias;
  const aliasHash = md5(newAlias).slice(8, 24);
  const iframeName = `${newAlias?.replaceAll('_', '-')}`;

  const [iframeUrl, setIframeUrl] = useState(
    `/grafana/home/d-solo/${aliasHash}/${iframeName}?orgId=1&panelId=1&__feature.dashboardSceneSolo`
  );
  const [dates, setDates] = useState<any>(null);

  useEffect(() => {
    handleDefaultTime();
  }, [instanceInfo]);

  useEffect(() => {
    const timeFrame = dates ? `&from=${dayjs(dates[0]).valueOf()}&to=${dayjs(dates[1]).valueOf()}` : '';
    setIframeUrl(
      `/grafana/home/d-solo/${aliasHash}/${iframeName}?orgId=1&panelId=1&__feature.dashboardSceneSolo${timeFrame}`
    );
  }, [dates]);

  useEffect(() => {
    const iframe = document.getElementById('dashboardIframe') as HTMLIFrameElement | null;

    if (iframe) {
      interface CustomHTMLElement extends HTMLElement {
        __handled__?: boolean;
      }
      const handleMutation = (mutationsList: MutationRecord[]) => {
        for (const mutation of mutationsList) {
          if (mutation.type === 'childList') {
            // 使用 querySelectorAll 获取所有匹配的元素，并遍历它们
            const showOnHoverBtns = Array.from(
              iframe?.contentWindow?.document?.querySelectorAll('.show-on-hover') || []
            ) as CustomHTMLElement[];
            showOnHoverBtns.forEach((btn: CustomHTMLElement) => {
              // 如果按钮还没有被处理过，则进行处理
              if (!btn.__handled__) {
                btn.style.display = 'none';

                // 禁用事件监听器
                btn.addEventListener('click', function handleClick(event: Event) {
                  event.stopPropagation();
                  event.preventDefault();
                  // 移除事件监听器，防止多次添加
                  btn.removeEventListener('click', handleClick);
                });

                // 标记为已处理
                btn.__handled__ = true;
              }
            });
          }
        }
      };

      const startObserving = () => {
        // 创建一个 MutationObserver 实例并定义其回调函数
        observer.current = new MutationObserver(handleMutation);

        // 开始观察 iframe 内的内容变化
        observer.current.observe(iframe.contentWindow?.document.body || document.body, {
          childList: true,
          subtree: true,
        });
      };

      // 当 iframe 加载完成后开始观察
      iframe.onload = function () {
        const iframeDocument: Document | undefined = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDocument) return;
        // 创建style元素
        const style = iframeDocument.createElement('style');
        style.type = 'text/css';
        style.innerHTML =
          'body::-webkit-scrollbar { width: 8px; height: 8px; z-index: 99; background: transparent; }' +
          'body::-webkit-scrollbar-track { margin: 4px 0; border-radius: 8px; }' +
          'body::-webkit-scrollbar-thumb { border-radius: 8px; background: #d3d3d3; cursor: pointer; }' +
          'body::-webkit-scrollbar-thumb:hover { background: #a5a5a5; }';

        // 将style元素添加到iframe的head标签中
        iframeDocument.head.appendChild(style);
        console.log('iframe加载完成');
        startObserving();
      };

      // 清理函数，在组件卸载时停止观察以避免内存泄漏
      return () => {
        if (observer.current) observer.current.disconnect();
      };
    }
  }, [iframeUrl]);

  const [isResizing, setIsResizing] = useState(false);

  const rangePresets: TimeRangePickerProps['presets'] = [
    { label: formatMessage('uns.last5minutes'), value: [dayjs().add(-5, 'm'), dayjs()] },
    { label: formatMessage('uns.last30minutes'), value: [dayjs().add(-30, 'm'), dayjs()] },
    { label: formatMessage('uns.last1hour'), value: [dayjs().add(-1, 'h'), dayjs()] },
    { label: formatMessage('uns.last6hours'), value: [dayjs().add(-6, 'h'), dayjs()] },
    { label: formatMessage('uns.last24hours'), value: [dayjs().add(-24, 'h'), dayjs()] },
    { label: formatMessage('uns.last1week'), value: [dayjs().add(-1, 'w'), dayjs()] },
    { label: formatMessage('uns.last6weeks'), value: [dayjs().add(-6, 'w'), dayjs()] },
    { label: formatMessage('uns.last1year'), value: [dayjs().add(-1, 'y'), dayjs()] },
  ];

  const handleDefaultTime = () => {
    setDates([dataType === 2 ? dayjs().add(-6, 'h') : dayjs().add(-5, 'm'), dayjs()]);
  };

  const onRangeChange = (dates: null | (Dayjs | null)[]) => {
    setDates(dates);
  };

  return (
    <>
      <Flex gap={10} style={{ marginBottom: '10px' }}>
        <RangePicker
          showTime
          format="YYYY-MM-DD HH:mm:ss"
          value={dates}
          onChange={onRangeChange}
          presets={rangePresets}
        />
        <Button
          color="default"
          variant="filled"
          icon={<Renew />}
          onClick={() => {
            if (dates) {
              setDates([dayjs().add(dates[0] - dates[1], 'ms'), dayjs()]);
            } else {
              handleDefaultTime();
            }
          }}
          style={{
            border: '1px solid #CBD5E1',
            color: 'var(--supos-text-color)',
            backgroundColor: 'var(--supos-uns-button-color)',
          }}
        />
      </Flex>
      <ResizableBox
        className="resizable-container resizable-hover-handles"
        width={900}
        height={300}
        minConstraints={[200, 200]}
        maxConstraints={[1280, 500]}
        axis="both"
        resizeHandles={['se']} // 只允许右下角拖拽
        onResizeStart={() => setIsResizing(true)}
        onResizeStop={() => setIsResizing(false)}
      >
        <>
          <iframe height="100%" width="100%" id="dashboardIframe" src={iframeUrl} />
          <IframeMask style={{ display: isResizing ? 'block' : 'none' }} />
        </>
      </ResizableBox>
    </>
  );
};
export default DetailDashboard;
