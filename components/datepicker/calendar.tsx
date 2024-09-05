import React, { useRef } from "react";
import { useCalendar, useCalendarCell, useCalendarGrid } from "react-aria";
import { useCalendarState } from "react-stately";
import {
	createCalendar,
	getWeeksInMonth,
	CalendarDate,
} from "@internationalized/date";
import { useLocale } from "react-aria"; // Ensure this import is correct
import Button from "./button";

interface CalendarProps {
	// Define the props expected for the Calendar component
}

const Calendar: React.FC<CalendarProps> = (props) => {
	const { locale } = useLocale();
	const state = useCalendarState({
		...props,
		locale,
		createCalendar,
	});

	const { calendarProps, prevButtonProps, nextButtonProps, title } =
		useCalendar(props, state);

	return (
		<div {...calendarProps} className="calendar">
			<div className="header">
				<h2>{title}</h2>
				<Button {...prevButtonProps}>&lt;</Button>
				<Button {...nextButtonProps}>&gt;</Button>
			</div>
			<CalendarGrid state={state} />
		</div>
	);
};

interface CalendarGridProps {
	state: ReturnType<typeof useCalendarState>;
	// Add any additional props needed
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ state, ...props }) => {
	const { locale } = useLocale();
	const { gridProps, headerProps, weekDays } = useCalendarGrid(props, state);

	// Get the number of weeks in the month so we can render the proper number of rows.
	const weeksInMonth = getWeeksInMonth(state.visibleRange.start, locale);

	return (
		<table {...gridProps}>
			<thead {...headerProps}>
				<tr>
					{weekDays.map((day, index) => (
						<th key={index}>{day}</th>
					))}
				</tr>
			</thead>
			<tbody>
				{[...new Array(weeksInMonth).keys()].map((weekIndex) => (
					<tr key={weekIndex}>
						{state
							.getDatesInWeek(weekIndex)
							.map((date, i) =>
								date ? (
									<CalendarCell
										key={i}
										state={state}
										date={date}
									/>
								) : (
									<td key={i} />
								)
							)}
					</tr>
				))}
			</tbody>
		</table>
	);
};

interface CalendarCellProps {
	state: ReturnType<typeof useCalendarState>;
	date: CalendarDate; // Adjust the type based on the date object used
}

const CalendarCell: React.FC<CalendarCellProps> = ({ state, date }) => {
	const ref = useRef<HTMLDivElement>(null);
	const {
		cellProps,
		buttonProps,
		isSelected,
		isOutsideVisibleRange,
		isDisabled,
		isUnavailable,
		formattedDate,
	} = useCalendarCell({ date }, state, ref);

	return (
		<td {...cellProps}>
			<div
				{...buttonProps}
				ref={ref}
				hidden={isOutsideVisibleRange}
				className={`cell ${isSelected ? "selected" : ""} ${
					isDisabled ? "disabled" : ""
				} ${isUnavailable ? "unavailable" : ""}`}
			>
				{formattedDate}
			</div>
		</td>
	);
};

export default Calendar;
