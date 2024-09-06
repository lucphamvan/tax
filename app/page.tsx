"use client";
import DatePicker from "@/components/datepicker/datepicker";
import { Card } from "@/core/card";
import { getInvoiceData } from "@/service/invoice";
import { formatDate, getDate, downloadTextFile } from "@/utils";
import { Box, Button, Flex, Heading, Progress } from "@radix-ui/themes";
import Cookies from "js-cookie";
import { useState } from "react";
import { DateValue } from "react-aria";

export default function Home() {
  const [percent, setPercent] = useState("0");
  const [disable, setDisable] = useState(false);
  const [fromDate, setFromDate] = useState<DateValue>();
  const [toDate, setToDate] = useState<DateValue>();

  // handle download data
  const getData = () => {
    const from = formatDate(getDate(fromDate) || new Date());
    const to = formatDate(getDate(toDate) || new Date());

    const token = Cookies.get("token") || "";
    setDisable(true);
    getInvoiceData(token, from, to, setPercent)
      .then((content) => {
        downloadTextFile(content || "", from, to);
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
      <Box>
        <Card size="3" className="px-5 py-4">
          <Flex direction="column" gap="4" className="min-w-[320px]">
            <Heading size="5">Lấy dữ liệu hóa đơn</Heading>
            <Box>
              <DatePicker
                onChange={(date) => {
                  setFromDate(date);
                }}
                label="Từ ngày"
              />
            </Box>
            <Box className="mb-3">
              <DatePicker
                onChange={(date) => setToDate(date)}
                label="Đến ngày"
              />
            </Box>

            <Button disabled={disable} onClick={getData}>
              Lấy dữ liệu
            </Button>
            {disable && <Progress value={Number(percent)} />}
          </Flex>
        </Card>
      </Box>
    </Flex>
  );
}
