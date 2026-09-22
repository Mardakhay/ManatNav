declare module "lucide-react" {
  import type { ComponentType, SVGProps } from "react";

  interface LucideProps extends SVGProps<SVGSVGElement> {
    size?: string | number;
    strokeWidth?: string | number;
  }

  export const Activity: ComponentType<LucideProps>;
  export const ArrowDownUp: ComponentType<LucideProps>;
  export const Check: ComponentType<LucideProps>;
  export const CircleDollarSign: ComponentType<LucideProps>;
  export const Copy: ComponentType<LucideProps>;
  export const Moon: ComponentType<LucideProps>;
  export const Package: ComponentType<LucideProps>;
  export const Plus: ComponentType<LucideProps>;
  export const RefreshCw: ComponentType<LucideProps>;
  export const ShoppingBag: ComponentType<LucideProps>;
  export const Sun: ComponentType<LucideProps>;
  export const Trash2: ComponentType<LucideProps>;
}
