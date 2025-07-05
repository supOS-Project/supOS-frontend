import { ChatBot, Close, WatsonHealthAiResultsLow } from '@carbon/icons-react';
import { Tooltip } from 'antd';
import {
  ComponentProps,
  CSSProperties,
  Dispatch,
  forwardRef,
  SetStateAction,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  memo,
} from 'react';
import Draggable from '../draggable';
import { CopilotChat } from '@copilotkit/react-ui';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import ChatInput from '../copilotkit/sub-com/ChatInput.tsx';
// import TextMessage from '../copilotkit/sub-com/TextMessage.tsx';
import styles from './CustomCopilotChat.module.scss';
import classNames from 'classnames';
import { useLocation } from 'react-router-dom';

interface CustomCopilotChatProps extends ComponentProps<typeof CopilotChat> {
  style?: CSSProperties;
}

export interface CopilotRefProps {
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const CustomCopilotChat = forwardRef<CopilotRefProps | undefined, CustomCopilotChatProps>(
  function CustomCopilotChat(copilotChatProps, ref) {
    const [open, setOpen] = useState(false);
    const [isWelt, setWelt] = useState(true);
    const [weltDirection, setWeltDirection] = useState<any>('right');
    const [maxDistance, setMaxDistance] = useState(0);
    // const isFirstOpen = useRef(true);
    const divRef = useRef<HTMLDivElement>(null);
    // const [title, setTitle] = useState<ReactNode | null>(null);
    const draggableRef = useRef<any>(null);
    const pathname = useLocation().pathname;

    useImperativeHandle(ref, () => ({ setOpen }));
    useEffect(() => {
      // if (open && isFirstOpen.current) {
      //   setTitle(
      //     <div className={styles['custom-copilot-chat']}>
      //       <div className="header">
      //         <div className="icon">
      //           <ChatBot size={16} color="var(--supos-theme-color)" />
      //         </div>
      //         <span>ChatBot</span>
      //         <ComClickTrigger
      //           triggerCount={5}
      //           style={{ flex: 1, height: 24 }}
      //           onTrigger={() => {
      //             console.warn(useBaseStore.getState());
      //           }}
      //         />
      //         <Close size={18} color="var(--supos-theme-color)" className="icon-close" onClick={() => setOpen(false)} />
      //       </div>
      //       <div
      //         style={{
      //           '--copilot-kit-primary-color': 'var(--supos-theme-color)',
      //           '--copilot-kit-contrast-color': 'var(--supos-text-color)',
      //         }}
      //       >
      //         <CopilotChat
      //           {...props}
      //           Input={ChatInput}
      //           // RenderTextMessage={TextMessage}
      //           // icons={{
      //           //   activityIcon: <InlineLoading status="active" />,
      //           // }}
      //         />
      //       </div>
      //     </div>
      //   );
      //   isFirstOpen.current = false;
      // }
      if (open) {
        handleScroll();
      }
    }, [open]);

    const title = useMemo(
      () => (
        <div className={styles['custom-copilot-chat']}>
          <div className="header">
            <div className="icon">
              <ChatBot size={16} color="var(--supos-theme-color)" />
            </div>
            <span>ChatBot</span>
            <Close size={18} color="var(--supos-theme-color)" className="icon-close" onClick={() => setOpen(false)} />
          </div>
          <div
            style={{
              '--copilot-kit-primary-color': 'var(--supos-theme-color)',
              '--copilot-kit-contrast-color': 'var(--supos-text-color)',
            }}
          >
            <CopilotChat
              {...copilotChatProps}
              Input={ChatInput}
              // RenderTextMessage={TextMessage}
              // icons={{
              //   activityIcon: <InlineLoading status="active" />,
              // }}
            />
          </div>
        </div>
      ),
      [copilotChatProps]
    );

    const handleScroll = (t = false) => {
      if (t) {
        setOpen(false);
      }
      if (divRef.current) {
        const rect = divRef.current.getBoundingClientRect();
        const maxDist = Math.max(Math.abs(rect.top), Math.abs(window.innerHeight - rect.bottom));
        setMaxDistance(maxDist > 550 ? 550 : maxDist);
      }
    };

    useEffect(() => {
      const handleScrollFn = () => {
        handleScroll(true);
      };
      window.addEventListener('resize', handleScrollFn);
      // 初始化时获取元素位置
      handleScroll();
      // 清理事件监听
      return () => {
        window.removeEventListener('scroll', handleScrollFn);
      };
    }, []);

    useEffect(() => {
      // 默认首页展开，其他页面收起
      if (pathname === '/home') {
        draggableRef?.current?.setInitialShow();
      } else {
        draggableRef?.current?.setInitialHidden();
      }
    }, [pathname]);

    // 修复threshold每次变化导致Draggable组件中handleResize监听失效
    const threshold = useMemo(
      () => ({
        edgeThreshold: 10,
        contentWidth: 80,
        contentHeight: 80,
        shrinkWidth: 60,
      }),
      []
    );

    return (
      <Tooltip
        styles={{
          root: {
            '--chat-bot-height': maxDistance - 70 + 'px',
            '--chat-bot-wrapper-height': maxDistance - 20 + 'px',
          },
        }}
        classNames={{
          root: styles['custom-copilot-tooltip'],
        }}
        placement="topRight"
        trigger={['click']}
        open={open}
        title={title}
        onOpenChange={(pre) => setOpen(pre)}
      >
        <Draggable
          draggableRef={draggableRef}
          disableDrag
          // 首页禁止贴边功能
          disableWelt={pathname === '/home'}
          domOpen={open}
          activationConstraint={{
            delay: 150,
            tolerance: 5,
          }}
          modifiers={[restrictToParentElement]}
          onDragHandleCallBack={(_: any, opt) => {
            if (opt?.type === 'start') {
              setOpen(false);
            } else {
              setWelt(!!opt?.isWelt);
              setWeltDirection(opt?.weltDirection);
            }
          }}
          threshold={threshold}
        >
          <div
            style={{ '--ai-flex-direction': weltDirection === 'right' ? 'flex-start' : 'flex-end' }}
            ref={divRef}
            title={'Press and hold to drag'}
            className={classNames(isWelt ? styles['custom-copilot-wrapper-welt'] : styles['custom-copilot-wrapper'])}
            onClick={() => setOpen(!open)}
          >
            {isWelt ? (
              <WatsonHealthAiResultsLow color="var(--supos-theme-color)" />
            ) : (
              <ChatBot size={36} color="var(--supos-theme-color)" className="icon" />
            )}
          </div>
        </Draggable>
      </Tooltip>
    );
  }
);

export default memo(CustomCopilotChat);
