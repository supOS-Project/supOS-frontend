import { Location } from 'react-router-dom';

export interface PageProps {
  location?: Partial<Location>;
  // 路由title
  title?: string;
}
