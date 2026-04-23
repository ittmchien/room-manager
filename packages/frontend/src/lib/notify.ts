import { notification } from 'antd';

export const notify = {
  error(message: string, description?: string) {
    notification.error({ message, description, placement: 'top', duration: 4 });
  },
  success(message: string, description?: string) {
    notification.success({ message, description, placement: 'top', duration: 3 });
  },
  warning(message: string, description?: string) {
    notification.warning({ message, description, placement: 'top', duration: 4 });
  },
};
