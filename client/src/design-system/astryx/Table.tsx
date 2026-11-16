import React from 'react';

export interface TableCardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  isDark?: boolean;
}

export const TableCard: React.FC<TableCardProps> = ({
  title,
  subtitle,
  actions,
  footer,
  children,
  className = '',
  isDark = false,
}) => {
  const containerClasses = isDark
    ? 'bg-[#1A3153] border-[rgba(167,199,231,0.25)] text-[#FAFAFA]'
    : 'bg-[#FAFAFA] border-[#A7C7E7] text-[#1A3153]';

  return (
    <div className={`rounded-[var(--radius-container)] border shadow-[var(--shadow-low)] overflow-hidden flex flex-col ${containerClasses} ${className}`}>
      {(title || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 border-b border-[var(--color-border-subtle)]">
          <div>
            {title && <h3 className="font-heading font-bold text-base sm:text-lg text-inherit">{title}</h3>}
            {subtitle && <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2 flex-wrap shrink-0">{actions}</div>}
        </div>
      )}

      <div className="w-full overflow-x-auto">
        {children}
      </div>

      {footer && (
        <div className="p-3 sm:p-4 border-t border-[var(--color-border-subtle)] text-xs text-[var(--color-text-secondary)] flex items-center justify-between">
          {footer}
        </div>
      )}
    </div>
  );
};

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <table className={`w-full text-left text-sm border-collapse ${className}`} {...props}>
      {children}
    </table>
  );
};

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <thead className={`bg-[rgba(167,199,231,0.08)] border-b border-[var(--color-border)] text-xs uppercase tracking-wider font-heading font-bold text-[var(--color-text-primary)] ${className}`} {...props}>
      {children}
    </thead>
  );
};

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <tbody className={`divide-y divide-[var(--color-border-subtle)] ${className}`} {...props}>
      {children}
    </tbody>
  );
};

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement> & { isHoverable?: boolean }> = ({
  className = '',
  isHoverable = true,
  children,
  ...props
}) => {
  const hoverClass = isHoverable ? 'hover:bg-[rgba(167,199,231,0.07)] transition-colors' : '';
  return (
    <tr className={`${hoverClass} ${className}`} {...props}>
      {children}
    </tr>
  );
};

export const TableHeaderCell: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <th className={`px-4 py-3 font-semibold text-xs whitespace-nowrap text-inherit ${className}`} {...props}>
      {children}
    </th>
  );
};

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <td className={`px-4 py-3 text-sm text-[var(--color-text-secondary)] align-middle whitespace-nowrap ${className}`} {...props}>
      {children}
    </td>
  );
};
