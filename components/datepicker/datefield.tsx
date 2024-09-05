import React, { useRef } from "react";
import { useDateFieldState } from "react-stately";
import {
	AriaDateFieldProps,
	DateValue,
	useDateField,
	useDateSegment,
	useLocale,
} from "react-aria";
import { createCalendar } from "@internationalized/date";

const DateField: React.FC<AriaDateFieldProps<DateValue>> = (props) => {
	const { locale } = useLocale();
	const state = useDateFieldState({
		...props,
		locale,
		createCalendar,
	});

	const ref = useRef<HTMLDivElement>(null);
	const { labelProps, fieldProps } = useDateField(props, state, ref);

	return (
		<div className="wrapper w-full px-2">
			<span {...labelProps}>{props.label}</span>
			<div {...fieldProps} ref={ref} className="field flex">
				{state.segments.map((segment, i) => (
					<DateSegment key={i} segment={segment} state={state} />
				))}
				{state.isInvalid && <span aria-hidden="true">🚫</span>}
			</div>
		</div>
	);
};

interface DateSegmentProps {
	segment: any; // Replace `any` with the appropriate type for `segment`
	state: any; // Replace `any` with the appropriate type for `state`
}

const DateSegment: React.FC<DateSegmentProps> = ({ segment, state }) => {
	const ref = useRef<HTMLDivElement>(null);
	const { segmentProps } = useDateSegment(segment, state, ref);

	return (
		<div
			{...segmentProps}
			ref={ref}
			className={`segment ${
				segment.isPlaceholder ? "placeholder" : ""
			} p-1 px-2 focus:outline-none focus:bg-green-600 cursor-default focus:text-white rounded-sm focus:font-bold`}
		>
			{segment.text}
		</div>
	);
};

export default DateField;
