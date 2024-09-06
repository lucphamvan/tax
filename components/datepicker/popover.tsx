import React, { useRef } from "react";
import { DismissButton, Overlay, usePopover } from "react-aria";
import type { AriaPopoverProps } from "react-aria";
import type { OverlayTriggerState } from "react-stately";

interface PopoverProps extends Omit<AriaPopoverProps, "popoverRef"> {
  children: React.ReactNode;
  state: OverlayTriggerState;
}

const Popover: React.FC<PopoverProps> = ({ children, state, ...props }) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const { popoverProps, underlayProps } = usePopover(
    {
      ...props,
      popoverRef,
    },
    state
  );

  return (
    <Overlay>
      <div {...underlayProps} style={{ position: "fixed", inset: 100 }} />
      <div
        {...popoverProps}
        ref={popoverRef}
        style={{
          ...popoverProps.style,
          backgroundColor: "#F7F5F2",
          border: "1px solid #C4A488",
          borderRadius: "4px",
          margin: "10px auto",
          width: "fit-content",
          overflow: "auto",
        }}
      >
        <DismissButton onDismiss={state.close} />
        {children}
        <DismissButton onDismiss={state.close} />
      </div>
    </Overlay>
  );
};

export default Popover;
