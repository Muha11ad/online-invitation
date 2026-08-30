"use client";

import * as React from "react";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";

import { cn } from "@/shared/lib/utils";

const Menu = MenuPrimitive.Root;
const MenuTrigger = MenuPrimitive.Trigger;
const MenuRadioGroup = MenuPrimitive.RadioGroup;
const MenuRadioItem = MenuPrimitive.RadioItem;

function MenuContent({
  className,
  // `isolate` gives the Positioner its own stacking context, which means the
  // Popup's z-index only ever competes within that context — a caller-supplied
  // z-index on the Popup can't escape it. Callers that need to clear some
  // other fixed-position, non-portaled sibling (e.g. a full-screen overlay)
  // must raise the Positioner's own stacking level via this prop, not just
  // the Popup's className.
  positionerClassName,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  ...props
}: MenuPrimitive.Popup.Props &
  Pick<MenuPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset"> & {
    positionerClassName?: string;
  }) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        className={cn("isolate z-50", positionerClassName)}
      >
        <MenuPrimitive.Popup
          data-slot="menu-content"
          className={cn("outline-none", className)}
          {...props}
        >
          {children}
        </MenuPrimitive.Popup>
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
}

export { Menu, MenuTrigger, MenuContent, MenuRadioGroup, MenuRadioItem };
