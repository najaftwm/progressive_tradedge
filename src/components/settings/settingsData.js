import {
  Bell,
  Moon,
  Globe,
  Lock,
  HelpCircle,
  FileText,
  Share2,
} from 'lucide-react';

export const settingsData = {
  general: {
    title: 'Notifications',
    icon: Bell,
    description: 'Manage alerts and reminders',
    subOptions: [
      { id: 'notif-email', label: 'Email Alerts', icon: Mail, value: true, showSwitch: true },
      { id: 'notif-sms', label: 'SMS Alerts', icon: Phone, value: false, showSwitch: true },
    ],
  },
  theme: {
    title: 'Appearance',
    icon: Moon,
    description: 'Customize light or dark mode',
    subOptions: [
      { id: 'theme-mode', label: 'Dark Mode', icon: Moon, value: true, showSwitch: true },
    ],
  },
  language: {
    title: 'Language',
    icon: Globe,
    description: 'Choose preferred language',
    subOptions: [
      { id: 'lang', label: 'Current Language', icon: Globe, value: 'English' },
    ],
  },
  privacy: {
    title: 'Privacy & Security',
    icon: Lock,
    description: 'Password, 2FA and more',
    subOptions: [
      { id: 'change-pass', label: 'Change Password', icon: Lock, value: '********' },
    ],
  },
  help: {
    title: 'Help Center',
    icon: HelpCircle,
    description: 'Contact support or learn more',
    subOptions: [
      { id: 'faq', label: 'FAQs', icon: FileText, value: '10 topics' },
    ],
  },
  share: {
    title: 'Refer & Earn',
    icon: Share2,
    description: 'Invite friends and get rewards',
    subOptions: [
      { id: 'referral', label: 'Referral Code', icon: Share2, value: 'TWM100' },
    ],
  },
};
