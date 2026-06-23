import Svg, { Path, Circle, Line } from 'react-native-svg';

export type IconName =
  | 'menu'
  | 'bell'
  | 'settings'
  | 'chevron-right'
  | 'close'
  | 'arrow-left'
  | 'paperclip'
  | 'send'
  | 'check'
  | 'plus'
  | 'flash'
  | 'image'
  | 'help-circle'
  | 'receipt'
  | 'download'
  | 'logout'
  | 'camera'
  | 'chat'
  | 'users'
  | 'clock'
  | 'user'
  | 'mail'
  | 'lock'
  | 'google'
  | 'edit'
  | 'shield'
  | 'dollar-sign'
  | 'globe'
  | 'moon'
  | 'info'
  | 'trash';

type Props = {
  name: IconName;
  size?: number;
  color?: string;
};

export function Icon({ name, size = 24, color = '#F5F5F5' }: Props) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (name) {
    case 'menu':
      return (
        <Svg {...common}>
          <Path d="M3 6h18M3 12h18M3 18h18" />
        </Svg>
      );
    case 'bell':
      return (
        <Svg {...common}>
          <Path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </Svg>
      );
    case 'settings':
      return (
        <Svg {...common}>
          <Circle cx="12" cy="12" r="3" />
          <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82A1.65 1.65 0 0 0 3 13.09H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.36.41.6 1 .6 1.51V11" />
        </Svg>
      );
    case 'chevron-right':
      return (
        <Svg {...common}>
          <Path d="M9 18l6-6-6-6" />
        </Svg>
      );
    case 'close':
      return (
        <Svg {...common}>
          <Path d="M18 6L6 18M6 6l12 12" />
        </Svg>
      );
    case 'arrow-left':
      return (
        <Svg {...common}>
          <Path d="M19 12H5M12 19l-7-7 7-7" />
        </Svg>
      );
    case 'paperclip':
      return (
        <Svg {...common}>
          <Path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
        </Svg>
      );
    case 'send':
      return (
        <Svg {...common}>
          <Path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
        </Svg>
      );
    case 'check':
      return (
        <Svg {...common}>
          <Path d="M20 6L9 17l-5-5" />
        </Svg>
      );
    case 'plus':
      return (
        <Svg {...common}>
          <Path d="M12 5v14M5 12h14" />
        </Svg>
      );
    case 'flash':
      return (
        <Svg {...common}>
          <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </Svg>
      );
    case 'image':
      return (
        <Svg {...common}>
          <Path d="M21 3H3a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1z" />
          <Circle cx="8.5" cy="8.5" r="1.5" />
          <Path d="M21 15l-5-5L5 21" />
        </Svg>
      );
    case 'help-circle':
      return (
        <Svg {...common}>
          <Circle cx="12" cy="12" r="10" />
          <Path d="M9.09 9a3 3 0 1 1 5.83 1c0 2-3 2-3 4" />
          <Line x1="12" y1="17" x2="12" y2="17.01" />
        </Svg>
      );
    case 'receipt':
      return (
        <Svg {...common}>
          <Path d="M4 2h16v20l-3-2-3 2-3-2-3 2-3-2-1 2z" />
          <Line x1="8" y1="7" x2="16" y2="7" />
          <Line x1="8" y1="11" x2="16" y2="11" />
        </Svg>
      );
    case 'download':
      return (
        <Svg {...common}>
          <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <Path d="M7 10l5 5 5-5" />
          <Line x1="12" y1="15" x2="12" y2="3" />
        </Svg>
      );
    case 'logout':
      return (
        <Svg {...common}>
          <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <Path d="M16 17l5-5-5-5" />
          <Line x1="21" y1="12" x2="9" y2="12" />
        </Svg>
      );
    case 'camera':
      return (
        <Svg {...common}>
          <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <Circle cx="12" cy="13" r="4" />
        </Svg>
      );
    case 'chat':
      return (
        <Svg {...common}>
          <Path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </Svg>
      );
    case 'users':
      return (
        <Svg {...common}>
          <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <Circle cx="9" cy="7" r="4" />
          <Path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </Svg>
      );
    case 'clock':
      return (
        <Svg {...common}>
          <Circle cx="12" cy="12" r="10" />
          <Path d="M12 6v6l4 2" />
        </Svg>
      );
    case 'user':
      return (
        <Svg {...common}>
          <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <Circle cx="12" cy="7" r="4" />
        </Svg>
      );
    case 'mail':
      return (
        <Svg {...common}>
          <Path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
          <Path d="M22 6l-10 7L2 6" />
        </Svg>
      );
    case 'lock':
      return (
        <Svg {...common}>
          <Path d="M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z" />
          <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </Svg>
      );
    case 'google':
      return (
        <Svg width={common.width} height={common.height} viewBox="0 0 24 24" fill="none">
          <Path
            d="M21.8 12.2c0-.7-.06-1.4-.18-2H12v3.9h5.5c-.24 1.3-.97 2.4-2.07 3.1v2.6h3.34c1.96-1.8 3.03-4.5 3.03-7.6z"
            fill="#4285F4"
          />
          <Path
            d="M12 22c2.7 0 4.97-.9 6.63-2.4l-3.34-2.6c-.93.6-2.1 1-3.29 1-2.5 0-4.6-1.7-5.36-4H3.16v2.6C4.8 19.8 8.1 22 12 22z"
            fill="#34A853"
          />
          <Path
            d="M6.64 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.16A9.9 9.9 0 0 0 2 12c0 1.6.4 3.2 1.16 4.6L6.64 14z"
            fill="#FBBC05"
          />
          <Path
            d="M12 6c1.4 0 2.7.5 3.7 1.4l2.9-2.9C16.97 2.9 14.7 2 12 2 8.1 2 4.8 4.2 3.16 7.4l3.48 2.6C7.4 7.7 9.5 6 12 6z"
            fill="#EA4335"
          />
        </Svg>
      );
    case 'edit':
      return (
        <Svg {...common}>
          <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <Path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z" />
        </Svg>
      );
    case 'shield':
      return (
        <Svg {...common}>
          <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </Svg>
      );
    case 'dollar-sign':
      return (
        <Svg {...common}>
          <Line x1="12" y1="1" x2="12" y2="23" />
          <Path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </Svg>
      );
    case 'globe':
      return (
        <Svg {...common}>
          <Circle cx="12" cy="12" r="10" />
          <Line x1="2" y1="12" x2="22" y2="12" />
          <Path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </Svg>
      );
    case 'moon':
      return (
        <Svg {...common}>
          <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </Svg>
      );
    case 'info':
      return (
        <Svg {...common}>
          <Circle cx="12" cy="12" r="10" />
          <Line x1="12" y1="16" x2="12" y2="12" />
          <Line x1="12" y1="8" x2="12" y2="8.01" />
        </Svg>
      );
    case 'trash':
      return (
        <Svg {...common}>
          <Path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" />
        </Svg>
      );
    default:
      return null;
  }
}
