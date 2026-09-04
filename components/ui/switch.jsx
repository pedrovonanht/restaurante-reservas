import * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";

import { cn } from "lib/utils";

function Switch({ className, ...props }) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border border-transparent outline-none transition-colors",
        "focus-visible:ring-[3px] focus-visible:ring-accent-soft",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:bg-success data-[state=unchecked]:bg-[#d9d2c4]",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-[22px] rounded-full bg-white shadow-sm ring-0 transition-transform",
          "data-[state=checked]:translate-x-[22px] data-[state=unchecked]:translate-x-[2px]",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
