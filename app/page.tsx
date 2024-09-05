"use client";
import DatePicker from "@/components/datepicker/datepicker";
import { Card } from "@/core/card";
import { getInvoiceData } from "@/service/invoice";
import { Box, Button, Flex, Progress, Text } from "@radix-ui/themes";
import Cookies from "js-cookie";
import { useState } from "react";

function downloadTextFile(textContent: string, from: string, to: string) {
	// Create a blob with the file content
	const blob = new Blob([textContent], { type: "text/plain" });

	// Create a link element
	const link = document.createElement("a");

	// Create a URL for the blob and set it as the href attribute
	link.href = URL.createObjectURL(blob);

	// Set the download attribute with the filename
	link.download = `dulieu_${from}_${to}.csv`;

	// Append the link to the body (it won't be visible)
	document.body.appendChild(link);

	// Programmatically click the link to trigger the download
	link.click();

	// Remove the link from the document
	document.body.removeChild(link);
}

export default function Home() {
	const [percent, setPercent] = useState("0");
	const [disable, setDisable] = useState(false);
	// handle download data
	const getData = () => {
		const token = Cookies.get("token") || "";
		setDisable(true);
		getInvoiceData(token, "02-08-2024", "03-08-2024", setPercent)
			.then((content) => {
				downloadTextFile(content || "", "02-08-2024", "03-08-2024");
			})
			.finally(() => {
				setDisable(false);
			});
	};

	return (
		<Flex
			height="100vh"
			width="100%"
			direction="column"
			justify="center"
			align="center"
		>
			<Box maxWidth="400px" minWidth="300px">
				<Card size="3">
					<Flex direction="column" gap="4">
						<Box>
							<Text>Từ ngày</Text>
							<Box>
								<input
									style={{
										width: "100%",
										padding: "0.5rem 0.5rem",
										borderWidth: "1px",
										borderColor: "gray",
										borderRadius: "4px",
									}}
									type="date"
									lang="vi"
								/>
							</Box>
						</Box>
						<Box>
							<Text>Đến ngày</Text>
							<Box>
								<input style={{ width: "100%" }} type="date" />
							</Box>
						</Box>
						<Button disabled={disable} onClick={getData}>
							Lấy dữ liệu
						</Button>
						{disable && <Progress value={Number(percent)} />}
						<DatePicker label="Chọn ngày" />
					</Flex>
				</Card>
			</Box>
		</Flex>
	);
}
