type CardHeaderProps = {
  title: string;
  subtitle?: string;
  pill?: string;
  pillClassName?: string;
};

export function CardHeader({ title, subtitle, pill, pillClassName }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="font-bold text-[#2f3438]">{title}</p>
        {subtitle && <p className="mt-1 text-sm text-[#828c94]">{subtitle}</p>}
      </div>
      {pill && (
        <span
          className={
            pillClassName ??
            'shrink-0 rounded-full bg-[#e8f9ee] px-2.5 py-1 text-[11px] font-bold text-[#00c73c]'
          }
        >
          {pill}
        </span>
      )}
    </div>
  );
}
