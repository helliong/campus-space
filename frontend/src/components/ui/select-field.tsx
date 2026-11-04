"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

type Option = { value: string; label: string; disabled?: boolean };
export type SelectFieldProps = {
  options: Option[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  icon?: ReactNode;
  "aria-label"?: string;
};

export function SelectField({ options, value, defaultValue = "", onChange, placeholder = "Выберите вариант", className, id, name, disabled, required, icon, "aria-label": ariaLabel }: SelectFieldProps) {
  const generatedId = useId();
  const triggerId = id ?? generatedId;
  const listId = `${triggerId}-options`;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const selectedValue = value ?? internalValue;
  const selected = options.find((option) => option.value === selectedValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [position, setPosition] = useState<{
    left: number;
    top?: number;
    bottom?: number;
    width: number;
    maxHeight: number;
  }>({ left: 0, top: 0, width: 0, maxHeight: 280 });
  const trigger = useRef<HTMLButtonElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const search = useRef({ text: "", time: 0 });

  const show = () => {
    if (disabled) return;
    const index = options.findIndex((option) => option.value === selectedValue && !option.disabled);
    setActive(index >= 0 ? index : options.findIndex((option) => !option.disabled));
    setOpen(true);
  };
  const choose = (index: number) => {
    const option = options[index];
    if (!option || option.disabled) return;
    setInternalValue(option.value);
    onChange?.(option.value);
    setOpen(false);
    trigger.current?.focus();
  };

  useLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const rect = trigger.current?.getBoundingClientRect();
      if (!rect) return;
      const estimatedHeight = Math.max(48, options.length * 40 + 16);
      const below = window.innerHeight - rect.bottom - 12;
      const above = rect.top - 12;
      const upward = below < estimatedHeight && above > below;
      const availableSpace = upward ? above : below;
      const maxHeight = Math.max(60, Math.min(280, availableSpace));
      const width = Math.min(Math.max(rect.width, 200), window.innerWidth - 24);
      const left = Math.max(12, Math.min(rect.left, window.innerWidth - width - 12));

      if (upward) {
        setPosition({
          left,
          top: undefined,
          bottom: Math.round(window.innerHeight - rect.top + 6),
          width,
          maxHeight,
        });
      } else {
        setPosition({
          left,
          top: Math.round(rect.bottom + 6),
          bottom: undefined,
          width,
          maxHeight,
        });
      }
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => { window.removeEventListener("resize", update); window.removeEventListener("scroll", update, true); };
  }, [open, options.length]);

  useEffect(() => {
    if (!open) return;
    const outside = (event: Event) => {
      const target = event.target as Node;
      if (!trigger.current?.contains(target) && !popup.current?.contains(target)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("focusin", outside);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("focusin", outside); };
  }, [open]);

  useEffect(() => {
    if (open) popup.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const keyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Tab") { setOpen(false); return; }
    if (event.key === "Escape") { if (open) event.preventDefault(); setOpen(false); return; }
    if (["Enter", " "].includes(event.key)) {
      event.preventDefault();
      if (open) choose(active); else show();
      return;
    }
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      const enabled = options.map((option, index) => option.disabled ? -1 : index).filter((index) => index >= 0);
      if (!enabled.length) return;
      if (!open) { show(); return; }
      const current = enabled.indexOf(active);
      setActive(event.key === "Home" ? enabled[0] : event.key === "End" ? enabled[enabled.length - 1] : enabled[(current + (event.key === "ArrowDown" ? 1 : -1) + enabled.length) % enabled.length]);
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const now = Date.now();
      search.current = { text: (now - search.current.time < 700 ? search.current.text : "") + event.key.toLocaleLowerCase(), time: now };
      const index = options.findIndex((option) => !option.disabled && option.label.toLocaleLowerCase().startsWith(search.current.text));
      if (index >= 0) { event.preventDefault(); setOpen(true); setActive(index); }
    }
  };

  return <>
    {name && <input type="hidden" name={name} value={selectedValue} disabled={disabled} />}
    <button ref={trigger} id={triggerId} type="button" role="combobox" aria-label={ariaLabel} aria-expanded={open} aria-controls={open ? listId : undefined} aria-haspopup="listbox" aria-required={required} aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined} disabled={disabled} onClick={() => open ? setOpen(false) : show()} onKeyDown={keyDown} className={cn("flex h-11 w-full min-w-0 items-center gap-2 rounded-xl border border-[#DFE3E9] bg-white px-3 text-left text-xs font-medium text-ink shadow-sm transition hover:border-[#B9C0E7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20 disabled:cursor-not-allowed disabled:opacity-50", open && "border-brand ring-2 ring-brand/10", className)}>
      {icon}<span className={cn("min-w-0 flex-1 truncate", !selected && "text-[#667085]")}>{selected?.label ?? placeholder}</span><ChevronDown aria-hidden className={cn("size-4 shrink-0 opacity-60 transition-transform", open && "rotate-180")} />
    </button>
    {open && !disabled && createPortal(<div ref={popup} id={listId} role="listbox" aria-label={ariaLabel} aria-labelledby={ariaLabel ? undefined : triggerId} className="fixed z-[1000] overflow-y-auto overscroll-contain rounded-xl border border-[#E4E7EC] bg-white p-1.5 shadow-[0_12px_36px_-8px_rgba(28,36,52,0.24)] [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent]" style={{ left: position.left, top: position.top, bottom: position.bottom, width: position.width, maxHeight: position.maxHeight }} onClick={(event) => { event.preventDefault(); event.stopPropagation(); }} onPointerDown={(event) => event.preventDefault()}>
      {options.length === 0 && <div className="px-3 py-3 text-xs text-[#667085]">Нет доступных вариантов</div>}
      {options.map((option, index) => <div key={option.value} id={`${listId}-${index}`} data-index={index} role="option" aria-selected={option.value === selectedValue} aria-disabled={option.disabled} onPointerMove={() => { if (!option.disabled) setActive(index); }} onClick={() => choose(index)} className={cn("flex min-h-10 cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-xs leading-5 transition-colors", option.value === selectedValue ? "font-semibold text-brand" : "text-[#475467]", active === index && "bg-[#EEF0FF]", option.disabled && "cursor-not-allowed opacity-40")}><span className="min-w-0 flex-1 break-words">{option.label}</span>{option.value === selectedValue && <Check aria-hidden className="size-4 shrink-0 text-brand" />}</div>)}
    </div>, document.body)}
  </>;
}
