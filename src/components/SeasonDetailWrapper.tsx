import React from 'react';
import SeasonDetail from './SeasonDetail';
import SeasonDetailMobile from './SeasonDetailMobile';
import { useIsMobile } from '../hooks/useIsMobile';

const SeasonDetailWrapper: React.FC = () => {
  const isMobile = useIsMobile();

  return isMobile ? <SeasonDetailMobile /> : <SeasonDetail />;
};

export default SeasonDetailWrapper;
