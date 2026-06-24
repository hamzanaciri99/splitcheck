import { Text, type TextProps } from 'react-native';

type Props = TextProps & { className?: string; children?: React.ReactNode };

// Matches DESIGN.md's typography table exactly: font, size, line-height,
// tracking, and weight per named role.

export function DisplayCurrency({ className, ...rest }: Props) {
  return (
    <Text
      className={`font-jakarta-bold font-bold text-[40px] leading-[48px] tracking-[-0.02em] ${className ?? ''}`}
      {...rest}
    />
  );
}

export function HeadlineLg({ className, ...rest }: Props) {
  return (
    <Text
      className={`font-jakarta-bold font-bold text-[32px] leading-[40px] tracking-[-0.01em] ${className ?? ''}`}
      {...rest}
    />
  );
}

export function HeadlineLgMobile({ className, ...rest }: Props) {
  return (
    <Text className={`font-jakarta-bold font-bold text-[24px] leading-[32px] ${className ?? ''}`} {...rest} />
  );
}

export function HeadlineMd({ className, ...rest }: Props) {
  return <Text className={`font-jakarta font-semibold text-[24px] leading-[32px] ${className ?? ''}`} {...rest} />;
}

export function BodyLg({ className, ...rest }: Props) {
  return <Text className={`font-sans text-[18px] leading-[28px] ${className ?? ''}`} {...rest} />;
}

export function BodyMd({ className, ...rest }: Props) {
  return <Text className={`font-sans text-[16px] leading-[24px] ${className ?? ''}`} {...rest} />;
}

export function LabelMd({ className, ...rest }: Props) {
  return (
    <Text
      className={`font-inter-semibold font-semibold text-[14px] leading-[20px] tracking-[0.01em] ${className ?? ''}`}
      {...rest}
    />
  );
}

export function LabelSm({ className, ...rest }: Props) {
  return (
    <Text className={`font-inter-medium font-medium text-[12px] leading-[16px] ${className ?? ''}`} {...rest} />
  );
}
