import Image from 'next/image';

interface BrandProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon' | 'wordmark';
  priority?: boolean;
}

export default function Brand({
  className = '',
  size = 'md',
  variant = 'full',
  priority = false,
}: BrandProps) {
  const iconSizes = {
    sm: { w: 22, h: 22, font: 'text-xl' },
    md: { w: 30, h: 30, font: 'text-2xl' },
    lg: { w: 40, h: 40, font: 'text-3xl' },
  }[size];

  if (variant === 'icon') {
    return (
      <span className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        <Image
          src="/images/logo-icon.png"
          alt="Nanki"
          width={iconSizes.w}
          height={iconSizes.h}
          priority={priority}
          className="rounded-full object-contain mix-blend-multiply"
        />
      </span>
    );
  }

  if (variant === 'wordmark') {
    return (
      <span className={`inline-flex items-center ${className}`}>
        <Image
          src="/images/logo-wordmark.png"
          alt="nanki."
          width={size === 'sm' ? 84 : size === 'lg' ? 140 : 108}
          height={size === 'sm' ? 28 : size === 'lg' ? 46 : 36}
          priority={priority}
          className="object-contain mix-blend-multiply"
        />
      </span>
    );
  }

  return (
    <span className={`brand-wordmark inline-flex items-center gap-2 ${className}`}>
      <span className="relative flex items-center justify-center overflow-hidden rounded-full shrink-0 bg-[#f7f6f2] p-0.5">
        <Image
          src="/images/logo-icon.png"
          alt=""
          width={iconSizes.w}
          height={iconSizes.h}
          priority={priority}
          className="object-contain mix-blend-multiply"
        />
      </span>
      <span className={`font-extrabold tracking-tight font-sans text-[#252329] ${iconSizes.font}`}>
        nanki<b className="text-[#e8a838]">.</b>
      </span>
    </span>
  );
}
