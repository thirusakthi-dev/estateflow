  "use client";

  import { motion } from "framer-motion";
  import {
    cloneElement,
    isValidElement,
    useId,
    useState,
    type ReactElement,
    type ReactNode,
  } from "react";

  type TooltipProps = {
    content: string;
    children: ReactNode;
    side?: "top" | "bottom";
  };

  export function Tooltip({ content, children, side = "top" }: TooltipProps) {
    const id = useId();
    const [visible, setVisible] = useState(false);

    const child = isValidElement(children)
      ? (children as ReactElement<{
          "aria-describedby"?: string;
        }>)
      : null;

    if (!child) return <>{children}</>;

    return (
      <span
        className="relative inline-flex"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
      >
        {cloneElement(child, {
          "aria-describedby": visible ? id : undefined,
        })}

        {visible && (
          <motion.span
            id={id}
            role="tooltip"
            initial={{ opacity: 0, y: side === "top" ? 5 : -5, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className={[
              "pointer-events-none absolute left-1/2 z-[100]",
              "-translate-x-1/2 whitespace-nowrap rounded-lg px-2.5 py-1.5",
              "text-xs font-medium shadow-lg",
              "bg-slate-950 text-white dark:bg-slate-100 dark:text-slate-900",
              side === "top" ? "bottom-full mb-2" : "top-full mt-2",
            ].join(" ")}
          >
            {content}
            <span
              aria-hidden="true"
              className={[
                "absolute left-1/2 h-2 w-2 -translate-x-1/2 rotate-45",
                "bg-slate-950 dark:bg-slate-100",
                side === "top" ? "-bottom-1" : "-top-1",
              ].join(" ")}
            />
          </motion.span>
        )}
      </span>
    );
  }
