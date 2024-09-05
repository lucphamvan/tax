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
			<div {...underlayProps} style={{ position: "fixed", inset: 0 }} />
			<div
				{...popoverProps}
				ref={popoverRef}
				style={{
					...popoverProps.style,
					background: "var(--page-background)",
					border: "1px solid gray",
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
