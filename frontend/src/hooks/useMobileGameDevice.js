import { useEffect, useState } from 'react';

function getViewportSize() {
  const visualViewport = window.visualViewport;

  return {
    width: Math.round(visualViewport?.width ?? window.innerWidth),
    height: Math.round(visualViewport?.height ?? window.innerHeight),
  };
}

function getMobileGameDeviceState() {
  if (typeof window === 'undefined') {
    return {
      isMobileGameDevice: false,
      isLandscape: true,
    };
  }

  const { width, height } = getViewportSize();
  const maxTouchPoints = navigator.maxTouchPoints ?? 0;
  const primaryCoarse = window.matchMedia('(pointer: coarse)').matches;
  const anyCoarse = window.matchMedia('(any-pointer: coarse)').matches;
  const noHover = window.matchMedia('(hover: none)').matches;
  const touchCapable = maxTouchPoints > 0 || primaryCoarse || anyCoarse;
  const shortestSide = Math.min(width, height);
  const longestSide = Math.max(width, height);
  const phoneViewport = shortestSide <= 760 && longestSide <= 980;
  const tabletViewport = shortestSide <= 1024 && longestSide <= 1366;
  const likelyTablet = touchCapable && tabletViewport && (primaryCoarse || anyCoarse || noHover || maxTouchPoints > 1);
  const isMobileGameDevice = touchCapable && (phoneViewport || likelyTablet);

  return {
    isMobileGameDevice,
    isLandscape: width >= height,
  };
}

export function useMobileGameDevice() {
  const [deviceState, setDeviceState] = useState(() => getMobileGameDeviceState());

  useEffect(() => {
    const mediaQueries = [
      window.matchMedia('(pointer: coarse)'),
      window.matchMedia('(any-pointer: coarse)'),
      window.matchMedia('(hover: none)'),
    ];

    const updateDeviceState = () => {
      setDeviceState(getMobileGameDeviceState());
    };

    window.addEventListener('resize', updateDeviceState);
    window.addEventListener('orientationchange', updateDeviceState);
    window.visualViewport?.addEventListener('resize', updateDeviceState);
    window.screen.orientation?.addEventListener?.('change', updateDeviceState);

    mediaQueries.forEach((query) => {
      query.addEventListener?.('change', updateDeviceState);
      query.addListener?.(updateDeviceState);
    });

    updateDeviceState();

    return () => {
      window.removeEventListener('resize', updateDeviceState);
      window.removeEventListener('orientationchange', updateDeviceState);
      window.visualViewport?.removeEventListener('resize', updateDeviceState);
      window.screen.orientation?.removeEventListener?.('change', updateDeviceState);

      mediaQueries.forEach((query) => {
        query.removeEventListener?.('change', updateDeviceState);
        query.removeListener?.(updateDeviceState);
      });
    };
  }, []);

  return deviceState;
}
