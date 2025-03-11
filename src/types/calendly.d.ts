
interface Calendly {
  initInlineWidget: (options: {
    url: string;
    parentElement: HTMLElement | null;
    prefill?: {
      name?: string;
      email?: string;
      guests?: number;
    };
    styles?: {
      height?: string;
    };
  }) => void;
}

interface Window {
  Calendly: Calendly;
}
