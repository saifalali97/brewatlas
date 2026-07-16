import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { dsRadius } from "@/lib/constants/styles";

function joinClasses(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export type TableProps = HTMLAttributes<HTMLTableElement>;

export function Table({ className = "", children, ...props }: TableProps) {
  return (
    <div className={joinClasses("w-full overflow-x-auto", dsRadius.lg, "border border-white/[0.08]")}>
      <table className={joinClasses("w-full min-w-[640px] border-collapse text-left text-sm", className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({ className = "", children, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={joinClasses("border-b border-white/[0.08] bg-white/[0.03]", className)} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ className = "", children, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={className} {...props}>{children}</tbody>;
}

export function TableRow({ className = "", children, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={joinClasses(
        "border-b border-white/[0.06] transition-colors duration-200 last:border-b-0 hover:bg-white/[0.02]",
        className,
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHeader({ className = "", children, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={joinClasses(
        "px-4 py-3 text-xs font-medium uppercase tracking-[0.12em] text-stone-500",
        className,
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({ className = "", children, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={joinClasses("px-4 py-3.5 text-stone-300", className)} {...props}>
      {children}
    </td>
  );
}

export function TableCaption({ className = "", children, ...props }: HTMLAttributes<HTMLTableCaptionElement>) {
  return (
    <caption className={joinClasses("sr-only", className)} {...props}>
      {children}
    </caption>
  );
}
