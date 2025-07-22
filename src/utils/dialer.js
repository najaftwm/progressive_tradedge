import { useDialer } from '@context/DialerContext';

export const useTriggerCall = () => {
  const { triggerCall } = useDialer();
  return triggerCall;
};

// Example usage:
// const triggerCall = useTriggerCall();
// triggerCall('917208320766'); 